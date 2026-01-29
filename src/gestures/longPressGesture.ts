/**
 * Long-Press Gesture Handler
 *
 * Creates a long-press gesture that triggers reorder mode or multi-select mode.
 * Provides visual feedback during the long-press duration.
 *
 * Requirements: 4.3, 4.5
 */

import { Gesture } from 'react-native-gesture-handler';
import { SharedValue, runOnJS, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { gestureConfig } from './gestureConfig';

export interface LongPressGestureConfig {
  /**
   * Callback triggered when long-press completes
   */
  onLongPress: () => void;

  /**
   * Optional callback for visual feedback during long-press
   * Receives progress value from 0 to 1
   */
  onProgress?: (progress: number) => void;

  /**
   * Optional custom duration in milliseconds
   * Defaults to gestureConfig.longPress.duration (500ms)
   */
  duration?: number;

  /**
   * Optional shared value for scale animation feedback
   */
  scaleValue?: SharedValue<number>;
}

/**
 * Creates a long-press gesture with visual feedback
 *
 * The gesture:
 * - Triggers after the configured duration (default 500ms)
 * - Provides haptic feedback when activated
 * - Supports visual feedback through scale animation
 * - Can trigger reorder mode or multi-select mode based on context
 *
 * @param config Configuration for the long-press gesture
 * @returns Configured long-press gesture
 */
export function createLongPressGesture(config: LongPressGestureConfig) {
  const {
    onLongPress,
    onProgress,
    duration = gestureConfig.longPress.duration,
    scaleValue,
  } = config;

  /**
   * Trigger haptic feedback when long-press activates
   */
  const triggerHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /**
   * Handle long-press activation
   */
  const handleLongPressActivation = () => {
    triggerHapticFeedback();
    onLongPress();
  };

  /**
   * Update progress for visual feedback
   */
  const updateProgress = (progress: number) => {
    if (onProgress) {
      onProgress(progress);
    }
  };

  // Create the long-press gesture
  const longPressGesture = Gesture.LongPress()
    .minDuration(duration)
    .onStart(() => {
      // Provide visual feedback: scale down slightly
      if (scaleValue) {
        scaleValue.value = withTiming(0.95, { duration: duration });
      }

      // Update progress at start
      runOnJS(updateProgress)(0);
    })
    .onFinalize((event, success) => {
      if (success) {
        // Long-press completed successfully
        runOnJS(handleLongPressActivation)();
        runOnJS(updateProgress)(1);
      } else {
        // Long-press cancelled, update progress
        runOnJS(updateProgress)(0);
      }

      // Reset scale animation
      if (scaleValue) {
        scaleValue.value = withTiming(1, { duration: 150 });
      }
    });

  return longPressGesture;
}

/**
 * Creates a long-press gesture for entering multi-select mode
 *
 * @param onEnterMultiSelect Callback to enter multi-select mode
 * @param scaleValue Optional shared value for scale animation
 * @returns Configured long-press gesture for multi-select
 */
export function createMultiSelectLongPress(
  onEnterMultiSelect: () => void,
  scaleValue?: SharedValue<number>
) {
  return createLongPressGesture({
    onLongPress: onEnterMultiSelect,
    scaleValue,
  });
}

/**
 * Creates a long-press gesture for entering reorder mode
 *
 * @param onEnterReorderMode Callback to enter reorder mode
 * @param scaleValue Optional shared value for scale animation
 * @returns Configured long-press gesture for reorder mode
 */
export function createReorderLongPress(
  onEnterReorderMode: () => void,
  scaleValue?: SharedValue<number>
) {
  return createLongPressGesture({
    onLongPress: onEnterReorderMode,
    scaleValue,
  });
}
