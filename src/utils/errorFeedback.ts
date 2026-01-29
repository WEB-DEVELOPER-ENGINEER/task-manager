/**
 * Error Feedback System
 *
 * Provides centralized error handling and user feedback mechanisms.
 * Supports both console logging for development and UI feedback for users.
 */

export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface ErrorFeedback {
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  id: string;
}

/**
 * Error feedback listeners
 */
type ErrorListener = (feedback: ErrorFeedback) => void;
const errorListeners: ErrorListener[] = [];

/**
 * Subscribe to error feedback events
 */
export const subscribeToErrors = (listener: ErrorListener): (() => void) => {
  errorListeners.push(listener);

  // Return unsubscribe function
  return () => {
    const index = errorListeners.indexOf(listener);
    if (index > -1) {
      errorListeners.splice(index, 1);
    }
  };
};

/**
 * Generate unique ID for error feedback
 */
const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Notify all listeners of error feedback
 */
const notifyListeners = (feedback: ErrorFeedback): void => {
  errorListeners.forEach(listener => {
    try {
      listener(feedback);
    } catch (error) {
      console.error('Error in error listener:', error);
    }
  });
};

/**
 * Report an error with user-friendly feedback
 */
export const reportError = (
  message: string,
  severity: ErrorSeverity = 'error',
  details?: unknown
): void => {
  const feedback: ErrorFeedback = {
    message,
    severity,
    timestamp: Date.now(),
    id: generateErrorId(),
  };

  // Log to console in development
  if (__DEV__) {
    const logFn =
      severity === 'error' ? console.error : severity === 'warning' ? console.warn : console.log;
    logFn(`[${severity.toUpperCase()}] ${message}`, details);
  }

  // Notify UI listeners
  notifyListeners(feedback);
};

/**
 * User-friendly error messages for common errors
 */
export const ErrorMessages = {
  INVALID_TASK_DESCRIPTION: 'Please enter a valid task description',
  TASK_TOO_LONG: 'Task description is too long',
  INVALID_PRIORITY: 'Please select a valid priority level',
  INVALID_DUE_DATE: 'Please select a valid due date',
  INVALID_TAGS: 'Please check your tags',
  TASK_NOT_FOUND: 'Task not found',
  OPERATION_FAILED: 'Operation failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
};

/**
 * Map validation errors to user-friendly messages
 */
export const mapValidationError = (error: string): string => {
  if (error.includes('empty')) {
    return ErrorMessages.INVALID_TASK_DESCRIPTION;
  }
  if (error.includes('too long')) {
    return ErrorMessages.TASK_TOO_LONG;
  }
  if (error.includes('priority')) {
    return ErrorMessages.INVALID_PRIORITY;
  }
  if (error.includes('due date')) {
    return ErrorMessages.INVALID_DUE_DATE;
  }
  if (error.includes('tag')) {
    return ErrorMessages.INVALID_TAGS;
  }
  if (error.includes('not found') || error.includes('non-existent')) {
    return ErrorMessages.TASK_NOT_FOUND;
  }

  return ErrorMessages.UNKNOWN_ERROR;
};
