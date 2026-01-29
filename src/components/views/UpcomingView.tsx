/**
 * UpcomingView Component
 *
 * Displays tasks due in the next 7 days (excluding today).
 *
 * Requirements: 6.2
 */

import React from 'react';
import { useAppState } from '../../state/context';
import { selectUpcomingTasks } from '../../state/selectors';
import { BaseTaskView } from './BaseTaskView';

export interface UpcomingViewProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({ onToggleTask, onDeleteTask }) => {
  const { state } = useAppState();
  const tasks = React.useMemo(() => selectUpcomingTasks(state), [state]);

  return (
    <BaseTaskView
      tasks={tasks}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      emptyMessage="No upcoming tasks in the next 7 days"
      emptyIcon="🔜"
      testID="upcoming-view"
    />
  );
};
