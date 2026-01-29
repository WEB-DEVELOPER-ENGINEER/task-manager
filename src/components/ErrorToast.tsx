/**
 * ErrorToast Component
 *
 * Displays subtle, non-intrusive error feedback to users.
 * Uses glassmorphism styling and spring animations.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { subscribeToErrors, ErrorFeedback } from '../utils/errorFeedback';

const { width } = Dimensions.get('window');

export const ErrorToast: React.FC = () => {
  const { theme } = useTheme();
  const [currentError, setCurrentError] = useState<ErrorFeedback | null>(null);
  const [translateY] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to error events
    const unsubscribe = subscribeToErrors(feedback => {
      setCurrentError(feedback);

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: tokens.motion.spring.default.tension,
          friction: tokens.motion.spring.default.friction,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: tokens.motion.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
        dismissError();
      }, 3000);

      return () => clearTimeout(timeout);
    });

    return unsubscribe;
  }, []);

  const dismissError = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        tension: tokens.motion.spring.default.tension,
        friction: tokens.motion.spring.default.friction,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: tokens.motion.duration.normal,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentError(null);
    });
  };

  if (!currentError) {
    return null;
  }

  const severityColor =
    currentError.severity === 'error'
      ? theme.colors.error
      : currentError.severity === 'warning'
        ? theme.colors.warning
        : theme.colors.accent;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <BlurView
        intensity={theme.blur.surface}
        tint={theme.mode === 'dark' ? 'dark' : 'light'}
        style={[
          styles.toast,
          {
            backgroundColor: theme.colors.surfaceGlass,
            borderColor: severityColor,
          },
        ]}
      >
        <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={2}>
          {currentError.message}
        </Text>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: tokens.spacing.xl,
    left: tokens.spacing.md,
    right: tokens.spacing.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    width: width - tokens.spacing.md * 2,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
