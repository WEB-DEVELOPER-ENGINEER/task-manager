/**
 * BaseTaskView Component
 *
 * Base component for all task views with common functionality.
 * Provides consistent layout and behavior across different view types.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Task } from '../../types/Task';
import TaskList from '../TaskList';
import { useTheme } from '../../theme/ThemeProvider';
import { useAppState } from '../../state/context';
import { tokens } from '../../theme/tokens';

export interface BaseTaskViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (id: string) => void;
  emptyMessage?: string;
  emptyIcon?: string;
  testID?: string;
}

/**
 * BaseTaskView component
 * Renders a task list with an empty state message
 */
export const BaseTaskView: React.FC<BaseTaskViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  emptyMessage = 'No tasks',
  emptyIcon = '📭',
  testID,
}) => {
  const { theme } = useTheme();
  const { state, dispatch } = useAppState();
  const multiSelectMode = state.ui.multiSelectMode;
  const selectedTaskIds = state.ui.selectedTaskIds;
  const reorderMode = state.ui.reorderMode;

  const handleToggleSelection = React.useCallback(
    (id: string) => {
      dispatch({
        type: 'TOGGLE_TASK_SELECTION',
        payload: id,
      });
    },
    [dispatch]
  );

  const handleReorder = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({
        type: 'REORDER_TASKS',
        payload: { fromIndex, toIndex },
      });
    },
    [dispatch]
  );

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyIcon}>{emptyIcon}</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <TaskList
        tasks={tasks}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
        onReorderTasks={handleReorder}
        reorderMode={reorderMode}
        multiSelectMode={multiSelectMode}
        selectedTaskIds={selectedTaskIds}
        onToggleSelection={handleToggleSelection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: tokens.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});

// Memoize component to prevent unnecessary re-renders
export const BaseTaskViewMemo = React.memo(BaseTaskView);
