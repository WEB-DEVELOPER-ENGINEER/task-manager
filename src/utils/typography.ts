/**
 * Typography Utilities
 *
 * Provides scalable font sizes that respect system text size settings
 * for accessibility compliance.
 *
 * Requirements: 10.1
 */

import { PixelRatio } from 'react-native';

/**
 * Font size scale based on design system
 * These values will scale with system text size settings
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
} as const;

/**
 * Font weight scale
 */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

/**
 * Line height multipliers for different font sizes
 * Ensures proper spacing even with scaled text
 */
export const lineHeightMultiplier = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/**
 * Calculate line height based on font size
 *
 * @param size - Font size
 * @param multiplier - Line height multiplier (default: normal)
 * @returns Calculated line height
 */
export function getLineHeight(
  size: number,
  multiplier: keyof typeof lineHeightMultiplier = 'normal'
): number {
  return Math.round(size * lineHeightMultiplier[multiplier]);
}

/**
 * Get scaled font size that respects system text size settings
 * React Native automatically scales fonts, but this provides
 * a consistent interface for font sizing
 *
 * @param size - Base font size
 * @returns Font size (will be scaled by system)
 */
export function getScaledFontSize(size: keyof typeof fontSize): number {
  return fontSize[size];
}

/**
 * Typography presets for common text styles
 * All presets support dynamic font scaling
 */
export const typography = {
  // Headers
  h1: {
    fontSize: fontSize.xxxl,
    lineHeight: getLineHeight(fontSize.xxxl, 'tight'),
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontSize: fontSize.xxl,
    lineHeight: getLineHeight(fontSize.xxl, 'tight'),
    fontWeight: fontWeight.bold,
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: getLineHeight(fontSize.xl, 'normal'),
    fontWeight: fontWeight.semibold,
  },

  // Body text
  body: {
    fontSize: fontSize.md,
    lineHeight: getLineHeight(fontSize.md, 'normal'),
    fontWeight: fontWeight.regular,
  },
  bodyLarge: {
    fontSize: fontSize.lg,
    lineHeight: getLineHeight(fontSize.lg, 'normal'),
    fontWeight: fontWeight.regular,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: getLineHeight(fontSize.sm, 'normal'),
    fontWeight: fontWeight.regular,
  },

  // Labels and captions
  label: {
    fontSize: fontSize.sm,
    lineHeight: getLineHeight(fontSize.sm, 'normal'),
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: getLineHeight(fontSize.xs, 'normal'),
    fontWeight: fontWeight.regular,
  },

  // Buttons
  button: {
    fontSize: fontSize.md,
    lineHeight: getLineHeight(fontSize.md, 'tight'),
    fontWeight: fontWeight.semibold,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    lineHeight: getLineHeight(fontSize.sm, 'tight'),
    fontWeight: fontWeight.semibold,
  },
} as const;
