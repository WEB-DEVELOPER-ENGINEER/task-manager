/**
 * Theme Type Definitions
 *
 * Defines the structure for theme configurations including colors, blur settings,
 * and theme modes for the application.
 */

export type ThemeMode = 'light' | 'dark' | 'highContrast';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceGlass: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  priorityCritical: string;
}

export interface ThemeBlur {
  surface: number;
  overlay: number;
  adaptive: boolean;
}

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
  colors: ThemeColors;
  blur: ThemeBlur;
}
