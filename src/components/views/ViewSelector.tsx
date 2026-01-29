/**
 * ViewSelector Component
 *
 * Navigation UI for switching between different task views.
 * Applies glassmorphism styling and provides visual feedback for the selected view.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppState } from '../../state/context';
import { ViewType } from '../../types/State';
import { useTheme } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/tokens';
import { GlassCard } from '../primitives/GlassCard';
import { typography } from '../../utils/typography';

interface ViewOption {
  id: ViewType;
  label: string;
  icon: string;
}

const viewOptions: ViewOption[] = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'upcoming', label: 'Upcoming', icon: '🔜' },
  { id: 'priority', label: 'Priority', icon: '⭐' },
  { id: 'completed', label: 'Done', icon: '✅' },
];

export const ViewSelector: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { theme } = useTheme();
  const selectedView = state.ui.selectedView;

  const handleViewChange = useCallback(
    (view: ViewType) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },
    [dispatch]
  );

  return (
    <GlassCard
      style={styles.container}
      blurIntensity="medium"
      translucency={0.85}
      testID="view-selector"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {viewOptions.map(option => {
          const isSelected = selectedView === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleViewChange(option.id)}
              style={[
                styles.viewButton,
                {
                  backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${option.label} view`}
              accessibilityHint={`Double tap to switch to ${option.label} view`}
              accessibilityState={{ selected: isSelected }}
              testID={`view-option-${option.id}`}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: tokens.spacing.md,
    marginTop: tokens.spacing.xs,
    marginBottom: tokens.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.xs,
    gap: tokens.spacing.sm,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    minHeight: 44, // Accessibility touch target
  },
  icon: {
    fontSize: 18,
  },
  label: {
    ...typography.label,
  },
});

// Memoize component to prevent unnecessary re-renders
export const ViewSelectorMemo = React.memo(ViewSelector);
