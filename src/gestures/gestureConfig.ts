/**
 * Gesture Configuration
 *
 * Defines configuration constants for gesture interactions including
 * swipe thresholds, long-press duration, and drag activation.
 *
 * Requirements: 4.6, 14.5
 */

export interface GestureConfig {
  swipe: {
    minDistance: number; // Minimum swipe distance in points
    velocityThreshold: number; // Velocity threshold in points/second
  };
  longPress: {
    duration: number; // Long-press duration in milliseconds
  };
  drag: {
    activationDistance: number; // Distance before drag activates in points
  };
}

/**
 * Default gesture configuration
 *
 * These values are based on the design requirements:
 * - Swipe requires minimum 50 points distance (Requirement 4.6)
 * - Velocity threshold of 500 points/second for automatic completion (Requirement 14.2)
 * - Long-press duration of 500ms (Requirement 4.3)
 * - Drag activation at 10 points to prevent accidental activation
 */
export const gestureConfig: GestureConfig = {
  swipe: {
    minDistance: 50,
    velocityThreshold: 500,
  },
  longPress: {
    duration: 500,
  },
  drag: {
    activationDistance: 10,
  },
};
