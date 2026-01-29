/**
 * TodayView Component
 *
 * Displays tasks due today or overdue.
 *
 * Requirements: 6.1
 */

import React from 'react';
import { useAppState } from '../../state/context';
import { selectTodayTasks } from '../../state/selectors';
import { BaseTaskView } from './BaseTaskView';

export interface TodayViewProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onToggleTask, onDeleteTask }) => {
  const { state } = useAppState();
  const tasks = React.useMemo(() => selectTodayTasks(state), [state]);

  return (
    <BaseTaskView
      tasks={tasks}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      emptyMessage="No tasks due today. You're all caught up!"
      emptyIcon="📅"
      testID="today-view"
    />
  );
};
