/**
 * Theme Definitions
 *
 * Provides pre-configured themes (light, dark, high contrast) with complete
 * color palettes, blur settings, and priority colors.
 */

import { ThemeConfig } from '../types/Theme';
import { blur } from './tokens';

/**
 * Light theme configuration
 */
export const lightTheme: ThemeConfig = {
  mode: 'light',
  accentColor: '#007AFF',
  colors: {
    background: '#F5F5F7',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.8)',
    text: '#1D1D1F',
    textSecondary: '#6E6E73',
    border: '#D1D1D6',
    accent: '#007AFF',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    priorityLow: '#34C759',
    priorityMedium: '#007AFF',
    priorityHigh: '#FF9500',
    priorityCritical: '#FF3B30',
  },
  blur: {
    surface: blur.medium,
    overlay: blur.strong,
    adaptive: true, // Automatically reduces blur on low-end devices
  },
};

/**
 * Dark theme configuration
 */
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  accentColor: '#0A84FF',
  colors: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    surface: '#1C1C1E',
    surfaceGlass: 'rgba(28, 28, 30, 0.8)',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    accent: '#0A84FF',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    priorityLow: '#32D74B',
    priorityMedium: '#0A84FF',
    priorityHigh: '#FF9F0A',
    priorityCritical: '#FF453A',
  },
  blur: {
    surface: blur.medium,
    overlay: blur.strong,
    adaptive: true, // Automatically reduces blur on low-end devices
  },
};

/**
 * High contrast theme configuration for accessibility
 */
export const highContrastTheme: ThemeConfig = {
  mode: 'highContrast',
  accentColor: '#0040DD',
  colors: {
    background: '#FFFFFF',
    backgroundSecondary: '#F0F0F0',
    surface: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.95)',
    text: '#000000',
    textSecondary: '#424242',
    border: '#000000',
    accent: '#0040DD',
    error: '#D70015',
    success: '#1A7F37',
    warning: '#BF5B00',
    priorityLow: '#1A7F37',
    priorityMedium: '#0040DD',
    priorityHigh: '#BF5B00',
    priorityCritical: '#D70015',
  },
  blur: {
    surface: blur.subtle,
    overlay: blur.medium,
    adaptive: false,
  },
};

/**
 * Map of all available themes
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  highContrast: highContrastTheme,
};

/**
 * Default theme
 */
export const defaultTheme = lightTheme;
