/**
 * Application Reducer
 *
 * Pure reducer function that handles all state transitions.
 * Ensures immutable updates for all state changes.
 * Validates all actions before processing.
 */

import { AppState, Action } from '../types/State';
import { generateId } from '../utils/idGenerator';
import { validateAction, validateReorderIndices } from '../utils/validation';
import { reportError, mapValidationError } from '../utils/errorFeedback';

/**
 * Main application reducer
 * Processes actions and returns new state without mutating the original
 */
export function appReducer(state: AppState, action: Action): AppState {
  // Validate action before processing
  const validationResult = validateAction(action);
  if (!validationResult.isValid) {
    const userMessage = mapValidationError(validationResult.error || 'Unknown error');
    // Defer error reporting to avoid updating during render
    setTimeout(() => {
      reportError(userMessage, 'error', { action, validationError: validationResult.error });
    }, 0);
    // Return state unchanged for invalid actions
    return state;
  }

  switch (action.type) {
    case 'ADD_TASK': {
      console.log('Reducer ADD_TASK - payload:', action.payload);
      console.log('Reducer ADD_TASK - tags:', action.payload.tags);
      
      const newTask = {
        id: generateId(),
        description: action.payload.description.trim(),
        completed: false,
        createdAt: Date.now(),
        priority: action.payload.priority || 'medium',
        dueDate: action.payload.dueDate ?? null,
        tags: action.payload.tags || [],
      };

      console.log('Reducer ADD_TASK - created task:', newTask);

      return {
        ...state,
        tasks: [...state.tasks, newTask],
      };
    }

    case 'UPDATE_TASK': {
      // Verify task exists
      const taskExists = state.tasks.some(task => task.id === action.payload.id);
      if (!taskExists) {
        setTimeout(() => {
          reportError('Task not found', 'warning', { taskId: action.payload.id });
        }, 0);
        return state;
      }

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
      };
    }

    case 'DELETE_TASK': {
      // Verify task exists
      const taskExists = state.tasks.some(task => task.id === action.payload);
      if (!taskExists) {
        setTimeout(() => {
          reportError('Task not found', 'warning', { taskId: action.payload });
        }, 0);
        return state;
      }

      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        ui: {
          ...state.ui,
          // Remove from selected tasks if it was selected
          selectedTaskIds: new Set(
            Array.from(state.ui.selectedTaskIds).filter(id => id !== action.payload)
          ),
          // Clear editing if this task was being edited
          editingTaskId: state.ui.editingTaskId === action.payload ? null : state.ui.editingTaskId,
        },
      };
    }

    case 'TOGGLE_COMPLETE': {
      // Verify task exists
      const taskExists = state.tasks.some(task => task.id === action.payload);
      if (!taskExists) {
        setTimeout(() => {
          reportError('Task not found', 'warning', { taskId: action.payload });
        }, 0);
        return state;
      }

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, completed: !task.completed } : task
        ),
      };
    }

    case 'REORDER_TASKS': {
      const { fromIndex, toIndex } = action.payload;

      // Validate indices
      const indicesValidation = validateReorderIndices(fromIndex, toIndex, state.tasks.length);
      if (!indicesValidation.isValid) {
        setTimeout(() => {
          reportError('Cannot reorder tasks', 'warning', {
            error: indicesValidation.error,
            fromIndex,
            toIndex,
            tasksLength: state.tasks.length,
          });
        }, 0);
        return state;
      }

      const newTasks = [...state.tasks];
      const [removed] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, removed);

      return {
        ...state,
        tasks: newTasks,
      };
    }

    case 'SET_VIEW': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedView: action.payload,
        },
      };
    }

    case 'TOGGLE_MULTI_SELECT': {
      return {
        ...state,
        ui: {
          ...state.ui,
          multiSelectMode: !state.ui.multiSelectMode,
          // Clear selections when exiting multi-select mode
          selectedTaskIds: state.ui.multiSelectMode ? new Set() : state.ui.selectedTaskIds,
        },
      };
    }

    case 'TOGGLE_TASK_SELECTION': {
      // Verify task exists
      const taskExists = state.tasks.some(task => task.id === action.payload);
      if (!taskExists) {
        setTimeout(() => {
          reportError('Task not found', 'warning', { taskId: action.payload });
        }, 0);
        return state;
      }

      const newSelectedIds = new Set(state.ui.selectedTaskIds);

      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else {
        newSelectedIds.add(action.payload);
      }

      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTaskIds: newSelectedIds,
        },
      };
    }

    case 'CLEAR_SELECTIONS': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTaskIds: new Set(),
        },
      };
    }

    case 'SET_REORDER_MODE': {
      return {
        ...state,
        ui: {
          ...state.ui,
          reorderMode: action.payload,
        },
      };
    }

    case 'SET_EDITING_TASK': {
      // Verify task exists if not null
      if (action.payload !== null) {
        const taskExists = state.tasks.some(task => task.id === action.payload);
        if (!taskExists) {
          setTimeout(() => {
            reportError('Task not found', 'warning', { taskId: action.payload });
          }, 0);
          return state;
        }
      }

      return {
        ...state,
        ui: {
          ...state.ui,
          editingTaskId: action.payload,
        },
      };
    }

    case 'SET_THEME': {
      return {
        ...state,
        theme: action.payload,
      };
    }

    case 'BATCH_DELETE': {
      // Filter out non-existent task IDs
      const existingIds = new Set(state.tasks.map(task => task.id));
      const validIdsToDelete = action.payload.filter(id => existingIds.has(id));

      if (validIdsToDelete.length === 0) {
        setTimeout(() => {
          reportError('No tasks to delete', 'info');
        }, 0);
        return state;
      }

      const idsToDelete = new Set(validIdsToDelete);

      return {
        ...state,
        tasks: state.tasks.filter(task => !idsToDelete.has(task.id)),
        ui: {
          ...state.ui,
          selectedTaskIds: new Set(),
          multiSelectMode: false,
        },
      };
    }

    case 'BATCH_COMPLETE': {
      // Filter out non-existent task IDs
      const existingIds = new Set(state.tasks.map(task => task.id));
      const validIdsToComplete = action.payload.filter(id => existingIds.has(id));

      if (validIdsToComplete.length === 0) {
        setTimeout(() => {
          reportError('No tasks to complete', 'info');
        }, 0);
        return state;
      }

      const idsToComplete = new Set(validIdsToComplete);

      return {
        ...state,
        tasks: state.tasks.map(task =>
          idsToComplete.has(task.id) ? { ...task, completed: true } : task
        ),
        ui: {
          ...state.ui,
          selectedTaskIds: new Set(),
          multiSelectMode: false,
        },
      };
    }

    case 'SET_TAG_FILTER': {
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTag: action.payload,
        },
      };
    }

    default:
      return state;
  }
}
