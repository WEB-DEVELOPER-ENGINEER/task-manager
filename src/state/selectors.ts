/**
 * Memoized Selectors
 *
 * Provides efficient derived state computation with memoization.
 * Selectors are pure functions that compute derived data from state.
 */

import { AppState } from '../types/State';
import { Task } from '../types/Task';

/**
 * Type for selector functions
 */
type Selector<T> = (state: AppState) => T;

/**
 * Type for equality comparison function
 */
type EqualityFn<T> = (prev: T, next: T) => boolean;

/**
 * Default equality function using shallow comparison
 */
function defaultEqualityFn<T>(prev: T, next: T): boolean {
  return prev === next;
}

/**
 * Equality function for arrays that compares by reference and length
 */
function arrayEqualityFn<T>(prev: T[], next: T[]): boolean {
  if (prev === next) return true;
  if (prev.length !== next.length) return false;

  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) return false;
  }

  return true;
}

/**
 * Creates a memoized selector that caches the result based on input equality
 *
 * @param inputSelector - Function to extract input from state
 * @param resultFn - Function to compute result from input
 * @param equalityFn - Optional custom equality function for input comparison
 * @returns Memoized selector function
 */
export function createSelector<Input, Result>(
  inputSelector: (state: AppState) => Input,
  resultFn: (input: Input) => Result,
  equalityFn: EqualityFn<Input> = defaultEqualityFn
): Selector<Result> {
  let lastInput: Input | undefined;
  let lastResult: Result | undefined;
  let hasRun = false;

  return (state: AppState): Result => {
    const currentInput = inputSelector(state);

    // Check if we can return cached result
    if (hasRun && lastInput !== undefined && equalityFn(lastInput, currentInput)) {
      return lastResult as Result;
    }

    // Compute new result
    const currentResult = resultFn(currentInput);

    // Cache for next time
    lastInput = currentInput;
    lastResult = currentResult;
    hasRun = true;

    return currentResult;
  };
}

/**
 * Creates a memoized selector with multiple input selectors
 *
 * @param inputSelectors - Array of functions to extract inputs from state
 * @param resultFn - Function to compute result from inputs
 * @returns Memoized selector function
 */
export function createSelectorMulti<Result>(
  inputSelectors: Array<(state: AppState) => unknown>,
  resultFn: (...inputs: unknown[]) => Result
): Selector<Result> {
  let lastInputs: unknown[] = [];
  let lastResult: Result | undefined;
  let hasRun = false;

  return (state: AppState): Result => {
    const currentInputs = inputSelectors.map(selector => selector(state));

    // Check if we can return cached result
    if (hasRun && arrayEqualityFn(lastInputs, currentInputs)) {
      return lastResult as Result;
    }

    // Compute new result
    const currentResult = resultFn(...currentInputs);

    // Cache for next time
    lastInputs = currentInputs;
    lastResult = currentResult;
    hasRun = true;

    return currentResult;
  };
}

/**
 * Export equality functions for custom comparisons
 */
export const equalityFunctions = {
  default: defaultEqualityFn,
  array: arrayEqualityFn,
};

/**
 * Smart View Selectors
 *
 * Memoized selectors for deriving filtered and sorted task views.
 * These selectors compute derived state efficiently without duplicating data.
 */

/**
 * Helper function to get start of day timestamp
 */
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Helper function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Selector for tasks due today or overdue
 *
 * Returns all incomplete tasks that are due today or have a past due date.
 * Validates: Requirements 6.1
 */
export const selectTodayTasks = createSelector(
  (state: AppState) => state.tasks,
  (tasks: Task[]): Task[] => {
    const today = startOfDay(new Date());
    const todayEnd = addDays(today, 1);

    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(task.dueDate);
      // Include tasks due today or overdue (before today)
      return dueDate < todayEnd;
    });
  },
  arrayEqualityFn
);

/**
 * Selector for tasks due in the next 7 days (excluding today)
 *
 * Returns all incomplete tasks with due dates in the upcoming week.
 * Validates: Requirements 6.2
 */
export const selectUpcomingTasks = createSelector(
  (state: AppState) => state.tasks,
  (tasks: Task[]): Task[] => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    const weekFromNow = addDays(today, 7);

    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(task.dueDate);
      // Include tasks due after today and within the next 7 days
      return dueDate >= tomorrow && dueDate <= weekFromNow;
    });
  },
  arrayEqualityFn
);

/**
 * Selector for high priority tasks
 *
 * Returns all incomplete tasks with high or critical priority.
 * Validates: Requirements 6.3
 */
export const selectHighPriorityTasks = createSelector(
  (state: AppState) => state.tasks,
  (tasks: Task[]): Task[] => {
    return tasks.filter(
      task => !task.completed && (task.priority === 'high' || task.priority === 'critical')
    );
  },
  arrayEqualityFn
);

/**
 * Selector for completed tasks
 *
 * Returns all tasks that have been marked as completed.
 * Validates: Requirements 6.4
 */
export const selectCompletedTasks = createSelector(
  (state: AppState) => state.tasks,
  (tasks: Task[]): Task[] => {
    return tasks.filter(task => task.completed);
  },
  arrayEqualityFn
);

/**
 * Selector for all tasks (pass-through for consistency)
 *
 * Returns all tasks without filtering.
 */
export const selectAllTasks = createSelector(
  (state: AppState) => state.tasks,
  (tasks: Task[]): Task[] => tasks,
  arrayEqualityFn
);

/**
 * Selector factory for getting tasks by current view
 *
 * Returns the appropriate task list based on the selected view.
 * This demonstrates view derivation consistency (Requirement 6.6).
 * Also applies tag filtering if a tag is selected.
 */
export const selectTasksByView = (state: AppState): Task[] => {
  const view = state.ui.selectedView;
  const selectedTag = state.ui.selectedTag;

  console.log('selectTasksByView - view:', view, 'selectedTag:', selectedTag);

  let tasks: Task[];

  switch (view) {
    case 'today':
      tasks = selectTodayTasks(state);
      break;
    case 'upcoming':
      tasks = selectUpcomingTasks(state);
      break;
    case 'priority':
      tasks = selectHighPriorityTasks(state);
      break;
    case 'completed':
      tasks = selectCompletedTasks(state);
      break;
    case 'all':
    default:
      tasks = selectAllTasks(state);
  }

  console.log('Tasks before tag filter:', tasks.length);

  // Apply tag filter if selected
  if (selectedTag) {
    tasks = tasks.filter(task => {
      console.log('Task:', task.description, 'tags:', task.tags, 'includes:', task.tags.includes(selectedTag));
      return task.tags.includes(selectedTag);
    });
  }

  console.log('Tasks after tag filter:', tasks.length);

  return tasks;
};

/**
 * Selector for all unique tags across all tasks
 *
 * Returns a sorted list of all unique tags used in tasks.
 */
export const selectAllTags = (state: AppState): string[] => {
  const tagSet = new Set<string>();
  state.tasks.forEach(task => {
    task.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};
