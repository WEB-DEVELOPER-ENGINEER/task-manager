# Gesture System

This module provides gesture handling utilities for the Task Manager Premium application.

## Components

### `gestureConfig.ts`

Defines configuration constants for all gesture interactions:

- **Swipe gestures**: Minimum distance (50 points) and velocity threshold (500 points/second)
- **Long-press gestures**: Duration (500ms)
- **Drag gestures**: Activation distance (10 points)

### `longPressGesture.ts`

Provides utilities for creating long-press gestures with visual feedback and haptic response.

## Usage Examples

### Basic Long-Press Gesture

```typescript
import { GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { createLongPressGesture } from '../gestures/longPressGesture';

function MyComponent() {
  const scaleValue = useSharedValue(1);

  const longPressGesture = createLongPressGesture({
    onLongPress: () => {
      console.log('Long press activated!');
      // Trigger your action here
    },
    scaleValue, // Optional: for visual feedback
    onProgress: (progress) => {
      console.log('Progress:', progress);
    },
  });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View>
        {/* Your content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Multi-Select Mode

```typescript
import { createMultiSelectLongPress } from '../gestures/longPressGesture';

function TaskItem({ taskId, dispatch }) {
  const scaleValue = useSharedValue(1);

  const longPressGesture = createMultiSelectLongPress(
    () => {
      // Enter multi-select mode
      dispatch({ type: 'TOGGLE_MULTI_SELECT' });
      dispatch({ type: 'TOGGLE_TASK_SELECTION', payload: taskId });
    },
    scaleValue
  );

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={animatedStyle}>
        {/* Task content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Reorder Mode

```typescript
import { createReorderLongPress } from '../gestures/longPressGesture';

function TaskItem({ taskId, dispatch }) {
  const scaleValue = useSharedValue(1);

  const longPressGesture = createReorderLongPress(
    () => {
      // Enter reorder mode
      dispatch({ type: 'SET_REORDER_MODE', payload: true });
    },
    scaleValue
  );

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={animatedStyle}>
        {/* Task content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Custom Duration

```typescript
const longPressGesture = createLongPressGesture({
  onLongPress: handleLongPress,
  duration: 1000, // 1 second instead of default 500ms
});
```

## Features

- **Haptic Feedback**: Automatically triggers medium-impact haptic feedback when long-press activates
- **Visual Feedback**: Supports scale animation during long-press (optional)
- **Progress Tracking**: Optional callback to track long-press progress (0 to 1)
- **Configurable Duration**: Default 500ms, can be customized per gesture
- **Cancellation Support**: Properly handles gesture cancellation and resets visual state

## Requirements Satisfied

- **4.3**: Long-press enters reorder mode with visual feedback
- **4.5**: Long-press enters multi-select mode
- **4.6**: Gesture configuration with proper thresholds
- **14.5**: Velocity thresholds defined as design tokens
