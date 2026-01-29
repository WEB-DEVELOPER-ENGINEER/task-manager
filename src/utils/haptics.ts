import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback styles available for user interactions
 */
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Result of a haptic feedback trigger, including timing information
 */
export interface HapticFeedbackResult {
  style: HapticStyle;
  timestamp: number;
  duration: number;
}

/**
 * Triggers haptic feedback with the specified style and measures timing.
 *
 * Requirements:
 * - 3.1: Provides haptic feedback with impact style for task completion
 * - 3.2: Provides haptic feedback with notification style for task deletion
 *
 * @param style - The haptic feedback style to trigger
 * @returns Promise resolving to feedback result with timing information
 */
export async function triggerHaptic(style: HapticStyle): Promise<HapticFeedbackResult> {
  const startTime = performance.now();

  try {
    switch (style) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        // Default to medium impact for unknown styles
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    return {
      style,
      timestamp: startTime,
      duration,
    };
  } catch (error) {
    // Haptics may not be available on all devices (e.g., simulators)
    // Fail gracefully and return timing information
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.warn('Haptic feedback not available:', error);

    return {
      style,
      timestamp: startTime,
      duration,
    };
  }
}

/**
 * Triggers haptic feedback for task completion action.
 * Uses impact style as per requirement 3.1.
 *
 * @returns Promise resolving to feedback result
 */
export async function triggerTaskCompleteHaptic(): Promise<HapticFeedbackResult> {
  return triggerHaptic('medium');
}

/**
 * Triggers haptic feedback for task deletion action.
 * Uses notification style as per requirement 3.2.
 *
 * @returns Promise resolving to feedback result
 */
export async function triggerTaskDeleteHaptic(): Promise<HapticFeedbackResult> {
  return triggerHaptic('error');
}

/**
 * Triggers haptic feedback for button press interactions.
 * Uses light impact for subtle feedback.
 *
 * @returns Promise resolving to feedback result
 */
export async function triggerButtonPressHaptic(): Promise<HapticFeedbackResult> {
  return triggerHaptic('light');
}

/**
 * Triggers haptic feedback for gesture interactions.
 * Uses medium impact for noticeable feedback.
 *
 * @returns Promise resolving to feedback result
 */
export async function triggerGestureHaptic(): Promise<HapticFeedbackResult> {
  return triggerHaptic('medium');
}
