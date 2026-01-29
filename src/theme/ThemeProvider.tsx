/**
 * Theme Provider
 *
 * Provides theme context to the application with theme switching capabilities
 * and animation support for smooth theme transitions.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from 'react';
import { ThemeConfig, ThemeMode } from '../types/Theme';
import { defaultTheme, themes } from './themes';
import { useReducedMotion, useHighContrast } from '../utils/accessibility';

interface ThemeContextValue {
  theme: ThemeConfig;
  previousTheme: ThemeConfig | null;
  isTransitioning: boolean;
  setTheme: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

/**
 * ThemeProvider component that manages theme state and provides theme context
 * with animated transitions between themes
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
}) => {
  const [theme, setThemeState] = useState<ThemeConfig>(themes[initialTheme] || defaultTheme);
  const [previousTheme, setPreviousTheme] = useState<ThemeConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect accessibility settings
  const isReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrast();

  // Auto-switch to high contrast theme when system setting is enabled
  useEffect(() => {
    if (isHighContrast && theme.mode !== 'highContrast') {
      setThemeState(themes.highContrast);
    }
  }, [isHighContrast, theme.mode]);

  // Cleanup transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Switch to a different theme mode with animated transition
   * Supports animation through state transition
   */
  const setTheme = useCallback(
    (mode: ThemeMode) => {
      const newTheme = themes[mode];
      if (newTheme && newTheme.mode !== theme.mode) {
        // Store previous theme for transition
        setPreviousTheme(theme);
        setIsTransitioning(true);

        // Update to new theme
        setThemeState(newTheme);

        // Clear transition state after animation completes
        // Use reduced duration if reduced motion is enabled
        const transitionDuration = isReducedMotion ? 150 : 300;

        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setPreviousTheme(null);
        }, transitionDuration);
      }
    },
    [theme, isReducedMotion]
  );

  /**
   * Update the accent color while maintaining current theme
   */
  const setAccentColor = useCallback((color: string) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      accentColor: color,
      colors: {
        ...prevTheme.colors,
        accent: color,
      },
    }));
  }, []);

  const value: ThemeContextValue = {
    theme,
    previousTheme,
    isTransitioning,
    setTheme,
    setAccentColor,
    isReducedMotion,
    isHighContrast,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
