import React, { useCallback } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskInput as TaskInputType } from '../types/Task';
import TaskInput from './TaskInput';
import BatchActionBar from './BatchActionBar';
import { ReorderModeButton } from './ReorderModeButton';
import { ThemeToggle } from './ThemeToggle';
import { ErrorToast } from './ErrorToast';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { StateProvider, useAppState } from '../state/context';
import { ViewContainer } from './views/ViewContainer';
import { GlassCard } from './primitives/GlassCard';
import { spacing } from '../styles/spacing';
import { typography } from '../utils/typography';
import { tokens } from '../theme/tokens';

/**
 * AppContent component
 * Main app content that uses state from StateProvider
 * with animated theme transitions and glassmorphism effects
 */
const AppContent = React.memo(function AppContent() {
  const { state, dispatch } = useAppState();
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();
  const progress = useSharedValue(0);
  const backgroundAnimation = useSharedValue(0);

  // Memoize derived state values
  const editingTaskId = React.useMemo(() => state.ui.editingTaskId, [state.ui.editingTaskId]);
  const tasks = React.useMemo(() => state.tasks, [state.tasks]);
  const multiSelectMode = React.useMemo(() => state.ui.multiSelectMode, [state.ui.multiSelectMode]);
  const selectedTaskIds = React.useMemo(() => state.ui.selectedTaskIds, [state.ui.selectedTaskIds]);

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  // Animate progress during theme transitions
  React.useEffect(() => {
    if (isTransitioning && previousTheme) {
      progress.value = withTiming(1, { duration });
    } else {
      progress.value = 0;
    }
  }, [isTransitioning, previousTheme, progress, duration]);

  // Subtle animated background gradient (only if not reduced motion)
  React.useEffect(() => {
    if (!isReducedMotion && Easing && Easing.inOut && Easing.ease) {
      backgroundAnimation.value = withRepeat(
        withTiming(1, {
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [isReducedMotion, backgroundAnimation]);

  // Animated background color
  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return {
        backgroundColor: theme.colors.background,
      };
    }

    const interpolated = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors.background, theme.colors.background]
    );

    return {
      backgroundColor: interpolated,
    };
  });

  // Animated gradient overlay for subtle background effect
  const animatedGradientStyle = useAnimatedStyle(() => {
    const opacity = isReducedMotion ? 0.03 : 0.05 + backgroundAnimation.value * 0.02;

    return {
      opacity,
    };
  });

  // Animated header border color
  const animatedHeaderBorderStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return {
        borderBottomColor: theme.colors.border,
      };
    }

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors.border, theme.colors.border]
    );

    return {
      borderBottomColor: borderColor,
    };
  });

  // Animated text color
  const animatedTextStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return {
        color: theme.colors.text,
      };
    }

    const interpolated = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors.text, theme.colors.text]
    );

    return {
      color: interpolated,
    };
  });

  /**
   * Creates and adds a new task to the task list
   */
  const addTask = useCallback(
    (taskInput: TaskInputType) => {
      dispatch({
        type: 'ADD_TASK',
        payload: taskInput,
      });
    },
    [dispatch]
  );

  /**
   * Updates an existing task
   */
  const updateTask = useCallback(
    (id: string, updates: Partial<TaskInputType>) => {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id, updates },
      });
      dispatch({
        type: 'SET_EDITING_TASK',
        payload: null,
      });
    },
    [dispatch]
  );

  /**
   * Handles editing a task
   */
  const handleEditTask = useCallback(
    (id: string) => {
      dispatch({
        type: 'SET_EDITING_TASK',
        payload: id,
      });
    },
    [dispatch]
  );

  /**
   * Cancels editing mode
   */
  const cancelEdit = useCallback(() => {
    dispatch({
      type: 'SET_EDITING_TASK',
      payload: null,
    });
  }, [dispatch]);

  /**
   * Toggles the completion status of a task
   */
  const toggleTaskCompletion = useCallback(
    (id: string) => {
      dispatch({
        type: 'TOGGLE_COMPLETE',
        payload: id,
      });
    },
    [dispatch]
  );

  /**
   * Removes a task from the task list
   */
  const deleteTask = useCallback(
    (id: string) => {
      dispatch({
        type: 'DELETE_TASK',
        payload: id,
      });
    },
    [dispatch]
  );

  /**
   * Handles batch delete of selected tasks
   */
  const handleBatchDelete = useCallback(() => {
    dispatch({
      type: 'BATCH_DELETE',
      payload: Array.from(selectedTaskIds),
    });
  }, [dispatch, selectedTaskIds]);

  /**
   * Handles batch complete of selected tasks
   */
  const handleBatchComplete = useCallback(() => {
    dispatch({
      type: 'BATCH_COMPLETE',
      payload: Array.from(selectedTaskIds),
    });
  }, [dispatch, selectedTaskIds]);

  /**
   * Cancels multi-select mode
   */
  const handleCancelMultiSelect = useCallback(() => {
    dispatch({
      type: 'TOGGLE_MULTI_SELECT',
    });
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {/* Animated gradient background overlay */}
        <Animated.View style={[styles.gradientBackground, animatedGradientStyle]}>
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.background, theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>

        <ErrorToast />

        {/* Header with glassmorphism */}
        <GlassCard style={styles.header} blurIntensity="medium" translucency={0.9}>
          <Animated.View style={[styles.headerContent, animatedHeaderBorderStyle]}>
            <Animated.Text
              style={[styles.headerTitle, animatedTextStyle]}
              accessibilityRole="header"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Task Manager
            </Animated.Text>
            <View style={styles.headerButtons}>
              <ThemeToggle />
              <ReorderModeButton />
            </View>
          </Animated.View>
        </GlassCard>

        {/* Task Input or Batch Actions */}
        <View style={styles.inputSection}>
          {!multiSelectMode && (
            <TaskInput
              onAddTask={addTask}
              editingTask={editingTaskId ? tasks.find(t => t.id === editingTaskId) || null : null}
              onUpdateTask={updateTask}
              onCancelEdit={cancelEdit}
            />
          )}
          {multiSelectMode && (
            <BatchActionBar
              selectedCount={selectedTaskIds.size}
              onBatchDelete={handleBatchDelete}
              onBatchComplete={handleBatchComplete}
              onCancel={handleCancelMultiSelect}
            />
          )}
        </View>

        {/* Task List */}
        <View style={styles.taskListSection}>
          <ViewContainer onToggleTask={toggleTaskCompletion} onDeleteTask={deleteTask} onEditTask={handleEditTask} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
});

/**
 * App root component
 * Wraps the app with providers for theme and state management
 */
const App: React.FC = () => {
  return (
    <ThemeProvider initialTheme="light">
      <StateProvider>
        <AppContent />
      </StateProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 50,
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
    marginRight: spacing.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 160,
  },
  inputSection: {
    flexShrink: 0,
    maxHeight: 280,
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  taskListSection: {
    flex: 1,
    minHeight: 0,
  },
});

export default App;
