/**
 * Accessibility Utilities
 *
 * Provides utilities for detecting and responding to system accessibility settings
 * including reduced motion, high contrast, and other accessibility preferences.
 *
 * Requirements: 10.3, 10.4
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to detect if the system has reduced motion enabled
 *
 * @returns boolean indicating if reduced motion is enabled
 */
export function useReducedMotion(): boolean {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      setIsReducedMotionEnabled(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      setIsReducedMotionEnabled(enabled);
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  return isReducedMotionEnabled;
}

/**
 * Hook to detect if the system has high contrast enabled
 * Note: This is primarily for iOS. Android handles high contrast differently.
 *
 * @returns boolean indicating if high contrast is enabled (iOS only)
 */
export function useHighContrast(): boolean {
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

  useEffect(() => {
    // Check if the method exists (iOS only)
    if (AccessibilityInfo.isHighContrastEnabled) {
      // Check initial state
      AccessibilityInfo.isHighContrastEnabled().then(enabled => {
        setIsHighContrastEnabled(enabled);
      });

      // Listen for changes
      const subscription = AccessibilityInfo.addEventListener('highContrastChanged', enabled => {
        setIsHighContrastEnabled(enabled);
      });

      // Cleanup
      return () => {
        subscription.remove();
      };
    }
  }, []);

  return isHighContrastEnabled;
}

/**
 * Get animation configuration based on reduced motion setting
 *
 * @param isReducedMotion - Whether reduced motion is enabled
 * @param normalConfig - Normal animation configuration
 * @param reducedConfig - Reduced animation configuration (optional)
 * @returns Animation configuration appropriate for the setting
 */
export function getAccessibleAnimationConfig<T>(
  isReducedMotion: boolean,
  normalConfig: T,
  reducedConfig?: Partial<T>
): T {
  if (isReducedMotion && reducedConfig) {
    return { ...normalConfig, ...reducedConfig };
  }
  return normalConfig;
}

/**
 * Get animation duration based on reduced motion setting
 *
 * @param isReducedMotion - Whether reduced motion is enabled
 * @param normalDuration - Normal animation duration in ms
 * @param reducedDuration - Reduced animation duration in ms (default: 0)
 * @returns Animation duration appropriate for the setting
 */
export function getAccessibleDuration(
  isReducedMotion: boolean,
  normalDuration: number,
  reducedDuration: number = 0
): number {
  return isReducedMotion ? reducedDuration : normalDuration;
}

/**
 * Determine if animations should be disabled entirely
 *
 * @param isReducedMotion - Whether reduced motion is enabled
 * @returns boolean indicating if animations should be disabled
 */
export function shouldDisableAnimations(isReducedMotion: boolean): boolean {
  return isReducedMotion;
}
