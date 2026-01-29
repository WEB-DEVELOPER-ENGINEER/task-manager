/**
 * Gesture System Unit Tests
 *
 * Tests for gesture configuration and long-press gesture handler
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { gestureConfig } from '../../src/gestures/gestureConfig';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    LongPress: jest.fn(() => ({
      minDuration: jest.fn().mockReturnThis(),
      onStart: jest.fn().mockReturnThis(),
      onFinalize: jest.fn().mockReturnThis(),
      config: {},
    })),
    Pan: jest.fn(() => ({
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      config: {},
    })),
  },
  GestureDetector: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  withTiming: jest.fn(value => value),
  runOnJS: jest.fn(fn => fn),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('Gesture Configuration', () => {
  it('should have correct swipe configuration', () => {
    expect(gestureConfig.swipe.minDistance).toBe(50);
    expect(gestureConfig.swipe.velocityThreshold).toBe(500);
  });

  it('should have correct long-press configuration', () => {
    expect(gestureConfig.longPress.duration).toBe(500);
  });

  it('should have correct drag configuration', () => {
    expect(gestureConfig.drag.activationDistance).toBe(10);
  });
});

describe('Long-Press Gesture Handler', () => {
  // Import after mocks are set up
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const {
    createLongPressGesture,
    createMultiSelectLongPress,
    createReorderLongPress,
  } = require('../../src/gestures/longPressGesture');

  it('should create a long-press gesture with default configuration', () => {
    const mockCallback = jest.fn();
    const gesture = createLongPressGesture({
      onLongPress: mockCallback,
    });

    expect(gesture).toBeDefined();
    expect(gesture.config).toBeDefined();
  });

  it('should create a long-press gesture with custom duration', () => {
    const mockCallback = jest.fn();
    const customDuration = 1000;

    const gesture = createLongPressGesture({
      onLongPress: mockCallback,
      duration: customDuration,
    });

    expect(gesture).toBeDefined();
  });

  it('should create a long-press gesture with progress callback', () => {
    const mockCallback = jest.fn();
    const mockProgress = jest.fn();

    const gesture = createLongPressGesture({
      onLongPress: mockCallback,
      onProgress: mockProgress,
    });

    expect(gesture).toBeDefined();
  });

  it('should create multi-select long-press gesture', () => {
    const mockCallback = jest.fn();
    const gesture = createMultiSelectLongPress(mockCallback);

    expect(gesture).toBeDefined();
  });

  it('should create reorder long-press gesture', () => {
    const mockCallback = jest.fn();
    const gesture = createReorderLongPress(mockCallback);

    expect(gesture).toBeDefined();
  });
});
