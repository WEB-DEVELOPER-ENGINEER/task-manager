/**
 * Device Performance Detection Module
 *
 * Detects device capabilities and classifies devices as low-end or high-end
 * to enable graceful degradation of visual effects and animations.
 *
 * Requirements: 1.5
 */

import { Platform, Dimensions } from 'react-native';

/**
 * Device performance tier classification
 */
export type PerformanceTier = 'low' | 'high';

/**
 * Device capabilities interface
 */
export interface DeviceCapabilities {
  tier: PerformanceTier;
  supportsFullBlur: boolean;
  supportsComplexAnimations: boolean;
  recommendedBlurReduction: number; // 0 to 1, where 1 = full reduction
  recommendedAnimationSimplification: boolean;
}

/**
 * Detect device performance tier based on platform and hardware characteristics
 *
 * Classification criteria:
 * - iOS: Devices older than iPhone 8 / iPad 5th gen are considered low-end
 * - Android: Devices with less than 2GB RAM or older Android versions are low-end
 * - Screen resolution and pixel density are also considered
 *
 * @returns Performance tier classification
 */
export function detectPerformanceTier(): PerformanceTier {
  const { width, height } = Dimensions.get('window');
  const screenPixels = width * height;

  // Platform-specific detection
  if (Platform.OS === 'ios') {
    // iOS version detection
    const version = parseInt(Platform.Version as string, 10);

    // iOS 12 and below are considered low-end
    if (version < 13) {
      return 'low';
    }

    // Small screen devices (iPhone SE 1st gen and similar)
    if (screenPixels < 750 * 1334) {
      return 'low';
    }

    return 'high';
  }

  if (Platform.OS === 'android') {
    // Android version detection
    const version = Platform.Version as number;

    // Android 8 (API 26) and below are considered low-end
    if (version < 27) {
      return 'low';
    }

    // Low resolution devices
    if (screenPixels < 720 * 1280) {
      return 'low';
    }

    return 'high';
  }

  // Default to high for web and other platforms
  return 'high';
}

/**
 * Get comprehensive device capabilities based on performance tier
 *
 * @returns Device capabilities object with recommendations
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  const tier = detectPerformanceTier();

  if (tier === 'low') {
    return {
      tier: 'low',
      supportsFullBlur: false,
      supportsComplexAnimations: false,
      recommendedBlurReduction: 0.5, // Reduce blur by 50%
      recommendedAnimationSimplification: true,
    };
  }

  return {
    tier: 'high',
    supportsFullBlur: true,
    supportsComplexAnimations: true,
    recommendedBlurReduction: 0,
    recommendedAnimationSimplification: false,
  };
}

/**
 * Check if device supports full blur effects
 *
 * @returns True if device can handle full blur intensity
 */
export function supportsFullBlur(): boolean {
  return getDeviceCapabilities().supportsFullBlur;
}

/**
 * Check if device supports complex animations
 *
 * @returns True if device can handle complex spring animations
 */
export function supportsComplexAnimations(): boolean {
  return getDeviceCapabilities().supportsComplexAnimations;
}

/**
 * Get recommended blur intensity multiplier for current device
 * Returns a value between 0 and 1 to multiply with desired blur intensity
 *
 * @returns Blur intensity multiplier (0-1)
 */
export function getBlurIntensityMultiplier(): number {
  const capabilities = getDeviceCapabilities();
  return 1 - capabilities.recommendedBlurReduction;
}

/**
 * Check if animations should be simplified for current device
 *
 * @returns True if animations should be simplified
 */
export function shouldSimplifyAnimations(): boolean {
  return getDeviceCapabilities().recommendedAnimationSimplification;
}

/**
 * Singleton instance of device capabilities (cached)
 */
let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Get cached device capabilities (computed once)
 *
 * @returns Cached device capabilities
 */
export function getCachedDeviceCapabilities(): DeviceCapabilities {
  if (!cachedCapabilities) {
    cachedCapabilities = getDeviceCapabilities();
  }
  return cachedCapabilities;
}
