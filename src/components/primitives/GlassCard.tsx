/**
 * GlassCard Primitive Component
 *
 * A reusable glassmorphism card component with frosted glass effects,
 * configurable blur intensity, translucency, and subtle gradients.
 * Supports animated theme transitions.
 *
 * Requirements: 1.1, 1.2, 1.3, 9.4
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, ViewStyle, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';
import {
  getBlurIntensityMultiplier,
  getCachedDeviceCapabilities,
} from '../../utils/devicePerformance';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurIntensity?: 'subtle' | 'medium' | 'strong' | 'intense';
  translucency?: number; // 0.7 to 0.95
  adaptive?: boolean;
  testID?: string;
}

/**
 * GlassCard component with glassmorphism effects
 *
 * Applies frosted glass visual effects with dynamic blur, layered depth,
 * and translucency. Supports adaptive blur based on background content.
 * Animates smoothly during theme transitions.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurIntensity = 'medium',
  translucency = 0.8,
  adaptive = true,
  testID,
}) => {
  const { theme, previousTheme, isTransitioning, isReducedMotion } = useTheme();
  const progress = useSharedValue(0);
  const [currentBlurIntensity, setCurrentBlurIntensity] = useState(tokens.blur[blurIntensity]);
  const [isExpoGo, setIsExpoGo] = useState(false);

  // Detect if running in Expo Go
  useEffect(() => {
    const checkExpoGo = async () => {
      try {
        // @ts-ignore - Constants is available in Expo
        const Constants = require('expo-constants').default;
        setIsExpoGo(Constants.appOwnership === 'expo');
      } catch {
        setIsExpoGo(false);
      }
    };
    checkExpoGo();
  }, []);

  // Get device capabilities for adaptive blur
  const deviceCapabilities = getCachedDeviceCapabilities();
  const blurMultiplier = getBlurIntensityMultiplier();

  // Map blur intensity to token values
  const blurValue = tokens.blur[blurIntensity];

  // Determine blur tint based on theme mode
  const blurTint = theme.mode === 'dark' ? 'dark' : 'light';

  // Apply adaptive blur based on device capabilities and theme settings
  // On low-end devices, reduce blur intensity to maintain performance
  const effectiveBlurIntensity =
    adaptive && theme.blur.adaptive ? blurValue * blurMultiplier : blurValue;

  // Determine animation duration based on reduced motion setting
  const duration = isReducedMotion ? tokens.motion.duration.fast : tokens.motion.duration.normal;

  // Animate progress during theme transitions
  useEffect(() => {
    if (isTransitioning && previousTheme) {
      progress.value = withTiming(1, { duration });
    } else {
      progress.value = 0;
    }
  }, [isTransitioning, previousTheme, progress, duration]);

  // Animate blur intensity changes
  useEffect(() => {
    if (isTransitioning && previousTheme) {
      const previousBlur = tokens.blur[blurIntensity];
      const targetBlur = effectiveBlurIntensity;

      // Interpolate blur intensity
      const interpolatedBlur = progress.value * (targetBlur - previousBlur) + previousBlur;
      setCurrentBlurIntensity(interpolatedBlur);
    } else {
      setCurrentBlurIntensity(effectiveBlurIntensity);
    }
  }, [isTransitioning, previousTheme, effectiveBlurIntensity, blurIntensity, progress.value]);

  // Animated background color
  const animatedOverlayStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return {
        backgroundColor: `${theme.colors.surfaceGlass}${Math.round(translucency * 255)
          .toString(16)
          .padStart(2, '0')}`,
      };
    }

    const interpolated = interpolateColor(
      progress.value,
      [0, 1],
      [
        `${previousTheme.colors.surfaceGlass}${Math.round(translucency * 255)
          .toString(16)
          .padStart(2, '0')}`,
        `${theme.colors.surfaceGlass}${Math.round(translucency * 255)
          .toString(16)
          .padStart(2, '0')}`,
      ]
    );

    return {
      backgroundColor: interpolated,
    };
  });

  // Fallback style for Expo Go (no blur)
  const fallbackStyle = useAnimatedStyle(() => {
    if (!isTransitioning || !previousTheme) {
      return {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    }

    const bgColor = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors.surface, theme.colors.surface]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [previousTheme.colors.border, theme.colors.border]
    );

    return {
      backgroundColor: bgColor,
      borderWidth: 1,
      borderColor: borderColor,
    };
  });

  // Use fallback rendering in Expo Go or web
  if (isExpoGo || Platform.OS === 'web') {
    return (
      <Animated.View style={[styles.container, fallbackStyle, style]} testID={testID}>
        <View style={styles.gradientOverlay}>{children}</View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, style]} testID={testID}>
      <BlurView intensity={currentBlurIntensity} tint={blurTint} style={styles.blurContainer}>
        <Animated.View style={[styles.glassOverlay, animatedOverlayStyle]}>
          <Animated.View style={styles.gradientOverlay}>{children}</Animated.View>
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: tokens.radius.lg,
  },
  glassOverlay: {
    borderRadius: tokens.radius.lg,
  },
  gradientOverlay: {
    padding: tokens.spacing.md,
  },
});

// Memoize component to prevent unnecessary re-renders
export const GlassCardMemo = React.memo(GlassCard);
