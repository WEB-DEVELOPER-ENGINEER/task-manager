/**
 * Design Tokens
 *
 * Centralized design constants for consistent visual language across the application.
 * All visual properties should be sourced from these tokens to maintain consistency.
 */

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface BlurTokens {
  none: number;
  subtle: number;
  medium: number;
  strong: number;
  intense: number;
}

export interface SpringConfig {
  tension: number;
  friction: number;
}

export interface MotionTokens {
  spring: {
    gentle: SpringConfig;
    default: SpringConfig;
    snappy: SpringConfig;
  };
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
}

export interface OpacityTokens {
  disabled: number;
  secondary: number;
  primary: number;
}

export interface DesignTokens {
  spacing: SpacingTokens;
  radius: RadiusTokens;
  blur: BlurTokens;
  motion: MotionTokens;
  opacity: OpacityTokens;
}

/**
 * Spacing scale for consistent layout
 */
export const spacing: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius scale for consistent rounded corners
 */
export const radius: RadiusTokens = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

/**
 * Blur intensity levels for glassmorphism effects
 */
export const blur: BlurTokens = {
  none: 0,
  subtle: 10,
  medium: 20,
  strong: 40,
  intense: 60,
};

/**
 * Animation motion curves and timing
 */
export const motion: MotionTokens = {
  spring: {
    gentle: {
      tension: 120,
      friction: 14,
    },
    default: {
      tension: 180,
      friction: 12,
    },
    snappy: {
      tension: 300,
      friction: 20,
    },
  },
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

/**
 * Opacity levels for visual hierarchy
 */
export const opacity: OpacityTokens = {
  disabled: 0.4,
  secondary: 0.6,
  primary: 1.0,
};

/**
 * Complete design token system
 */
export const tokens: DesignTokens = {
  spacing,
  radius,
  blur,
  motion,
  opacity,
};
