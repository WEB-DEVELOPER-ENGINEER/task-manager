/**
 * ReorderModeButton Component
 *
 * Button to toggle reorder mode for drag-to-reorder functionality.
 * Provides visual feedback when reorder mode is active.
 *
 * Requirements: 4.3
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { useAppState } from '../state/context';
import { tokens } from '../theme/tokens';
import { typography } from '../utils/typography';

/**
 * ReorderModeButton component
 * Toggles reorder mode and provides visual feedback
 */
export const ReorderModeButton: React.FC = () => {
  const { theme, isReducedMotion } = useTheme();
  const { state, dispatch } = useAppState();
  const reorderMode = state.ui.reorderMode;
  const multiSelectMode = state.ui.multiSelectMode;

  // Animation values
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(reorderMode ? 1 : 0);

  // Spring configuration - adjust for reduced motion
  const springConfig = {
    damping: isReducedMotion ? 50 : tokens.motion.spring.default.friction,
    stiffness: isReducedMotion ? 500 : tokens.motion.spring.default.tension,
    mass: 1,
  };

  // Animate background when reorder mode changes - skip if reduced motion is enabled
  React.useEffect(() => {
    if (!isReducedMotion) {
      backgroundColor.value = withSpring(reorderMode ? 1 : 0, springConfig);
    } else {
      backgroundColor.value = reorderMode ? 1 : 0;
    }
  }, [reorderMode, backgroundColor, springConfig, isReducedMotion]);

  // Handle toggle
  const handleToggle = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate press - skip if reduced motion is enabled
    if (!isReducedMotion) {
      scale.value = withSpring(0.95, springConfig, () => {
        scale.value = withSpring(1, springConfig);
      });
    }

    // Toggle reorder mode
    dispatch({
      type: 'SET_REORDER_MODE',
      payload: !reorderMode,
    });
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: reorderMode ? theme.colors.accent : `${theme.colors.textSecondary}20`,
  }));

  // Disable button when in multi-select mode
  const isDisabled = multiSelectMode;

  return (
    <Pressable
      onPress={handleToggle}
      disabled={isDisabled}
      accessibilityLabel={reorderMode ? 'Exit reorder mode' : 'Enter reorder mode'}
      accessibilityHint={
        reorderMode
          ? 'Double tap to exit reorder mode'
          : 'Double tap to enable drag-to-reorder tasks'
      }
      accessibilityRole="button"
      accessibilityState={{ selected: reorderMode, disabled: isDisabled }}
    >
      <Animated.View style={[styles.button, animatedStyle, isDisabled && styles.buttonDisabled]}>
        <Text
          style={[
            styles.buttonText,
            {
              color: reorderMode ? '#FFFFFF' : theme.colors.textSecondary,
            },
            isDisabled && styles.buttonTextDisabled,
          ]}
        >
          {reorderMode ? '✓ Reorder' : '☰ Reorder'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.radius.md,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});

// Memoize component to prevent unnecessary re-renders
export const ReorderModeButtonMemo = React.memo(ReorderModeButton);
