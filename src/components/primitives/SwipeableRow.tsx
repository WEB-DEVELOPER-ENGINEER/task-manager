/**
 * SwipeableRow Primitive Component
 *
 * A reusable swipeable row component with velocity-aware gesture handling,
 * support for left and right swipe actions, and spring-based animations.
 *
 * Requirements: 4.1, 4.2, 14.1, 14.2
 */

import React, { useCallback } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { tokens } from '../../theme/tokens';

export interface SwipeAction {
  onTrigger: () => void;
  threshold?: number; // Distance threshold in points (default: 50)
}

export interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeLeft?: SwipeAction;
  onSwipeRight?: SwipeAction;
  style?: ViewStyle;
  velocityThreshold?: number; // Velocity threshold in points/second (default: 500)
  testID?: string;
}

/**
 * SwipeableRow component with velocity-aware gesture handling
 *
 * Supports left and right swipe actions with velocity awareness.
 * Automatically completes swipe action if velocity exceeds threshold,
 * otherwise requires distance threshold to be met.
 */
export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
  velocityThreshold = 500,
  testID,
}) => {
  const translateX = useSharedValue(0);

  // Spring configuration from design tokens
  const springConfig = {
    damping: tokens.motion.spring.default.friction,
    stiffness: tokens.motion.spring.default.tension,
    mass: 1,
  };

  // Default distance threshold
  const defaultDistanceThreshold = 50;

  // Handle swipe completion
  const handleSwipeComplete = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft.onTrigger();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight.onTrigger();
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      // Update translation based on gesture
      translateX.value = event.translationX;
    })
    .onEnd(event => {
      const velocity = event.velocityX;
      const distance = event.translationX;

      // Determine if swipe should complete based on velocity or distance
      const velocityExceeded = Math.abs(velocity) > velocityThreshold;

      // Check left swipe
      if (distance < 0 && onSwipeLeft) {
        const distanceThreshold = onSwipeLeft.threshold || defaultDistanceThreshold;
        const shouldComplete = velocityExceeded || Math.abs(distance) > distanceThreshold;

        if (shouldComplete) {
          // Complete left swipe action
          translateX.value = withSpring(-200, springConfig, () => {
            runOnJS(handleSwipeComplete)('left');
            translateX.value = withSpring(0, springConfig);
          });
        } else {
          // Reset to original position
          translateX.value = withSpring(0, springConfig);
        }
      }
      // Check right swipe
      else if (distance > 0 && onSwipeRight) {
        const distanceThreshold = onSwipeRight.threshold || defaultDistanceThreshold;
        const shouldComplete = velocityExceeded || Math.abs(distance) > distanceThreshold;

        if (shouldComplete) {
          // Complete right swipe action
          translateX.value = withSpring(200, springConfig, () => {
            runOnJS(handleSwipeComplete)('right');
            translateX.value = withSpring(0, springConfig);
          });
        } else {
          // Reset to original position
          translateX.value = withSpring(0, springConfig);
        }
      }
      // No valid swipe action, reset
      else {
        translateX.value = withSpring(0, springConfig);
      }
    });

  // Animated style for swipe translation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, style]} testID={testID}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeableContent, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  swipeableContent: {
    width: '100%',
  },
});

// Memoize component to prevent unnecessary re-renders
export const SwipeableRowMemo = React.memo(SwipeableRow);
