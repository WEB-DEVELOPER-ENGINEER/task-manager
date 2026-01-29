/**
 * AnimatedButton Primitive Component
 *
 * A reusable button component with spring-based press animations,
 * haptic feedback, and glassmorphism styling.
 *
 * Requirements: 2.1, 3.1, 3.4
 */

import React, { useCallback } from 'react';
import { StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './GlassCard';
import { tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
}

/**
 * AnimatedButton component with spring animations and haptic feedback
 *
 * Provides spring-based press animations, haptic feedback on press,
 * and glassmorphism styling for a premium button experience.
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  hapticStyle = 'light',
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}) => {
  const { theme, isReducedMotion } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Spring configuration from design tokens - adjust for reduced motion
  const springConfig = {
    damping: isReducedMotion ? 50 : tokens.motion.spring.default.friction,
    stiffness: isReducedMotion ? 500 : tokens.motion.spring.default.tension,
    mass: 1,
  };

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Handle press in - animate down and reduce opacity - skip if reduced motion is enabled
  const handlePressIn = useCallback(() => {
    if (disabled) return;

    if (!isReducedMotion) {
      scale.value = withSpring(0.95, springConfig);
      opacity.value = withSpring(0.8, springConfig);
    }
  }, [disabled, scale, opacity, springConfig, isReducedMotion]);

  // Handle press out - animate back to normal - skip if reduced motion is enabled
  const handlePressOut = useCallback(() => {
    if (disabled) return;

    if (!isReducedMotion) {
      scale.value = withSpring(1, springConfig);
      opacity.value = withSpring(1, springConfig);
    }
  }, [disabled, scale, opacity, springConfig, isReducedMotion]);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (disabled) return;

    // Trigger haptic feedback
    const hapticType =
      hapticStyle === 'light'
        ? Haptics.ImpactFeedbackStyle.Light
        : hapticStyle === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;

    Haptics.impactAsync(hapticType);

    // Call the onPress handler
    onPress();
  }, [disabled, hapticStyle, onPress]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        style={styles.pressable}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled }}
      >
        <GlassCard
          blurIntensity="medium"
          translucency={0.85}
          style={StyleSheet.flatten([
            styles.buttonContainer,
            disabled && { opacity: tokens.opacity.disabled },
          ])}
        >
          {children}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    minHeight: 44, // Accessibility minimum touch target
  },
});

// Memoize component to prevent unnecessary re-renders
export const AnimatedButtonMemo = React.memo(AnimatedButton);
