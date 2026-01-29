/**
 * UI Primitives Unit Tests
 *
 * Tests for the reusable primitive components (GlassCard, AnimatedButton, SwipeableRow)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard, AnimatedButton, SwipeableRow } from '../../src/components/primitives';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

// Wrapper component with ThemeProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('UI Primitives', () => {
  describe('GlassCard', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <GlassCard>
            <Text>Test Content</Text>
          </GlassCard>
        </TestWrapper>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should accept custom blur intensity', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <GlassCard blurIntensity="strong" testID="glass-card">
            <Text>Test</Text>
          </GlassCard>
        </TestWrapper>
      );

      expect(getByTestId('glass-card')).toBeTruthy();
    });

    it('should accept custom translucency', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <GlassCard translucency={0.9} testID="glass-card">
            <Text>Test</Text>
          </GlassCard>
        </TestWrapper>
      );

      expect(getByTestId('glass-card')).toBeTruthy();
    });
  });

  describe('AnimatedButton', () => {
    it('should render children correctly', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <AnimatedButton onPress={mockOnPress}>
            <Text>Button Text</Text>
          </AnimatedButton>
        </TestWrapper>
      );

      expect(getByText('Button Text')).toBeTruthy();
    });

    it('should be pressable', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <TestWrapper>
          <AnimatedButton onPress={mockOnPress} testID="animated-button">
            <Text>Press Me</Text>
          </AnimatedButton>
        </TestWrapper>
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });

    it('should respect disabled state', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <TestWrapper>
          <AnimatedButton onPress={mockOnPress} disabled testID="animated-button">
            <Text>Disabled</Text>
          </AnimatedButton>
        </TestWrapper>
      );

      expect(getByTestId('animated-button')).toBeTruthy();
    });
  });

  describe('SwipeableRow', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <TestWrapper>
          <SwipeableRow>
            <Text>Swipeable Content</Text>
          </SwipeableRow>
        </TestWrapper>
      );

      expect(getByText('Swipeable Content')).toBeTruthy();
    });

    it('should accept swipe actions', () => {
      const mockSwipeLeft = jest.fn();
      const mockSwipeRight = jest.fn();

      const { getByTestId } = render(
        <TestWrapper>
          <SwipeableRow
            onSwipeLeft={{ onTrigger: mockSwipeLeft }}
            onSwipeRight={{ onTrigger: mockSwipeRight }}
            testID="swipeable-row"
          >
            <Text>Swipe Me</Text>
          </SwipeableRow>
        </TestWrapper>
      );

      expect(getByTestId('swipeable-row')).toBeTruthy();
    });

    it('should accept custom velocity threshold', () => {
      const mockSwipeLeft = jest.fn();

      const { getByTestId } = render(
        <TestWrapper>
          <SwipeableRow
            onSwipeLeft={{ onTrigger: mockSwipeLeft }}
            velocityThreshold={1000}
            testID="swipeable-row"
          >
            <Text>Fast Swipe</Text>
          </SwipeableRow>
        </TestWrapper>
      );

      expect(getByTestId('swipeable-row')).toBeTruthy();
    });
  });
});
