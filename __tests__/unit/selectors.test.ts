/**
 * Unit tests for memoized selectors
 */

import {
  createSelector,
  selectTodayTasks,
  selectUpcomingTasks,
  selectHighPriorityTasks,
  selectCompletedTasks,
  selectAllTasks,
  selectTasksByView,
} from '../../src/state/selectors';
import { AppState } from '../../src/types/State';
import { Task } from '../../src/types/Task';
import { lightTheme } from '../../src/theme/themes';

describe('Selector Utilities', () => {
  describe('createSelector', () => {
    it('should memoize results when input does not change', () => {
      const inputSelector = (state: AppState) => state.tasks;
      const resultFn = jest.fn((tasks: Task[]) => tasks.length);

      const selector = createSelector(inputSelector, resultFn);

      const state: AppState = {
        tasks: [],
        ui: {
          selectedView: 'all',
          multiSelectMode: false,
          selectedTaskIds: new Set(),
          reorderMode: false,
          editingTaskId: null,
        },
        theme: lightTheme,
      };

      // First call
      const result1 = selector(state);
      expect(result1).toBe(0);
      expect(resultFn).toHaveBeenCalledTimes(1);

      // Second call with same state
      const result2 = selector(state);
      expect(result2).toBe(0);
      expect(resultFn).toHaveBeenCalledTimes(1); // Should not call again
    });

    it('should recompute when input changes', () => {
      const inputSelector = (state: AppState) => state.tasks;
      const resultFn = jest.fn((tasks: Task[]) => tasks.length);

      const selector = createSelector(inputSelector, resultFn);

      const state1: AppState = {
        tasks: [],
        ui: {
          selectedView: 'all',
          multiSelectMode: false,
          selectedTaskIds: new Set(),
          reorderMode: false,
          editingTaskId: null,
        },
        theme: lightTheme,
      };

      const state2: AppState = {
        ...state1,
        tasks: [
          {
            id: '1',
            description: 'Test',
            completed: false,
            createdAt: Date.now(),
            priority: 'medium',
            dueDate: null,
            tags: [],
          },
        ],
      };

      // First call
      const result1 = selector(state1);
      expect(result1).toBe(0);
      expect(resultFn).toHaveBeenCalledTimes(1);

      // Second call with different tasks
      const result2 = selector(state2);
      expect(result2).toBe(1);
      expect(resultFn).toHaveBeenCalledTimes(2); // Should recompute
    });
  });
});

describe('Smart View Selectors', () => {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 5);

  const farFuture = new Date(today);
  farFuture.setDate(farFuture.getDate() + 10);

  const mockTasks: Task[] = [
    {
      id: '1',
      description: 'Overdue task',
      completed: false,
      createdAt: now,
      priority: 'medium',
      dueDate: yesterday.getTime(),
      tags: [],
    },
    {
      id: '2',
      description: 'Due today',
      completed: false,
      createdAt: now,
      priority: 'high',
      dueDate: today.getTime(),
      tags: [],
    },
    {
      id: '3',
      description: 'Due tomorrow',
      completed: false,
      createdAt: now,
      priority: 'low',
      dueDate: tomorrow.getTime(),
      tags: [],
    },
    {
      id: '4',
      description: 'Due next week',
      completed: false,
      createdAt: now,
      priority: 'critical',
      dueDate: nextWeek.getTime(),
      tags: [],
    },
    {
      id: '5',
      description: 'Due far future',
      completed: false,
      createdAt: now,
      priority: 'medium',
      dueDate: farFuture.getTime(),
      tags: [],
    },
    {
      id: '6',
      description: 'Completed task',
      completed: true,
      createdAt: now,
      priority: 'high',
      dueDate: today.getTime(),
      tags: [],
    },
    {
      id: '7',
      description: 'No due date',
      completed: false,
      createdAt: now,
      priority: 'high',
      dueDate: null,
      tags: [],
    },
  ];

  const mockState: AppState = {
    tasks: mockTasks,
    ui: {
      selectedView: 'all',
      multiSelectMode: false,
      selectedTaskIds: new Set(),
      reorderMode: false,
      editingTaskId: null,
    },
    theme: lightTheme,
  };

  describe('selectTodayTasks', () => {
    it('should return tasks due today or overdue', () => {
      const result = selectTodayTasks(mockState);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('1'); // Overdue
      expect(result.map(t => t.id)).toContain('2'); // Due today
    });

    it('should exclude completed tasks', () => {
      const result = selectTodayTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('6'); // Completed
    });

    it('should exclude tasks without due dates', () => {
      const result = selectTodayTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('7'); // No due date
    });
  });

  describe('selectUpcomingTasks', () => {
    it('should return tasks due in the next 7 days', () => {
      const result = selectUpcomingTasks(mockState);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('3'); // Tomorrow
      expect(result.map(t => t.id)).toContain('4'); // Next week
    });

    it('should exclude tasks due today or overdue', () => {
      const result = selectUpcomingTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('1'); // Overdue
      expect(result.map(t => t.id)).not.toContain('2'); // Today
    });

    it('should exclude tasks due beyond 7 days', () => {
      const result = selectUpcomingTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('5'); // Far future
    });
  });

  describe('selectHighPriorityTasks', () => {
    it('should return high and critical priority tasks', () => {
      const result = selectHighPriorityTasks(mockState);

      expect(result).toHaveLength(3);
      expect(result.map(t => t.id)).toContain('2'); // High priority
      expect(result.map(t => t.id)).toContain('4'); // Critical priority
      expect(result.map(t => t.id)).toContain('7'); // High priority, no due date
    });

    it('should exclude completed tasks', () => {
      const result = selectHighPriorityTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('6'); // Completed high priority
    });

    it('should exclude low and medium priority tasks', () => {
      const result = selectHighPriorityTasks(mockState);

      expect(result.map(t => t.id)).not.toContain('1'); // Medium
      expect(result.map(t => t.id)).not.toContain('3'); // Low
    });
  });

  describe('selectCompletedTasks', () => {
    it('should return only completed tasks', () => {
      const result = selectCompletedTasks(mockState);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('6');
    });
  });

  describe('selectAllTasks', () => {
    it('should return all tasks', () => {
      const result = selectAllTasks(mockState);

      expect(result).toHaveLength(7);
    });
  });

  describe('selectTasksByView', () => {
    it('should return today tasks for today view', () => {
      const state = { ...mockState, ui: { ...mockState.ui, selectedView: 'today' as const } };
      const result = selectTasksByView(state);

      expect(result).toHaveLength(2);
    });

    it('should return upcoming tasks for upcoming view', () => {
      const state = { ...mockState, ui: { ...mockState.ui, selectedView: 'upcoming' as const } };
      const result = selectTasksByView(state);

      expect(result).toHaveLength(2);
    });

    it('should return high priority tasks for priority view', () => {
      const state = { ...mockState, ui: { ...mockState.ui, selectedView: 'priority' as const } };
      const result = selectTasksByView(state);

      expect(result).toHaveLength(3);
    });

    it('should return completed tasks for completed view', () => {
      const state = { ...mockState, ui: { ...mockState.ui, selectedView: 'completed' as const } };
      const result = selectTasksByView(state);

      expect(result).toHaveLength(1);
    });

    it('should return all tasks for all view', () => {
      const state = { ...mockState, ui: { ...mockState.ui, selectedView: 'all' as const } };
      const result = selectTasksByView(state);

      expect(result).toHaveLength(7);
    });
  });
});
