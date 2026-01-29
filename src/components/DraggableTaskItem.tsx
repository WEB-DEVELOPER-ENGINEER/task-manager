/**
 * DraggableTaskItem Component
 *
 * Wraps TaskItem with drag-to-reorder functionality.
 * Provides visual feedback during drag and animates position changes.
 *
 * Requirements: 4.3, 4.4
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Task } from '../types/Task';
import TaskItem from './TaskItem';
import { tokens } from '../theme/tokens';
import { gestureConfig } from '../gestures/gestureConfig';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Props interface for DraggableTaskItem component
 */
export interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  reorderMode: boolean;
  multiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  itemHeight: number;
  totalItems: number;
}

/**
 * DraggableTaskItem component with drag-to-reorder functionality
 *
 * Features:
 * - Drag gesture handler with activation distance
 * - Visual feedback during drag (scale, elevation, highlight)
 * - Drag handle icon when in reorder mode
 * - Haptic feedback on drag start and end
 * - Spring-based animations for position changes
 * - Automatic reordering based on drag position
 */
const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  index,
  onToggle,
  onDelete,
  onReorder,
  reorderMode,
  multiSelectMode = false,
  isSelected = false,
  onToggleSelection,
  itemHeight,
  totalItems,
}) => {
  const { theme } = useTheme();

  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragHandleOpacity = useSharedValue(reorderMode ? 1 : 0);

  // Spring configuration from design tokens
  const springConfig = {
    damping: tokens.motion.spring.default.friction,
    stiffness: tokens.motion.spring.default.tension,
    mass: 1,
  };

  // Animate drag handle visibility when reorder mode changes
  React.useEffect(() => {
    if (reorderMode) {
      dragHandleOpacity.value = withSpring(1, springConfig);
    } else {
      dragHandleOpacity.value = withSpring(0, springConfig);
    }
  }, [reorderMode, dragHandleOpacity, springConfig]);

  // Trigger haptic feedback (must be called from JS thread)
  const triggerDragStartHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const triggerDragEndHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Calculate target index based on drag position
  const calculateTargetIndex = useCallback(
    (translationY: number): number => {
      const offset = Math.round(translationY / itemHeight);
      const targetIndex = index + offset;
      return Math.max(0, Math.min(totalItems - 1, targetIndex));
    },
    [index, itemHeight, totalItems]
  );

  // Handle reorder completion
  const handleReorderComplete = useCallback(
    (targetIndex: number) => {
      if (targetIndex !== index) {
        onReorder(index, targetIndex);
      }
    },
    [index, onReorder]
  );

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .enabled(reorderMode && !multiSelectMode)
    .activateAfterLongPress(gestureConfig.longPress.duration)
    .onStart(() => {
      'worklet';
      isDragging.value = true;

      // Trigger haptic feedback
      runOnJS(triggerDragStartHaptic)();

      // Animate scale and elevation
      scale.value = withSpring(1.05, springConfig);
      elevation.value = withSpring(8, springConfig);
    })
    .onUpdate(event => {
      'worklet';
      if (isDragging.value) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;

      // Calculate target index
      const targetIndex = runOnJS(calculateTargetIndex)(translateY.value);

      // Trigger reorder if position changed
      if (targetIndex !== index) {
        runOnJS(handleReorderComplete)(targetIndex);
      }

      // Trigger haptic feedback
      runOnJS(triggerDragEndHaptic)();

      // Reset animations
      translateY.value = withSpring(0, springConfig);
      scale.value = withSpring(1, springConfig);
      elevation.value = withSpring(0, springConfig);
    })
    .onFinalize(() => {
      'worklet';
      // Ensure animations are reset if gesture is cancelled
      if (isDragging.value) {
        isDragging.value = false;
        translateY.value = withSpring(0, springConfig);
        scale.value = withSpring(1, springConfig);
        elevation.value = withSpring(0, springConfig);
      }
    });

  // Animated styles for container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    zIndex: isDragging.value ? 1000 : 0,
    elevation: elevation.value,
    shadowOpacity: isDragging.value ? 0.3 : 0,
    shadowRadius: isDragging.value ? 8 : 0,
    shadowOffset: {
      width: 0,
      height: isDragging.value ? 4 : 0,
    },
  }));

  // Animated styles for drag handle
  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = dragHandleOpacity.value;
    const backgroundColor = isDragging.value
      ? interpolate(isDragging.value ? 1 : 0, [0, 1], [0, 0.2])
      : 0;

    return {
      opacity,
      backgroundColor: `rgba(100, 100, 255, ${backgroundColor})`,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {reorderMode && (
          <Animated.View style={[styles.dragHandleContainer, dragHandleAnimatedStyle]}>
            <View style={styles.dragHandle}>
              <Text style={[styles.dragHandleIcon, { color: theme.colors.textSecondary }]}>☰</Text>
            </View>
          </Animated.View>
        )}
        <View style={styles.taskItemContainer}>
          <TaskItem
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            multiSelectMode={multiSelectMode}
            isSelected={isSelected}
            onToggleSelection={onToggleSelection}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandleContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderTopLeftRadius: tokens.radius.md,
    borderBottomLeftRadius: tokens.radius.md,
  },
  dragHandle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskItemContainer: {
    flex: 1,
  },
});

export default React.memo(DraggableTaskItem);
