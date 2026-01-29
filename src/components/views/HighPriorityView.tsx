/**
 * HighPriorityView Component
 *
 * Displays tasks with high or critical priority.
 *
 * Requirements: 6.3
 */

import React from 'react';
import { useAppState } from '../../state/context';
import { selectHighPriorityTasks } from '../../state/selectors';
import { BaseTaskView } from './BaseTaskView';

export interface HighPriorityViewProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const HighPriorityView: React.FC<HighPriorityViewProps> = ({
  onToggleTask,
  onDeleteTask,
}) => {
  const { state } = useAppState();
  const tasks = React.useMemo(() => selectHighPriorityTasks(state), [state]);

  return (
    <BaseTaskView
      tasks={tasks}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      emptyMessage="No high priority tasks"
      emptyIcon="⭐"
      testID="priority-view"
    />
  );
};
