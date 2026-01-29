/**
 * Animation Configuration Module
 *
 * Provides spring animation presets and configuration utilities for consistent
 * animation behavior across the application. All animations should use these
 * presets to maintain visual consistency. Supports adaptive animation complexity
 * for low-end devices.
 */

import { tokens } from '../theme/tokens';
import { shouldSimplifyAnimations, getCachedDeviceCapabilities } from './devicePerformance';

/**
 * Spring configuration interface for physics-based animations
 */
export interface SpringConfig {
  tension: number;
  friction: number;
  mass?: number;
}

/**
 * Reanimated spring configuration interface
 */
export interface ReanimatedSpringConfig {
  damping: number;
  stiffness: number;
  mass?: number;
}

/**
 * Gentle spring preset for subtle, smooth animations
 * Use for: Background transitions, theme changes, subtle UI updates
 */
export const gentleSpring: SpringConfig = {
  ...tokens.motion.spring.gentle,
  mass: 1,
};

/**
 * Default spring preset for standard UI animations
 * Use for: Task additions, completions, most UI interactions
 */
export const defaultSpring: SpringConfig = {
  ...tokens.motion.spring.default,
  mass: 1,
};

/**
 * Snappy spring preset for quick, responsive animations
 * Use for: Button presses, quick interactions, micro-interactions
 */
export const snappySpring: SpringConfig = {
  ...tokens.motion.spring.snappy,
  mass: 1,
};

/**
 * Reduced motion spring preset (minimal animation)
 * Use when reduced motion is enabled
 */
export const reducedMotionSpring: SpringConfig = {
  tension: 500,
  friction: 50,
  mass: 0.5,
};

/**
 * Simplified spring preset for low-end devices
 * Faster, less complex animations that maintain core functionality
 */
export const simplifiedSpring: SpringConfig = {
  tension: 400,
  friction: 30,
  mass: 0.8,
};

/**
 * Animation presets object for easy access
 */
export const springPresets = {
  gentle: gentleSpring,
  default: defaultSpring,
  snappy: snappySpring,
  reducedMotion: reducedMotionSpring,
  simplified: simplifiedSpring,
} as const;

/**
 * Create a custom spring configuration with optional overrides
 *
 * @param base - Base preset to start from
 * @param overrides - Optional property overrides
 * @returns Custom spring configuration
 */
export function createSpringConfig(
  base: keyof typeof springPresets = 'default',
  overrides?: Partial<SpringConfig>
): SpringConfig {
  return {
    ...springPresets[base],
    ...overrides,
  };
}

/**
 * Create a velocity-aware spring configuration
 * Higher velocity results in snappier animation
 *
 * @param velocity - Gesture velocity (points per second)
 * @param baseConfig - Base spring configuration
 * @returns Velocity-adjusted spring configuration
 */
export function createVelocityAwareSpring(
  velocity: number,
  baseConfig: SpringConfig = defaultSpring
): SpringConfig {
  // Normalize velocity (typical range: 0-2000 points/second)
  const normalizedVelocity = Math.min(Math.abs(velocity) / 2000, 1);

  // Increase tension for higher velocities (more snappy)
  const tensionMultiplier = 1 + normalizedVelocity * 0.5;

  return {
    ...baseConfig,
    tension: baseConfig.tension * tensionMultiplier,
  };
}

/**
 * Get spring configuration appropriate for accessibility settings
 *
 * @param isReducedMotion - Whether reduced motion is enabled
 * @param normalConfig - Normal spring configuration
 * @returns Spring configuration appropriate for the setting
 */
export function getAccessibleSpringConfig(
  isReducedMotion: boolean,
  normalConfig: SpringConfig = defaultSpring
): SpringConfig {
  return isReducedMotion ? reducedMotionSpring : normalConfig;
}

/**
 * Get spring configuration appropriate for device capabilities
 * Automatically simplifies animations on low-end devices while maintaining core functionality
 *
 * @param isReducedMotion - Whether reduced motion is enabled
 * @param normalConfig - Normal spring configuration
 * @returns Spring configuration appropriate for device and accessibility settings
 */
export function getDeviceAwareSpringConfig(
  isReducedMotion: boolean,
  normalConfig: SpringConfig = defaultSpring
): SpringConfig {
  // Reduced motion takes priority
  if (isReducedMotion) {
    return reducedMotionSpring;
  }

  // Check device capabilities
  const deviceCapabilities = getCachedDeviceCapabilities();
  if (deviceCapabilities.recommendedAnimationSimplification) {
    return simplifiedSpring;
  }

  return normalConfig;
}

/**
 * Convert spring config to Reanimated format
 *
 * @param config - Spring configuration
 * @returns Reanimated spring configuration
 */
export function toReanimatedSpring(config: SpringConfig): ReanimatedSpringConfig {
  return {
    damping: config.friction,
    stiffness: config.tension,
    mass: config.mass || 1,
  };
}

/**
 * Animation duration constants from design tokens
 */
export const animationDuration = {
  fast: tokens.motion.duration.fast,
  normal: tokens.motion.duration.normal,
  slow: tokens.motion.duration.slow,
} as const;
