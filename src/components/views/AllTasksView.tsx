/**
 * AllTasksView Component
 *
 * Displays all tasks without filtering.
 *
 * Requirements: 6.1
 */

import React from 'react';
import { useAppState } from '../../state/context';
import { selectTasksByView } from '../../state/selectors';
import { BaseTaskView } from './BaseTaskView';

export interface AllTasksViewProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (id: string) => void;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({ onToggleTask, onDeleteTask, onEditTask }) => {
  const { state } = useAppState();
  const tasks = React.useMemo(() => selectTasksByView(state), [state]);

  return (
    <BaseTaskView
      tasks={tasks}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      onEditTask={onEditTask}
      emptyMessage="No tasks yet. Add one to get started!"
      emptyIcon="📋"
      testID="all-tasks-view"
    />
  );
};
