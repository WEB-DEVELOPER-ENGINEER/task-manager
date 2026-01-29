/**
 * Animated Theme Hook
 *
 * Provides animated interpolation between theme colors and properties
 * during theme transitions. Uses react-native-reanimated for smooth
 * color transitions.
 */

import { useEffect, useMemo } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from './ThemeProvider';
import { tokens } from './tokens';
import { ThemeConfig, ThemeColors } from '../types/Theme';

/**
 * Hook for animating theme color transitions
 *
 * Returns animated styles that smoothly transition between theme colors
 * when the theme changes.
 *
 * @param colorKey - The key of the color to animate (e.g., 'background', 'text')
 * @returns Animated color value
 *
 * @example
 * const backgroundColor = useAnimatedThemeColor('background');
 * <Animated.View style={{ backgroundColor }} />
 */
export function useAnimatedThemeColor(colorKey: keyof ThemeColors) {
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();
  const progress = useSharedValue(0);

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  useEffect(() => {
    if (isTransitioning && previousTheme) {
      // Animate from 0 to 1 during transition
      progress.value = withTiming(1, { duration });
    } else {
      // Reset progress when not transitioning
      progress.value = 0;
    }
  }, [isTransitioning, previousTheme, progress, duration]);

  const animatedColor = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return { color: theme.colors[colorKey] };
    }

    const interpolated = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors[colorKey], theme.colors[colorKey]]
    );

    return { color: interpolated };
  });

  return animatedColor.color;
}

/**
 * Hook for animating multiple theme properties at once
 *
 * Returns an object with animated values for multiple style properties
 * that smoothly transition during theme changes.
 *
 * @param styleFactory - Function that creates styles from theme
 * @returns Animated style object
 *
 * @example
 * const animatedStyle = useAnimatedThemeStyle((theme) => ({
 *   backgroundColor: theme.colors.background,
 *   borderColor: theme.colors.border,
 * }));
 */
export function useAnimatedThemeStyle(
  styleFactory: (theme: ThemeConfig) => Record<string, string | number>
) {
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();
  const progress = useSharedValue(0);

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  useEffect(() => {
    if (isTransitioning && previousTheme) {
      // Animate from 0 to 1 during transition
      progress.value = withTiming(1, { duration });
    } else {
      // Reset progress when not transitioning
      progress.value = 0;
    }
  }, [isTransitioning, previousTheme, progress, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return styleFactory(theme);
    }

    const currentStyles = styleFactory(theme);
    const previousStyles = styleFactory(previousTheme);
    const result: Record<string, string | number> = {};

    // Interpolate each color property
    for (const key in currentStyles) {
      const currentValue = currentStyles[key];
      const previousValue = previousStyles[key];

      // Check if the value is a color (string starting with # or rgb)
      if (
        typeof currentValue === 'string' &&
        typeof previousValue === 'string' &&
        (currentValue.startsWith('#') || currentValue.startsWith('rgb'))
      ) {
        result[key] = interpolateColor(progress.value, [0, 1], [previousValue, currentValue]);
      } else if (typeof currentValue === 'number' && typeof previousValue === 'number') {
        // Interpolate numeric values (like blur intensity)
        result[key] = progress.value * (currentValue - previousValue) + previousValue;
      } else {
        // Non-animatable values use current value
        result[key] = currentValue;
      }
    }

    return result;
  });

  return animatedStyle;
}

/**
 * Hook for animating blur intensity during theme transitions
 *
 * @param blurKey - The blur property to animate ('surface' or 'overlay')
 * @returns Animated blur intensity value
 *
 * @example
 * const blurIntensity = useAnimatedBlurIntensity('surface');
 * <BlurView intensity={blurIntensity} />
 */
export function useAnimatedBlurIntensity(blurKey: 'surface' | 'overlay'): number {
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();
  const progress = useSharedValue(0);

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  useEffect(() => {
    if (isTransitioning && previousTheme) {
      progress.value = withTiming(1, { duration });
    } else {
      progress.value = 0;
    }
  }, [isTransitioning, previousTheme, progress, duration]);

  // Calculate interpolated blur value
  const blurIntensity = useMemo(() => {
    if (!isTransitioning || !previousTheme) {
      return theme.blur[blurKey];
    }

    const currentBlur = theme.blur[blurKey];
    const previousBlur = previousTheme.blur[blurKey];

    // Linear interpolation for blur
    return progress.value * (currentBlur - previousBlur) + previousBlur;
  }, [isTransitioning, previousTheme, theme, blurKey, progress.value]);

  return blurIntensity;
}

/**
 * Hook that returns whether a theme transition is currently in progress
 * Useful for components that need to know about transition state
 *
 * @returns Boolean indicating if theme is transitioning
 */
export function useIsThemeTransitioning(): boolean {
  const { isTransitioning } = useTheme();
  return isTransitioning;
}
