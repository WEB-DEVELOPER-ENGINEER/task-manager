/**
 * Multi-Select Mode Tests
 *
 * Tests for multi-select functionality including state management,
 * UI interactions, and batch operations.
 */

import { appReducer } from '../../src/state/reducer';
import { AppState } from '../../src/types/State';
import { defaultTheme } from '../../src/theme/themes';

describe('Multi-Select Mode', () => {
  const initialState: AppState = {
    tasks: [
      {
        id: '1',
        description: 'Task 1',
        completed: false,
        createdAt: Date.now(),
        priority: 'medium',
        dueDate: null,
        tags: [],
      },
      {
        id: '2',
        description: 'Task 2',
        completed: false,
        createdAt: Date.now(),
        priority: 'high',
        dueDate: null,
        tags: [],
      },
      {
        id: '3',
        description: 'Task 3',
        completed: true,
        createdAt: Date.now(),
        priority: 'low',
        dueDate: null,
        tags: [],
      },
    ],
    ui: {
      selectedView: 'all',
      multiSelectMode: false,
      selectedTaskIds: new Set(),
      reorderMode: false,
      editingTaskId: null,
    },
    theme: defaultTheme,
  };

  describe('Reducer - Multi-Select State', () => {
    it('should toggle multi-select mode on', () => {
      const action = { type: 'TOGGLE_MULTI_SELECT' as const };
      const newState = appReducer(initialState, action);

      expect(newState.ui.multiSelectMode).toBe(true);
      expect(newState.ui.selectedTaskIds.size).toBe(0);
    });

    it('should toggle multi-select mode off and clear selections', () => {
      const stateWithSelections: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
          selectedTaskIds: new Set(['1', '2']),
        },
      };

      const action = { type: 'TOGGLE_MULTI_SELECT' as const };
      const newState = appReducer(stateWithSelections, action);

      expect(newState.ui.multiSelectMode).toBe(false);
      expect(newState.ui.selectedTaskIds.size).toBe(0);
    });

    it('should toggle task selection', () => {
      const stateWithMultiSelect: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
        },
      };

      const action = { type: 'TOGGLE_TASK_SELECTION' as const, payload: '1' };
      const newState = appReducer(stateWithMultiSelect, action);

      expect(newState.ui.selectedTaskIds.has('1')).toBe(true);
      expect(newState.ui.selectedTaskIds.size).toBe(1);
    });

    it('should deselect task when toggling already selected task', () => {
      const stateWithSelection: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
          selectedTaskIds: new Set(['1']),
        },
      };

      const action = { type: 'TOGGLE_TASK_SELECTION' as const, payload: '1' };
      const newState = appReducer(stateWithSelection, action);

      expect(newState.ui.selectedTaskIds.has('1')).toBe(false);
      expect(newState.ui.selectedTaskIds.size).toBe(0);
    });

    it('should handle multiple task selections', () => {
      let state: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
        },
      };

      // Select first task
      state = appReducer(state, { type: 'TOGGLE_TASK_SELECTION', payload: '1' });
      expect(state.ui.selectedTaskIds.has('1')).toBe(true);

      // Select second task
      state = appReducer(state, { type: 'TOGGLE_TASK_SELECTION', payload: '2' });
      expect(state.ui.selectedTaskIds.has('1')).toBe(true);
      expect(state.ui.selectedTaskIds.has('2')).toBe(true);
      expect(state.ui.selectedTaskIds.size).toBe(2);
    });
  });

  describe('Reducer - Batch Operations', () => {
    it('should batch delete selected tasks', () => {
      const stateWithSelections: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
          selectedTaskIds: new Set(['1', '2']),
        },
      };

      const action = { type: 'BATCH_DELETE' as const, payload: ['1', '2'] };
      const newState = appReducer(stateWithSelections, action);

      expect(newState.tasks.length).toBe(1);
      expect(newState.tasks[0].id).toBe('3');
      expect(newState.ui.multiSelectMode).toBe(false);
      expect(newState.ui.selectedTaskIds.size).toBe(0);
    });

    it('should batch complete selected tasks', () => {
      const stateWithSelections: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
          selectedTaskIds: new Set(['1', '2']),
        },
      };

      const action = { type: 'BATCH_COMPLETE' as const, payload: ['1', '2'] };
      const newState = appReducer(stateWithSelections, action);

      expect(newState.tasks.length).toBe(3);
      expect(newState.tasks.find(t => t.id === '1')?.completed).toBe(true);
      expect(newState.tasks.find(t => t.id === '2')?.completed).toBe(true);
      expect(newState.tasks.find(t => t.id === '3')?.completed).toBe(true);
      expect(newState.ui.multiSelectMode).toBe(false);
      expect(newState.ui.selectedTaskIds.size).toBe(0);
    });

    it('should not affect unselected tasks during batch operations', () => {
      const stateWithSelections: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
          selectedTaskIds: new Set(['1']),
        },
      };

      const action = { type: 'BATCH_DELETE' as const, payload: ['1'] };
      const newState = appReducer(stateWithSelections, action);

      expect(newState.tasks.length).toBe(2);
      expect(newState.tasks.find(t => t.id === '2')).toBeDefined();
      expect(newState.tasks.find(t => t.id === '3')).toBeDefined();
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when toggling multi-select', () => {
      const originalState = { ...initialState };
      const action = { type: 'TOGGLE_MULTI_SELECT' as const };

      appReducer(initialState, action);

      expect(initialState.ui.multiSelectMode).toBe(originalState.ui.multiSelectMode);
    });

    it('should not mutate original state when toggling task selection', () => {
      const stateWithMultiSelect: AppState = {
        ...initialState,
        ui: {
          ...initialState.ui,
          multiSelectMode: true,
        },
      };
      const originalSelectedIds = stateWithMultiSelect.ui.selectedTaskIds;

      const action = { type: 'TOGGLE_TASK_SELECTION' as const, payload: '1' };
      appReducer(stateWithMultiSelect, action);

      expect(stateWithMultiSelect.ui.selectedTaskIds).toBe(originalSelectedIds);
      expect(stateWithMultiSelect.ui.selectedTaskIds.size).toBe(0);
    });
  });
});
