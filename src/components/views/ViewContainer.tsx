/**
 * ViewContainer Component
 *
 * Main container that combines ViewSelector with animated view switching.
 * Renders the appropriate view based on the selected view type.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppState } from '../../state/context';
import { ViewSelector } from './ViewSelector';
import { TagFilter } from '../TagFilter';
import { AllTasksView } from './AllTasksView';
import { TodayView } from './TodayView';
import { UpcomingView } from './UpcomingView';
import { HighPriorityView } from './HighPriorityView';
import { CompletedView } from './CompletedView';
import { AnimatedViewContainer } from './AnimatedViewContainer';

export interface ViewContainerProps {
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (id: string) => void;
}

/**
 * ViewContainer component
 * Manages view selection and renders the appropriate view with animations
 */
export const ViewContainer: React.FC<ViewContainerProps> = ({ onToggleTask, onDeleteTask, onEditTask }) => {
  const { state } = useAppState();
  const selectedView = state.ui.selectedView;

  // Render the appropriate view based on selection
  const renderView = React.useCallback(() => {
    switch (selectedView) {
      case 'today':
        return <TodayView onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask} />;
      case 'upcoming':
        return <UpcomingView onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask} />;
      case 'priority':
        return <HighPriorityView onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask} />;
      case 'completed':
        return <CompletedView onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask} />;
      case 'all':
      default:
        return <AllTasksView onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask} />;
    }
  }, [selectedView, onToggleTask, onDeleteTask, onEditTask]);

  return (
    <View style={styles.container}>
      <ViewSelector />
      <TagFilter />
      <AnimatedViewContainer viewKey={selectedView}>{renderView()}</AnimatedViewContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Memoize component to prevent unnecessary re-renders
export const ViewContainerMemo = React.memo(ViewContainer);
