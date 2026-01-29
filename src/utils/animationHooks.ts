/**
 * Animation Hooks
 *
 * Reusable React hooks for spring-based animations using both react-spring
 * and react-native-reanimated. Provides consistent animation behavior across
 * the application with support for velocity-aware animations and device-aware
 * animation simplification for low-end devices.
 */

import { useSpring, useSpringValue, config as springConfig } from '@react-spring/native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { useMemo, useCallback } from 'react';
import {
  SpringConfig,
  defaultSpring,
  createVelocityAwareSpring,
  springPresets,
  getDeviceAwareSpringConfig,
} from './animations';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Hook for basic spring animations using react-spring
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param initialValue - Initial animation value
 * @param config - Spring configuration (defaults to defaultSpring)
 * @returns Spring animation value and setter function
 *
 * @example
 * const [opacity, setOpacity] = useSpringAnimation(0);
 * // Later: setOpacity(1) to animate to 1
 */
export function useSpringAnimation<T extends object>(
  initialValue: T,
  config: SpringConfig = defaultSpring
) {
  const { isReducedMotion } = useTheme();

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  const springValue = useSpring({
    from: initialValue,
    to: initialValue,
    config: {
      tension: effectiveConfig.tension,
      friction: effectiveConfig.friction,
      mass: effectiveConfig.mass || 1,
    },
  });

  return springValue;
}

/**
 * Hook for gesture-based animations with velocity awareness
 * Uses react-native-reanimated for better performance with gestures
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param initialValue - Initial animation value
 * @param config - Base spring configuration
 * @returns Object with shared value, animated style, and animation functions
 *
 * @example
 * const { value, animatedStyle, animateTo, animateWithVelocity } = useGestureAnimation(0);
 * // In gesture handler: animateWithVelocity(100, 500) // target, velocity
 */
export function useGestureAnimation(initialValue: number, config: SpringConfig = defaultSpring) {
  const { isReducedMotion } = useTheme();
  const sharedValue = useSharedValue(initialValue);

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  // Convert SpringConfig to WithSpringConfig for reanimated
  const reanimatedConfig: WithSpringConfig = useMemo(
    () => ({
      damping: effectiveConfig.friction,
      stiffness: effectiveConfig.tension,
      mass: effectiveConfig.mass || 1,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    }),
    [effectiveConfig.friction, effectiveConfig.tension, effectiveConfig.mass]
  );

  /**
   * Animate to a target value with standard spring
   */
  const animateTo = useCallback(
    (target: number, customConfig?: Partial<SpringConfig>) => {
      const finalConfig = customConfig
        ? {
            damping: customConfig.friction || effectiveConfig.friction,
            stiffness: customConfig.tension || effectiveConfig.tension,
            mass: customConfig.mass || effectiveConfig.mass || 1,
          }
        : reanimatedConfig;

      sharedValue.value = withSpring(target, finalConfig as WithSpringConfig);
    },
    [sharedValue, effectiveConfig, reanimatedConfig]
  );

  /**
   * Animate to a target value with velocity-aware spring
   * Higher velocity results in snappier animation
   */
  const animateWithVelocity = useCallback(
    (target: number, velocity: number) => {
      const velocityConfig = createVelocityAwareSpring(velocity, effectiveConfig);
      const reanimatedVelocityConfig: WithSpringConfig = {
        damping: velocityConfig.friction,
        stiffness: velocityConfig.tension,
        mass: velocityConfig.mass || 1,
        velocity: velocity,
      };

      sharedValue.value = withSpring(target, reanimatedVelocityConfig);
    },
    [sharedValue, effectiveConfig]
  );

  /**
   * Reset to initial value
   */
  const reset = useCallback(() => {
    sharedValue.value = withSpring(initialValue, reanimatedConfig);
  }, [sharedValue, initialValue, reanimatedConfig]);

  return {
    value: sharedValue,
    animateTo,
    animateWithVelocity,
    reset,
  };
}

/**
 * Hook for creating animated styles with spring physics
 * Useful for animating multiple style properties together
 *
 * @param styleFactory - Function that creates animated styles from shared values
 * @returns Animated style object
 *
 * @example
 * const translateX = useSharedValue(0);
 * const animatedStyle = useAnimatedSpringStyle(() => ({
 *   transform: [{ translateX: translateX.value }]
 * }));
 */
export function useAnimatedSpringStyle(styleFactory: () => Record<string, any>) {
  return useAnimatedStyle(styleFactory);
}

/**
 * Hook for scale animation (common for press interactions)
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param config - Spring configuration
 * @returns Object with animated style and press handlers
 *
 * @example
 * const { animatedStyle, onPressIn, onPressOut } = useScaleAnimation();
 * <Animated.View style={animatedStyle}>...</Animated.View>
 */
export function useScaleAnimation(config: SpringConfig = springPresets.snappy) {
  const { isReducedMotion } = useTheme();
  const scale = useSharedValue(1);

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  const reanimatedConfig: WithSpringConfig = useMemo(
    () => ({
      damping: effectiveConfig.friction,
      stiffness: effectiveConfig.tension,
      mass: effectiveConfig.mass || 1,
    }),
    [effectiveConfig]
  );

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.95, reanimatedConfig);
  }, [scale, reanimatedConfig]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, reanimatedConfig);
  }, [scale, reanimatedConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    scale,
  };
}

/**
 * Hook for opacity fade animation
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param visible - Whether element should be visible
 * @param config - Spring configuration
 * @returns Animated style with opacity
 *
 * @example
 * const animatedStyle = useFadeAnimation(isVisible);
 */
export function useFadeAnimation(visible: boolean, config: SpringConfig = defaultSpring) {
  const { isReducedMotion } = useTheme();
  const opacity = useSharedValue(visible ? 1 : 0);

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  const reanimatedConfig: WithSpringConfig = useMemo(
    () => ({
      damping: effectiveConfig.friction,
      stiffness: effectiveConfig.tension,
      mass: effectiveConfig.mass || 1,
    }),
    [effectiveConfig]
  );

  // Update opacity when visible changes
  useMemo(() => {
    opacity.value = withSpring(visible ? 1 : 0, reanimatedConfig);
  }, [visible, opacity, reanimatedConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

/**
 * Hook for slide animation (useful for swipe gestures)
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param config - Spring configuration
 * @returns Object with animated style and slide functions
 *
 * @example
 * const { animatedStyle, slideLeft, slideRight, reset } = useSlideAnimation();
 */
export function useSlideAnimation(config: SpringConfig = defaultSpring) {
  const { isReducedMotion } = useTheme();
  const translateX = useSharedValue(0);

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  const reanimatedConfig: WithSpringConfig = useMemo(
    () => ({
      damping: effectiveConfig.friction,
      stiffness: effectiveConfig.tension,
      mass: effectiveConfig.mass || 1,
    }),
    [effectiveConfig]
  );

  const slideLeft = useCallback(
    (distance: number) => {
      translateX.value = withSpring(-distance, reanimatedConfig);
    },
    [translateX, reanimatedConfig]
  );

  const slideRight = useCallback(
    (distance: number) => {
      translateX.value = withSpring(distance, reanimatedConfig);
    },
    [translateX, reanimatedConfig]
  );

  const reset = useCallback(() => {
    translateX.value = withSpring(0, reanimatedConfig);
  }, [translateX, reanimatedConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    animatedStyle,
    slideLeft,
    slideRight,
    reset,
    translateX,
  };
}

/**
 * Hook for rotation animation
 * Automatically adapts animation complexity based on device capabilities
 *
 * @param config - Spring configuration
 * @returns Object with animated style and rotation functions
 *
 * @example
 * const { animatedStyle, rotateTo } = useRotationAnimation();
 * rotateTo(180); // Rotate to 180 degrees
 */
export function useRotationAnimation(config: SpringConfig = defaultSpring) {
  const { isReducedMotion } = useTheme();
  const rotation = useSharedValue(0);

  // Get device-aware configuration
  const effectiveConfig = getDeviceAwareSpringConfig(isReducedMotion, config);

  const reanimatedConfig: WithSpringConfig = useMemo(
    () => ({
      damping: effectiveConfig.friction,
      stiffness: effectiveConfig.tension,
      mass: effectiveConfig.mass || 1,
    }),
    [effectiveConfig]
  );

  const rotateTo = useCallback(
    (degrees: number) => {
      rotation.value = withSpring(degrees, reanimatedConfig);
    },
    [rotation, reanimatedConfig]
  );

  const reset = useCallback(() => {
    rotation.value = withSpring(0, reanimatedConfig);
  }, [rotation, reanimatedConfig]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return {
    animatedStyle,
    rotateTo,
    reset,
    rotation,
  };
}
