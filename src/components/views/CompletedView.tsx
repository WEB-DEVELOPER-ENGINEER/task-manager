/**
 * CompletedView Component
 *
 * Displays all completed tasks.
 *
 * Requirements: 6.4
 */

import React from 'react';
import { useAppState } from '../../state/context';
import { selectCompletedTasks } from '../../state/selectors';
import { BaseTaskView } from './BaseTaskView';

export interface CompletedViewProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const CompletedView: React.FC<CompletedViewProps> = ({ onToggleTask, onDeleteTask }) => {
  const { state } = useAppState();
  const tasks = React.useMemo(() => selectCompletedTasks(state), [state]);

  return (
    <BaseTaskView
      tasks={tasks}
      onToggleTask={onToggleTask}
      onDeleteTask={onDeleteTask}
      emptyMessage="No completed tasks yet"
      emptyIcon="✅"
      testID="completed-view"
    />
  );
};
