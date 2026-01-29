import { Priority, TaskInput } from '../types/Task';
import { Action, ViewType } from '../types/State';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateTaskDescription = (description: string): ValidationResult => {
  if (typeof description !== 'string') {
    return {
      isValid: false,
      error: 'Task description must be a string',
    };
  }

  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Task description cannot be empty',
    };
  }

  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'Task description too long (max 500 characters)',
    };
  }

  return {
    isValid: true,
  };
};

export const validatePriority = (priority: unknown): priority is Priority => {
  return (
    priority === 'low' || priority === 'medium' || priority === 'high' || priority === 'critical'
  );
};

export const validateDueDate = (dueDate: unknown): ValidationResult => {
  if (dueDate === null || dueDate === undefined) {
    return { isValid: true };
  }

  if (typeof dueDate !== 'number') {
    return {
      isValid: false,
      error: 'Due date must be a number (Unix timestamp) or null',
    };
  }

  if (dueDate < 0) {
    return {
      isValid: false,
      error: 'Due date cannot be negative',
    };
  }

  if (!Number.isFinite(dueDate)) {
    return {
      isValid: false,
      error: 'Due date must be a finite number',
    };
  }

  return { isValid: true };
};

export const validateTags = (tags: unknown): ValidationResult => {
  if (tags === undefined) {
    return { isValid: true };
  }

  if (!Array.isArray(tags)) {
    return {
      isValid: false,
      error: 'Tags must be an array',
    };
  }

  if (tags.length > 20) {
    return {
      isValid: false,
      error: 'Too many tags (max 20)',
    };
  }

  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return {
        isValid: false,
        error: 'All tags must be strings',
      };
    }

    if (tag.trim().length === 0) {
      return {
        isValid: false,
        error: 'Tags cannot be empty',
      };
    }

    if (tag.length > 50) {
      return {
        isValid: false,
        error: 'Tag too long (max 50 characters)',
      };
    }
  }

  return { isValid: true };
};

export const validateTaskInput = (input: TaskInput): ValidationResult => {
  // Validate description
  const descResult = validateTaskDescription(input.description);
  if (!descResult.isValid) {
    return descResult;
  }

  // Validate priority if provided
  if (input.priority !== undefined && !validatePriority(input.priority)) {
    return {
      isValid: false,
      error: 'Invalid priority level',
    };
  }

  // Validate due date if provided
  const dueDateResult = validateDueDate(input.dueDate);
  if (!dueDateResult.isValid) {
    return dueDateResult;
  }

  // Validate tags if provided
  const tagsResult = validateTags(input.tags);
  if (!tagsResult.isValid) {
    return tagsResult;
  }

  return { isValid: true };
};

export const validateTaskId = (id: unknown): ValidationResult => {
  if (typeof id !== 'string') {
    return {
      isValid: false,
      error: 'Task ID must be a string',
    };
  }

  if (id.trim().length === 0) {
    return {
      isValid: false,
      error: 'Task ID cannot be empty',
    };
  }

  return { isValid: true };
};

export const validateViewType = (view: unknown): view is ViewType => {
  return (
    view === 'all' ||
    view === 'today' ||
    view === 'upcoming' ||
    view === 'priority' ||
    view === 'completed'
  );
};

export const validateReorderIndices = (
  fromIndex: unknown,
  toIndex: unknown,
  arrayLength: number
): ValidationResult => {
  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
    return {
      isValid: false,
      error: 'Indices must be numbers',
    };
  }

  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
    return {
      isValid: false,
      error: 'Indices must be integers',
    };
  }

  if (fromIndex < 0 || fromIndex >= arrayLength) {
    return {
      isValid: false,
      error: 'From index out of bounds',
    };
  }

  if (toIndex < 0 || toIndex >= arrayLength) {
    return {
      isValid: false,
      error: 'To index out of bounds',
    };
  }

  return { isValid: true };
};

export const validateAction = (action: Action): ValidationResult => {
  if (!action || typeof action !== 'object') {
    return {
      isValid: false,
      error: 'Action must be an object',
    };
  }

  if (!action.type || typeof action.type !== 'string') {
    return {
      isValid: false,
      error: 'Action must have a type string',
    };
  }

  // Validate specific action payloads
  switch (action.type) {
    case 'ADD_TASK':
      if (!action.payload || typeof action.payload !== 'object') {
        return {
          isValid: false,
          error: 'ADD_TASK requires a payload object',
        };
      }
      return validateTaskInput(action.payload);

    case 'UPDATE_TASK':
      if (!action.payload || typeof action.payload !== 'object') {
        return {
          isValid: false,
          error: 'UPDATE_TASK requires a payload object',
        };
      }
      const idResult = validateTaskId(action.payload.id);
      if (!idResult.isValid) {
        return idResult;
      }
      if (!action.payload.updates || typeof action.payload.updates !== 'object') {
        return {
          isValid: false,
          error: 'UPDATE_TASK requires updates object',
        };
      }
      break;

    case 'DELETE_TASK':
    case 'TOGGLE_COMPLETE':
    case 'TOGGLE_TASK_SELECTION':
      return validateTaskId(action.payload);

    case 'REORDER_TASKS':
      if (!action.payload || typeof action.payload !== 'object') {
        return {
          isValid: false,
          error: 'REORDER_TASKS requires a payload object',
        };
      }
      // Note: array length validation happens in reducer
      break;

    case 'SET_VIEW':
      if (!validateViewType(action.payload)) {
        return {
          isValid: false,
          error: 'Invalid view type',
        };
      }
      break;

    case 'SET_REORDER_MODE':
      if (typeof action.payload !== 'boolean') {
        return {
          isValid: false,
          error: 'SET_REORDER_MODE requires boolean payload',
        };
      }
      break;

    case 'SET_EDITING_TASK':
      if (action.payload !== null) {
        const result = validateTaskId(action.payload);
        if (!result.isValid) {
          return result;
        }
      }
      break;

    case 'SET_TAG_FILTER':
      if (action.payload !== null && typeof action.payload !== 'string') {
        return {
          isValid: false,
          error: 'SET_TAG_FILTER requires string or null payload',
        };
      }
      break;

    case 'BATCH_DELETE':
    case 'BATCH_COMPLETE':
      if (!Array.isArray(action.payload)) {
        return {
          isValid: false,
          error: 'Batch actions require array payload',
        };
      }
      for (const id of action.payload) {
        const result = validateTaskId(id);
        if (!result.isValid) {
          return result;
        }
      }
      break;

    case 'SET_THEME':
      if (!action.payload || typeof action.payload !== 'object') {
        return {
          isValid: false,
          error: 'SET_THEME requires theme config object',
        };
      }
      break;

    case 'TOGGLE_MULTI_SELECT':
    case 'CLEAR_SELECTIONS':
      // No payload validation needed
      break;

    default:
      return {
        isValid: false,
        error: `Unknown action type: ${action.type}`,
      };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): ValidationResult => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Task description cannot be empty',
    };
  }

  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: 'Task description too long (max 500 characters)',
    };
  }

  return {
    isValid: true,
  };
};
