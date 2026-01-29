/**
 * BatchActionBar Component
 *
 * Displays batch action buttons when in multi-select mode.
 * Provides buttons for batch delete and batch complete operations.
 *
 * Requirements: 15.4
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './primitives/GlassCard';
import { useTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { typography } from '../utils/typography';

export interface BatchActionBarProps {
  selectedCount: number;
  onBatchDelete: () => void;
  onBatchComplete: () => void;
  onCancel: () => void;
}

/**
 * BatchActionBar component with glassmorphism styling
 *
 * Features:
 * - Batch delete button
 * - Batch complete button
 * - Cancel button
 * - Glassmorphism effects
 * - Spring animations
 * - Entrance/exit animations
 */
export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onBatchDelete,
  onBatchComplete,
  onCancel,
}) => {
  const { theme, isReducedMotion } = useTheme();

  // Animation values for button presses
  const deleteScale = useSharedValue(1);
  const completeScale = useSharedValue(1);
  const cancelScale = useSharedValue(1);

  // Animation values for entrance
  const barScale = useSharedValue(0.8);
  const barOpacity = useSharedValue(0);

  // Spring configuration - adjust for reduced motion
  const springConfig = {
    damping: isReducedMotion ? 50 : tokens.motion.spring.default.friction,
    stiffness: isReducedMotion ? 500 : tokens.motion.spring.default.tension,
    mass: 1,
  };

  // Animate entrance on mount - skip if reduced motion is enabled
  React.useEffect(() => {
    if (!isReducedMotion) {
      barScale.value = withSpring(1, springConfig);
      barOpacity.value = withSpring(1, springConfig);
    } else {
      barScale.value = 1;
      barOpacity.value = 1;
    }
  }, [barScale, barOpacity, springConfig, isReducedMotion]);

  // Handle batch delete
  const handleBatchDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!isReducedMotion) {
      deleteScale.value = withSpring(0.9, springConfig, () => {
        deleteScale.value = withSpring(1, springConfig);
      });
    }
    onBatchDelete();
  };

  // Handle batch complete
  const handleBatchComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isReducedMotion) {
      completeScale.value = withSpring(0.9, springConfig, () => {
        completeScale.value = withSpring(1, springConfig);
      });
    }
    onBatchComplete();
  };

  // Handle cancel
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isReducedMotion) {
      cancelScale.value = withSpring(0.9, springConfig, () => {
        cancelScale.value = withSpring(1, springConfig);
      });
    }
    onCancel();
  };

  // Animated styles
  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const completeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeScale.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: barScale.value }],
    opacity: barOpacity.value,
  }));

  return (
    <Animated.View style={barAnimatedStyle}>
      <GlassCard blurIntensity="strong" translucency={0.9} style={styles.container}>
        <View style={styles.content}>
          {/* Selected count */}
          <Text
            style={[styles.countText, { color: theme.colors.text }]}
            accessibilityLabel={`${selectedCount} ${selectedCount === 1 ? 'task' : 'tasks'} selected`}
          >
            {selectedCount} selected
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {/* Complete button */}
            <Animated.View style={completeAnimatedStyle}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={handleBatchComplete}
                accessibilityLabel="Complete selected tasks"
                accessibilityHint={`Double tap to mark ${selectedCount} ${selectedCount === 1 ? 'task' : 'tasks'} as complete`}
                accessibilityRole="button"
                disabled={selectedCount === 0}
              >
                <Text style={styles.buttonText}>✓ Complete</Text>
              </Pressable>
            </Animated.View>

            {/* Delete button */}
            <Animated.View style={deleteAnimatedStyle}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                onPress={handleBatchDelete}
                accessibilityLabel="Delete selected tasks"
                accessibilityHint={`Double tap to delete ${selectedCount} ${selectedCount === 1 ? 'task' : 'tasks'}`}
                accessibilityRole="button"
                disabled={selectedCount === 0}
              >
                <Text style={styles.buttonText}>🗑️ Delete</Text>
              </Pressable>
            </Animated.View>

            {/* Cancel button */}
            <Animated.View style={cancelAnimatedStyle}>
              <Pressable
                style={[styles.cancelButton, { borderColor: theme.colors.textSecondary }]}
                onPress={handleCancel}
                accessibilityLabel="Cancel multi-select mode"
                accessibilityHint="Double tap to exit multi-select mode"
                accessibilityRole="button"
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: tokens.spacing.md,
    marginVertical: tokens.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
  },
  countText: {
    ...typography.body,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    minWidth: 44, // Accessibility minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.bodySmall,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    minWidth: 44, // Accessibility minimum touch target
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});

// Memoize component to prevent unnecessary re-renders
export default React.memo(BatchActionBar);
