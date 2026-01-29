/**
 * TaskItem Component
 *
 * Enhanced task item with gestures, animations, glassmorphism, and advanced features.
 * Supports swipe gestures, spring animations, priority styling, due dates, and tags.
 * Includes animated theme transitions.
 *
 * Requirements: 1.1, 1.2, 2.2, 3.3, 4.1, 4.2, 5.2, 5.4, 5.6, 9.4
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Task, Priority } from '../types/Task';
import { SwipeableRow } from './primitives/SwipeableRow';
import { GlassCard } from './primitives/GlassCard';
import { useTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { formatRelativeTime, isOverdue } from '../utils/dateUtils';
import { typography } from '../utils/typography';

/**
 * Props interface for TaskItem component
 */
export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  multiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

/**
 * TaskItem component with gestures, animations, and glassmorphism
 *
 * Features:
 * - Swipe right to toggle completion
 * - Swipe left to reveal delete action
 * - Spring-based animations for state changes
 * - Priority-based visual styling
 * - Due date display with relative time
 * - Tag display with color coding
 * - Glassmorphism effects
 * - Multi-select mode with checkboxes
 * - Animated theme transitions
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  multiSelectMode = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();

  // Animation values
  const checkboxScale = useSharedValue(1);
  const checkboxOpacity = useSharedValue(task.completed ? 1 : 0);
  const completionOpacity = useSharedValue(task.completed ? 0.6 : 1);
  const selectionCheckboxScale = useSharedValue(multiSelectMode ? 1 : 0);
  const selectionCheckboxOpacity = useSharedValue(multiSelectMode ? 1 : 0);
  const themeProgress = useSharedValue(0);

  // Spring configuration from design tokens - adjust for reduced motion
  const springConfig = {
    damping: isReducedMotion ? 50 : tokens.motion.spring.default.friction,
    stiffness: isReducedMotion ? 500 : tokens.motion.spring.default.tension,
    mass: isReducedMotion ? 0.5 : 1,
  };

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  // Animate theme transitions
  React.useEffect(() => {
    if (isTransitioning && previousTheme) {
      themeProgress.value = withTiming(1, { duration });
    } else {
      themeProgress.value = 0;
    }
  }, [isTransitioning, previousTheme, themeProgress, duration]);

  // Animate multi-select mode transitions
  React.useEffect(() => {
    if (multiSelectMode) {
      selectionCheckboxScale.value = withSpring(1, springConfig);
      selectionCheckboxOpacity.value = withSpring(1, springConfig);
    } else {
      selectionCheckboxScale.value = withSpring(0, springConfig);
      selectionCheckboxOpacity.value = withSpring(0, springConfig);
    }
  }, [multiSelectMode, selectionCheckboxScale, selectionCheckboxOpacity, springConfig]);

  // Handle toggle with animation
  const handleToggle = useCallback(() => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate checkbox - skip animation if reduced motion is enabled
    if (!isReducedMotion) {
      checkboxScale.value = withSpring(1.2, springConfig, () => {
        checkboxScale.value = withSpring(1, springConfig);
      });
    }

    // Animate completion state
    const newCompleted = !task.completed;
    checkboxOpacity.value = withSpring(newCompleted ? 1 : 0, springConfig);
    completionOpacity.value = withSpring(newCompleted ? 0.6 : 1, springConfig);

    // Call the toggle handler
    onToggle(task.id);
  }, [
    task.id,
    task.completed,
    onToggle,
    checkboxScale,
    checkboxOpacity,
    completionOpacity,
    springConfig,
    isReducedMotion,
  ]);

  // Handle delete with haptic feedback
  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  }, [task.id, onDelete]);

  // Handle selection toggle in multi-select mode
  const handleSelectionToggle = useCallback(() => {
    if (multiSelectMode && onToggleSelection) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggleSelection(task.id);
    }
  }, [multiSelectMode, onToggleSelection, task.id]);

  // Handle tap - in multi-select mode, toggle selection; otherwise, normal behavior
  const handleTap = useCallback(() => {
    if (multiSelectMode) {
      handleSelectionToggle();
    }
  }, [multiSelectMode, handleSelectionToggle]);

  // Animated styles
  const checkboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const checkmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkboxOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
  }));

  const selectionCheckboxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectionCheckboxScale.value }],
    opacity: selectionCheckboxOpacity.value,
  }));

  // Animated text color
  const animatedTextStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return { color: theme.colors.text };
    }

    const interpolated = interpolateColor(
      themeProgress.value,
      [0, 1],
      [previousTheme.colors.text, theme.colors.text]
    );

    return { color: interpolated };
  });

  // Animated accent color (for borders and checkboxes)
  const animatedAccentStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return { borderColor: theme.colors.accent };
    }

    const interpolated = interpolateColor(
      themeProgress.value,
      [0, 1],
      [previousTheme.colors.accent, theme.colors.accent]
    );

    return { borderColor: interpolated };
  });

  // Get priority color
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'low':
        return theme.colors.priorityLow;
      case 'medium':
        return theme.colors.priorityMedium;
      case 'high':
        return theme.colors.priorityHigh;
      case 'critical':
        return theme.colors.priorityCritical;
      default:
        return theme.colors.text;
    }
  };

  // Get priority indicator size
  const getPriorityIndicatorSize = (priority: Priority): number => {
    switch (priority) {
      case 'critical':
        return 8;
      case 'high':
        return 6;
      case 'medium':
        return 4;
      case 'low':
        return 3;
      default:
        return 3;
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const prioritySize = getPriorityIndicatorSize(task.priority);

  // Memoize derived values
  const dueDateText = React.useMemo(() => formatRelativeTime(task.dueDate), [task.dueDate]);
  const isDueDateOverdue = React.useMemo(() => isOverdue(task.dueDate), [task.dueDate]);

  // Generate tag colors (simple hash-based color generation)
  const getTagColor = (tag: string): string => {
    const colors = [
      theme.colors.accent,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.priorityMedium,
      theme.colors.priorityHigh,
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <SwipeableRow
      onSwipeRight={{
        onTrigger: handleToggle,
        threshold: 50,
      }}
      onSwipeLeft={{
        onTrigger: handleDelete,
        threshold: 50,
      }}
      velocityThreshold={500}
      style={styles.swipeableContainer}
    >
      <Pressable onPress={handleTap} disabled={!multiSelectMode} style={{ flex: 1 }}>
        <GlassCard
          blurIntensity="medium"
          translucency={0.85}
          style={
            isSelected && multiSelectMode
              ? {
                  ...styles.glassContainer,
                  borderWidth: 2,
                  borderColor: theme.colors.accent,
                }
              : styles.glassContainer
          }
        >
          <View style={styles.container}>
            {/* Multi-select checkbox (animated) */}
            {multiSelectMode && (
              <Animated.View
                style={[styles.selectionCheckboxContainer, selectionCheckboxAnimatedStyle]}
              >
                <Pressable
                  style={styles.selectionToggleButton}
                  onPress={handleSelectionToggle}
                  accessibilityLabel={isSelected ? 'Deselect task' : 'Select task'}
                  accessibilityHint={
                    isSelected
                      ? 'Double tap to deselect this task'
                      : 'Double tap to select this task for batch operations'
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Animated.View
                    style={[
                      styles.selectionCheckbox,
                      animatedAccentStyle,
                      isSelected && { backgroundColor: theme.colors.accent },
                    ]}
                  >
                    {isSelected && <Text style={styles.selectionCheckmark}>✓</Text>}
                  </Animated.View>
                </Pressable>
              </Animated.View>
            )}

            {/* Priority indicator */}
            <View
              style={[
                styles.priorityIndicator,
                {
                  backgroundColor: priorityColor,
                  width: prioritySize,
                  height: prioritySize,
                },
              ]}
            />

            {/* Completion toggle button */}
            <Pressable
              style={styles.toggleButton}
              onPress={handleToggle}
              accessibilityLabel={
                task.completed ? 'Mark task as incomplete' : 'Mark task as complete'
              }
              accessibilityHint={
                task.completed
                  ? 'Double tap to mark this task as incomplete'
                  : 'Double tap to mark this task as complete'
              }
              accessibilityRole="button"
              accessibilityState={{ checked: task.completed }}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  { borderColor: priorityColor },
                  task.completed && { backgroundColor: priorityColor },
                  checkboxAnimatedStyle,
                ]}
              >
                <Animated.Text style={[styles.checkmark, checkmarkAnimatedStyle]}>✓</Animated.Text>
              </Animated.View>
            </Pressable>

            {/* Task content */}
            <Animated.View style={[styles.content, contentAnimatedStyle]}>
              {/* Task description */}
              <Animated.Text
                style={[
                  styles.description,
                  animatedTextStyle,
                  task.completed && styles.descriptionCompleted,
                ]}
                numberOfLines={2}
                accessibilityLabel={`Task: ${task.description}`}
              >
                {task.description}
              </Animated.Text>

              {/* Metadata row (due date and tags) */}
              {(dueDateText || task.tags.length > 0) && (
                <View style={styles.metadataRow}>
                  {/* Due date */}
                  {dueDateText && (
                    <View
                      style={[
                        styles.dueDateBadge,
                        {
                          backgroundColor: isDueDateOverdue
                            ? `${theme.colors.error}20`
                            : `${theme.colors.textSecondary}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dueDateText,
                          {
                            color: isDueDateOverdue
                              ? theme.colors.error
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {dueDateText}
                      </Text>
                    </View>
                  )}

                  {/* Tags */}
                  {task.tags.map((tag, index) => (
                    <View
                      key={`${tag}-${index}`}
                      style={[styles.tagChip, { backgroundColor: `${getTagColor(tag)}20` }]}
                    >
                      <Text style={[styles.tagText, { color: getTagColor(tag) }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Action buttons */}
            {!multiSelectMode && (
              <View style={styles.actionButtons}>
                {/* Edit button */}
                {onEdit && (
                  <Pressable
                    style={styles.editButton}
                    onPress={() => onEdit(task.id)}
                    accessibilityLabel={`Edit task: ${task.description}`}
                    accessibilityHint="Double tap to edit this task"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.editIcon, { color: theme.colors.accent }]}>✏️</Text>
                  </Pressable>
                )}
                
                {/* Delete button */}
                <Pressable
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  accessibilityLabel={`Delete task: ${task.description}`}
                  accessibilityHint="Double tap to delete this task"
                  accessibilityRole="button"
                >
                  <Text style={[styles.deleteIcon, { color: theme.colors.error }]}>🗑️</Text>
                </Pressable>
              </View>
            )}
          </View>
        </GlassCard>
      </Pressable>
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  swipeableContainer: {
    marginVertical: tokens.spacing.xs,
    marginHorizontal: tokens.spacing.md,
  },
  glassContainer: {
    minHeight: 60,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  selectionCheckboxContainer: {
    marginRight: tokens.spacing.sm,
  },
  selectionToggleButton: {
    width: 44, // Accessibility minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityIndicator: {
    borderRadius: tokens.radius.full,
    marginRight: tokens.spacing.sm,
  },
  toggleButton: {
    width: 44, // Accessibility minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: tokens.radius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  description: {
    ...typography.body,
    fontWeight: '500',
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: tokens.spacing.xs,
    gap: tokens.spacing.xs,
  },
  dueDateBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  dueDateText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tagChip: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 2,
    borderRadius: tokens.radius.sm,
  },
  tagText: {
    ...typography.caption,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.xs,
  },
  editIcon: {
    fontSize: 18,
  },
  deleteButton: {
    width: 44, // Accessibility minimum touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
});

// Memoize component to prevent unnecessary re-renders
export default React.memo(TaskItem, (prevProps, nextProps) => {
  // Only re-render if task properties have changed
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    prevProps.multiSelectMode === nextProps.multiSelectMode &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags)
  );
});
