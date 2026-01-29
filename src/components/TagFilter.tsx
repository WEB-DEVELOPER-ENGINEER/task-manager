/**
 * TagFilter Component
 *
 * Displays all available tags and allows filtering tasks by tag
 *
 * Requirements: 5.6
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppState } from '../state/context';
import { selectAllTags } from '../state/selectors';
import { useTheme } from '../theme/ThemeProvider';
import { tokens } from '../theme/tokens';
import { GlassCard } from './primitives/GlassCard';
import { typography } from '../utils/typography';

export const TagFilter: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { theme } = useTheme();
  const allTags = selectAllTags(state);
  const selectedTag = state.ui.selectedTag;

  // Debug: log tags
  console.log('All tags:', allTags);
  console.log('Total tasks:', state.tasks.length);
  console.log('Tasks with tags:', state.tasks.filter(t => t.tags.length > 0).length);

  const handleTagPress = useCallback(
    (tag: string) => {
      // Toggle tag filter - if already selected, clear it
      if (selectedTag === tag) {
        dispatch({ type: 'SET_TAG_FILTER', payload: null });
      } else {
        dispatch({ type: 'SET_TAG_FILTER', payload: tag });
      }
    },
    [selectedTag, dispatch]
  );

  const handleClearFilter = useCallback(() => {
    dispatch({ type: 'SET_TAG_FILTER', payload: null });
  }, [dispatch]);

  // Don't render if no tags exist
  if (allTags.length === 0) {
    return (
      <GlassCard
        style={styles.container}
        blurIntensity="medium"
        translucency={0.85}
        testID="tag-filter"
      >
        <Text style={[styles.headerText, { color: theme.colors.textSecondary }]}>
          No tags yet. Add tags to your tasks to filter by them.
        </Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      style={styles.container}
      blurIntensity="medium"
      translucency={0.85}
      testID="tag-filter"
    >
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.textSecondary }]}>
          Filter by tag:
        </Text>
        {selectedTag && (
          <TouchableOpacity
            onPress={handleClearFilter}
            style={styles.clearButton}
            accessibilityLabel="Clear tag filter"
            accessibilityRole="button"
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.accent }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allTags.map(tag => {
          const isSelected = selectedTag === tag;

          return (
            <TouchableOpacity
              key={tag}
              onPress={() => handleTagPress(tag)}
              style={[
                styles.tagButton,
                {
                  backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${tag}`}
              accessibilityHint={`Double tap to ${isSelected ? 'remove' : 'apply'} ${tag} filter`}
              accessibilityState={{ selected: isSelected }}
              testID={`tag-filter-${tag}`}
            >
              <Text
                style={[
                  styles.tagText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                  },
                ]}
              >
                {tag}
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
    marginVertical: tokens.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  headerText: {
    ...typography.caption,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  clearButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: tokens.spacing.xs,
    gap: tokens.spacing.sm,
  },
  tagButton: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  tagText: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
});
