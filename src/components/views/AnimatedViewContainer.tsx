/**
 * AnimatedViewContainer Component
 *
 * Container that provides spring-based animated transitions when switching between views.
 * Animates opacity and scale for smooth view changes.
 *
 * Requirements: 6.5
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { tokens } from '../../theme/tokens';

export interface AnimatedViewContainerProps {
  children: React.ReactNode;
  viewKey: string; // Unique key for the current view
}

/**
 * AnimatedViewContainer component
 * Animates view transitions using spring physics
 */
export const AnimatedViewContainer: React.FC<AnimatedViewContainerProps> = ({
  children,
  viewKey,
}) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const previousViewKey = useRef(viewKey);

  useEffect(() => {
    // Only animate if the view actually changed
    if (previousViewKey.current !== viewKey) {
      // Animate out
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 0,
          tension: tokens.motion.spring.snappy.tension,
          friction: tokens.motion.spring.snappy.friction,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.95,
          tension: tokens.motion.spring.snappy.tension,
          friction: tokens.motion.spring.snappy.friction,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update the previous view key
        previousViewKey.current = viewKey;

        // Animate in
        Animated.parallel([
          Animated.spring(opacity, {
            toValue: 1,
            tension: tokens.motion.spring.default.tension,
            friction: tokens.motion.spring.default.friction,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: tokens.motion.spring.default.tension,
            friction: tokens.motion.spring.default.friction,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [viewKey, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
