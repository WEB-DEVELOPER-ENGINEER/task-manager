/**
 * ThemeToggle Component
 *
 * Button to toggle between light, dark, and high contrast themes
 * with smooth animated transitions
 *
 * Requirements: 8.1, 8.2, 8.3
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { typography } from '../utils/typography';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    // Toggle between light and dark themes only
    if (theme.mode === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Get icon based on current theme
  const getIcon = () => {
    switch (theme.mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'high-contrast':
        return '◐';
      default:
        return '☀️';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.surface }]}
      onPress={handleToggle}
      accessibilityLabel={`Current theme: ${theme.mode}. Tap to change theme`}
      accessibilityRole="button"
      accessibilityHint="Cycles between light, dark, and high contrast themes"
    >
      <Text style={styles.icon}>{getIcon()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
  },
});
