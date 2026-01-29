import * as Haptics from 'expo-haptics';
import {
  triggerHaptic,
  triggerTaskCompleteHaptic,
  triggerTaskDeleteHaptic,
  triggerButtonPressHaptic,
  triggerGestureHaptic,
} from '../../src/utils/haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('Haptics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerHaptic', () => {
    it('should trigger light impact haptic', async () => {
      const result = await triggerHaptic('light');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
      expect(result.style).toBe('light');
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should trigger medium impact haptic', async () => {
      const result = await triggerHaptic('medium');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
      expect(result.style).toBe('medium');
    });

    it('should trigger heavy impact haptic', async () => {
      const result = await triggerHaptic('heavy');

      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
      expect(result.style).toBe('heavy');
    });

    it('should trigger success notification haptic', async () => {
      const result = await triggerHaptic('success');

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
      expect(result.style).toBe('success');
    });

    it('should trigger warning notification haptic', async () => {
      const result = await triggerHaptic('warning');

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
      expect(result.style).toBe('warning');
    });

    it('should trigger error notification haptic', async () => {
      const result = await triggerHaptic('error');

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
      expect(result.style).toBe('error');
    });

    it('should measure timing for haptic feedback', async () => {
      const result = await triggerHaptic('medium');

      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should handle errors gracefully when haptics are not available', async () => {
      const mockError = new Error('Haptics not available');
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(mockError);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await triggerHaptic('light');

      expect(result.style).toBe('light');
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Haptic feedback not available:', mockError);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('triggerTaskCompleteHaptic', () => {
    it('should trigger medium impact for task completion', async () => {
      const result = await triggerTaskCompleteHaptic();

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
      expect(result.style).toBe('medium');
    });
  });

  describe('triggerTaskDeleteHaptic', () => {
    it('should trigger error notification for task deletion', async () => {
      const result = await triggerTaskDeleteHaptic();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
      expect(result.style).toBe('error');
    });
  });

  describe('triggerButtonPressHaptic', () => {
    it('should trigger light impact for button press', async () => {
      const result = await triggerButtonPressHaptic();

      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
      expect(result.style).toBe('light');
    });
  });

  describe('triggerGestureHaptic', () => {
    it('should trigger medium impact for gesture', async () => {
      const result = await triggerGestureHaptic();

      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
      expect(result.style).toBe('medium');
    });
  });
});
