/**
 * Device Performance Detection Tests
 *
 * Tests for device capability detection and performance tier classification
 */

import {
  detectPerformanceTier,
  getDeviceCapabilities,
  supportsFullBlur,
  supportsComplexAnimations,
  getBlurIntensityMultiplier,
  shouldSimplifyAnimations,
  getCachedDeviceCapabilities,
} from '../../src/utils/devicePerformance';

describe('Device Performance Detection', () => {
  describe('detectPerformanceTier', () => {
    it('should return a valid performance tier', () => {
      const tier = detectPerformanceTier();
      expect(['low', 'high']).toContain(tier);
    });
  });

  describe('getDeviceCapabilities', () => {
    it('should return device capabilities object', () => {
      const capabilities = getDeviceCapabilities();

      expect(capabilities).toHaveProperty('tier');
      expect(capabilities).toHaveProperty('supportsFullBlur');
      expect(capabilities).toHaveProperty('supportsComplexAnimations');
      expect(capabilities).toHaveProperty('recommendedBlurReduction');
      expect(capabilities).toHaveProperty('recommendedAnimationSimplification');
    });

    it('should have consistent capabilities for tier', () => {
      const capabilities = getDeviceCapabilities();

      if (capabilities.tier === 'low') {
        expect(capabilities.supportsFullBlur).toBe(false);
        expect(capabilities.supportsComplexAnimations).toBe(false);
        expect(capabilities.recommendedBlurReduction).toBeGreaterThan(0);
        expect(capabilities.recommendedAnimationSimplification).toBe(true);
      } else {
        expect(capabilities.supportsFullBlur).toBe(true);
        expect(capabilities.supportsComplexAnimations).toBe(true);
        expect(capabilities.recommendedBlurReduction).toBe(0);
        expect(capabilities.recommendedAnimationSimplification).toBe(false);
      }
    });
  });

  describe('supportsFullBlur', () => {
    it('should return a boolean', () => {
      const result = supportsFullBlur();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('supportsComplexAnimations', () => {
    it('should return a boolean', () => {
      const result = supportsComplexAnimations();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getBlurIntensityMultiplier', () => {
    it('should return a value between 0 and 1', () => {
      const multiplier = getBlurIntensityMultiplier();
      expect(multiplier).toBeGreaterThanOrEqual(0);
      expect(multiplier).toBeLessThanOrEqual(1);
    });

    it('should return 1 for high-end devices', () => {
      const capabilities = getDeviceCapabilities();
      const multiplier = getBlurIntensityMultiplier();

      if (capabilities.tier === 'high') {
        expect(multiplier).toBe(1);
      }
    });

    it('should return less than 1 for low-end devices', () => {
      const capabilities = getDeviceCapabilities();
      const multiplier = getBlurIntensityMultiplier();

      if (capabilities.tier === 'low') {
        expect(multiplier).toBeLessThan(1);
      }
    });
  });

  describe('shouldSimplifyAnimations', () => {
    it('should return a boolean', () => {
      const result = shouldSimplifyAnimations();
      expect(typeof result).toBe('boolean');
    });

    it('should match device capabilities', () => {
      const capabilities = getDeviceCapabilities();
      const shouldSimplify = shouldSimplifyAnimations();

      expect(shouldSimplify).toBe(capabilities.recommendedAnimationSimplification);
    });
  });

  describe('getCachedDeviceCapabilities', () => {
    it('should return same object on multiple calls', () => {
      const first = getCachedDeviceCapabilities();
      const second = getCachedDeviceCapabilities();

      expect(first).toBe(second); // Same reference
    });

    it('should return valid capabilities', () => {
      const capabilities = getCachedDeviceCapabilities();

      expect(capabilities).toHaveProperty('tier');
      expect(['low', 'high']).toContain(capabilities.tier);
    });
  });
});
