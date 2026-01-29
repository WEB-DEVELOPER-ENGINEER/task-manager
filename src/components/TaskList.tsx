import React from 'react';
import { FlatList, View, Text, StyleSheet, ListRenderItem } from 'react-native';
import { Task } from '../types/Task';
import TaskItem from './TaskItem';
import DraggableTaskItem from './DraggableTaskItem';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../utils/typography';

/**
 * Props interface for TaskList component
 */
export interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (id: string) => void;
  onReorderTasks?: (fromIndex: number, toIndex: number) => void;
  reorderMode?: boolean;
  multiSelectMode?: boolean;
  selectedTaskIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
}

/**
 * TaskList component displays a performant scrollable list of tasks
 * Uses FlatList for optimal rendering performance with large lists
 * Supports drag-to-reorder when in reorder mode
 */
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onReorderTasks,
  reorderMode = false,
  multiSelectMode = false,
  selectedTaskIds = new Set(),
  onToggleSelection,
}) => {
  // Estimated item height for drag calculations
  const ITEM_HEIGHT = 80;

  /**
   * Extracts unique key for each task item
   * Required by FlatList for optimal performance
   */
  const keyExtractor = React.useCallback((item: Task): string => item.id, []);

  /**
   * Renders individual task item
   * Uses DraggableTaskItem when in reorder mode, otherwise regular TaskItem
   */
  const renderItem: ListRenderItem<Task> = React.useCallback(
    ({ item, index }) => {
      if (reorderMode && onReorderTasks) {
        return (
          <DraggableTaskItem
            task={item}
            index={index}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onReorder={onReorderTasks}
            reorderMode={reorderMode}
            multiSelectMode={multiSelectMode}
            isSelected={selectedTaskIds.has(item.id)}
            onToggleSelection={onToggleSelection}
            itemHeight={ITEM_HEIGHT}
            totalItems={tasks.length}
          />
        );
      }

      return (
        <TaskItem
          task={item}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onEdit={onEditTask}
          multiSelectMode={multiSelectMode}
          isSelected={selectedTaskIds.has(item.id)}
          onToggleSelection={onToggleSelection}
        />
      );
    },
    [
      reorderMode,
      onReorderTasks,
      onToggleTask,
      onDeleteTask,
      multiSelectMode,
      selectedTaskIds,
      onToggleSelection,
      tasks.length,
    ]
  );

  /**
   * Renders empty state when no tasks exist
   */
  const renderEmptyState = React.useCallback(
    () => (
      <View style={styles.emptyContainer} accessibilityRole="text">
        <Text style={styles.emptyText} accessibilityLabel="No tasks yet">
          No tasks yet
        </Text>
        <Text style={styles.emptySubtext} accessibilityLabel="Add a task to get started">
          Add a task to get started
        </Text>
      </View>
    ),
    []
  );

  // Display empty state if no tasks
  if (tasks.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      accessibilityLabel="Task list"
      accessibilityHint={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} in your list`}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  emptyText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});

// Memoize component to prevent unnecessary re-renders
export default React.memo(TaskList, (prevProps, nextProps) => {
  // Only re-render if tasks array reference changes or other props change
  return (
    prevProps.tasks === nextProps.tasks &&
    prevProps.reorderMode === nextProps.reorderMode &&
    prevProps.multiSelectMode === nextProps.multiSelectMode &&
    prevProps.selectedTaskIds === nextProps.selectedTaskIds
  );
});
