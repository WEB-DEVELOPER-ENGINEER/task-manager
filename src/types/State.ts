/**
 * State Type Definitions
 *
 * Defines the structure for application state, UI state, and all action types
 * for the reducer-based state management system.
 */

import { Task, TaskInput } from './Task';
import { ThemeConfig } from './Theme';

export type ViewType = 'all' | 'today' | 'upcoming' | 'priority' | 'completed';

export interface UIState {
  selectedView: ViewType;
  multiSelectMode: boolean;
  selectedTaskIds: Set<string>;
  reorderMode: boolean;
  editingTaskId: string | null;
  selectedTag: string | null; // Filter by tag
}

export interface AppState {
  tasks: Task[];
  ui: UIState;
  theme: ThemeConfig;
}

// Action Types
export type Action =
  | { type: 'ADD_TASK'; payload: TaskInput }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'TOGGLE_MULTI_SELECT' }
  | { type: 'TOGGLE_TASK_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SET_REORDER_MODE'; payload: boolean }
  | { type: 'SET_EDITING_TASK'; payload: string | null }
  | { type: 'SET_THEME'; payload: ThemeConfig }
  | { type: 'BATCH_DELETE'; payload: string[] }
  | { type: 'BATCH_COMPLETE'; payload: string[] }
  | { type: 'SET_TAG_FILTER'; payload: string | null };
