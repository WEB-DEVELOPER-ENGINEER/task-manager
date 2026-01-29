import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { validateTaskDescription } from '../utils/validation';
import { tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { GlassCard } from './primitives/GlassCard';
import { Priority, TaskInput as TaskInputType } from '../types/Task';
import { typography } from '../utils/typography';

/**
 * Props interface for TaskInput component
 */
export interface TaskInputProps {
  onAddTask: (taskInput: TaskInputType) => void;
  editingTask?: {
    id: string;
    description: string;
    priority: Priority;
    dueDate: number | null;
    tags: string[];
  } | null;
  onUpdateTask?: (id: string, updates: Partial<TaskInputType>) => void;
  onCancelEdit?: () => void;
}

/**
 * TaskInput component handles user input for creating and editing tasks
 * Includes priority selection, due date picker, tag input, and inline editing
 *
 * Requirements: 5.1, 5.3, 5.5, 5.7, 1.1, 2.1
 */
const TaskInput: React.FC<TaskInputProps> = ({
  onAddTask,
  editingTask,
  onUpdateTask,
  onCancelEdit,
}) => {
  const { theme, isReducedMotion } = useTheme();

  // Input state
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isExpoGo, setIsExpoGo] = useState<boolean>(false);

  // Detect if running in Expo Go
  useEffect(() => {
    // In Expo Go, DateTimePicker might not work properly
    // We'll use a fallback modal picker
    const checkExpoGo = async () => {
      try {
        // @ts-ignore - Constants is available in Expo
        const Constants = require('expo-constants').default;
        setIsExpoGo(Constants.appOwnership === 'expo');
      } catch {
        setIsExpoGo(false);
      }
    };
    checkExpoGo();
  }, []);

  // Animation values
  const scale = useSharedValue(1);

  // Spring configuration from design tokens - adjust for reduced motion
  const springConfig = {
    damping: isReducedMotion ? 50 : tokens.motion.spring.default.friction,
    stiffness: isReducedMotion ? 500 : tokens.motion.spring.default.tension,
  };

  // Load editing task data when editing
  useEffect(() => {
    if (editingTask) {
      setInputValue(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : null);
      setTags(editingTask.tags);
    } else {
      // Reset when not editing
      setInputValue('');
      setPriority('medium');
      setDueDate(null);
      setTags([]);
    }
  }, [editingTask]);

  // Animated style for input container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Handles adding or updating a task with validation
   */
  const handleSubmit = useCallback(() => {
    // Validate input
    const validationResult = validateTaskDescription(inputValue);

    if (!validationResult.isValid) {
      setError(validationResult.error || 'Invalid input');
      return;
    }

    // Clear any previous errors
    setError('');

    // Animate submission - skip if reduced motion is enabled
    if (!isReducedMotion) {
      scale.value = withSpring(0.98, springConfig);
      setTimeout(() => {
        scale.value = withSpring(1, springConfig);
      }, 100);
    }

    const taskData: TaskInputType = {
      description: inputValue.trim(),
      priority,
      dueDate: dueDate ? dueDate.getTime() : null,
      tags,
    };

    console.log('TaskInput - submitting task with tags:', tags);
    console.log('TaskInput - full taskData:', taskData);

    if (editingTask && onUpdateTask) {
      // Update existing task - preserve other properties
      onUpdateTask(editingTask.id, taskData);
    } else {
      // Add new task
      onAddTask(taskData);
    }

    // Clear input fields after successful submission (only for new tasks)
    if (!editingTask) {
      setInputValue('');
      setPriority('medium');
      setDueDate(null);
      setTags([]);
      setTagInput('');
    }
  }, [
    inputValue,
    priority,
    dueDate,
    tags,
    editingTask,
    onAddTask,
    onUpdateTask,
    scale,
    springConfig,
    isReducedMotion,
  ]);

  /**
   * Handles text input changes
   */
  const handleTextChange = useCallback(
    (text: string) => {
      setInputValue(text);
      if (error) {
        setError('');
      }
    },
    [error]
  );

  /**
   * Handles priority selection
   */
  const handlePrioritySelect = useCallback((selectedPriority: Priority) => {
    setPriority(selectedPriority);
  }, []);

  /**
   * Handles date selection
   */
  const handleDateChange = useCallback(
    (event: { type: string; nativeEvent?: unknown }, selectedDate?: Date) => {
      // On Android, hide picker after selection or dismissal
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      // On iOS, keep picker visible
      
      // Only update date if user didn't cancel
      if (event.type === 'set' && selectedDate) {
        setDueDate(selectedDate);
      }
    },
    []
  );

  /**
   * Handles adding a tag
   */
  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  /**
   * Handles removing a tag
   */
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    },
    [tags]
  );

  /**
   * Handles canceling edit mode
   */
  const handleCancelEdit = useCallback(() => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setInputValue('');
    setPriority('medium');
    setDueDate(null);
    setTags([]);
    setError('');
  }, [onCancelEdit]);

  // Memoize priority colors based on theme
  const priorityColors = React.useMemo(
    () => ({
      low: theme.colors.priorityLow,
      medium: theme.colors.priorityMedium,
      high: theme.colors.priorityHigh,
      critical: theme.colors.priorityCritical,
    }),
    [
      theme.colors.priorityLow,
      theme.colors.priorityMedium,
      theme.colors.priorityHigh,
      theme.colors.priorityCritical,
    ]
  );

  return (
    <Animated.View style={animatedStyle}>
      <GlassCard blurIntensity="medium" translucency={0.85} style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
        {/* Edit mode indicator */}
        {editingTask && (
          <View style={styles.editModeHeader}>
            <Text style={[styles.editModeText, { color: theme.colors.text }]}>Editing Task</Text>
            <TouchableOpacity
              onPress={handleCancelEdit}
              style={styles.cancelButton}
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: error ? theme.colors.error : theme.colors.border,
              },
            ]}
            value={inputValue}
            onChangeText={handleTextChange}
            placeholder="Enter a new task..."
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Task description input"
            accessibilityHint="Enter a description for your task"
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.accent }]}
            onPress={handleSubmit}
            accessibilityLabel={editingTask ? 'Update task' : 'Add task'}
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>{editingTask ? '✓' : '+'}</Text>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        ) : null}

        {/* Priority selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Priority</Text>
          <View style={styles.priorityContainer}>
            {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: priority === p ? priorityColors[p] : theme.colors.surface,
                    borderColor: priorityColors[p],
                  },
                ]}
                onPress={() => handlePrioritySelect(p)}
                accessibilityLabel={`Priority ${p}`}
                accessibilityRole="button"
                accessibilityState={{ selected: priority === p }}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: priority === p ? '#FFFFFF' : theme.colors.text,
                    },
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due date picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Due Date</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.accent,
                  borderWidth: 1,
                },
              ]}
              onPress={() => {
                console.log('Date button pressed, showing picker');
                setShowDatePicker(true);
              }}
              accessibilityLabel="Select due date"
              accessibilityRole="button"
            >
              <Text style={[styles.dateText, { color: dueDate ? theme.colors.text : theme.colors.accent }]}>
                {dueDate ? dueDate.toLocaleDateString() : 'Tap to set due date'}
              </Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setDueDate(null)}
                accessibilityLabel="Clear due date"
                accessibilityRole="button"
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Native DateTimePicker for standalone apps */}
          {showDatePicker && !isExpoGo && Platform.OS !== 'web' && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {/* Fallback Modal Picker for Expo Go and Web */}
          {showDatePicker && (isExpoGo || Platform.OS === 'web') && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Due Date</Text>
                  
                  <View style={styles.quickDateButtons}>
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.colors.accent }]}
                      onPress={() => {
                        const today = new Date();
                        setDueDate(today);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.quickDateButtonText}>Today</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.colors.accent }]}
                      onPress={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setDueDate(tomorrow);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.quickDateButtonText}>Tomorrow</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.quickDateButton, { backgroundColor: theme.colors.accent }]}
                      onPress={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        setDueDate(nextWeek);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.quickDateButtonText}>Next Week</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.modalCloseButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>

        {/* Tag input */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[
                styles.tagInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag..."
              placeholderTextColor={theme.colors.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleAddTag}
              accessibilityLabel="Tag input"
              accessibilityHint="Enter a tag and press done to add"
            />
            <TouchableOpacity
              style={[styles.tagAddButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleAddTag}
              accessibilityLabel="Add tag"
              accessibilityRole="button"
            >
              <Text style={styles.tagAddButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Tag chips */}
          {tags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagChipsContainer}
            >
              {tags.map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  style={[styles.tagChip, { backgroundColor: theme.colors.accent }]}
                >
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTag(tag)}
                    style={styles.tagRemoveButton}
                    accessibilityLabel={`Remove tag ${tag}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.tagRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        </ScrollView>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
  },
  scrollContainer: {
    maxHeight: 250,
  },
  editModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  editModeText: {
    ...typography.body,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  cancelButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    ...typography.body,
    borderWidth: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  errorText: {
    ...typography.bodySmall,
    marginBottom: tokens.spacing.sm,
  },
  section: {
    marginBottom: tokens.spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: tokens.spacing.xs,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateText: {
    ...typography.body,
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
  },
  clearButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  tagInput: {
    flex: 1,
    height: 44,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    ...typography.body,
    borderWidth: 1,
  },
  tagAddButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing.sm,
  },
  tagAddButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tagChipsContainer: {
    flexDirection: 'row',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    borderRadius: tokens.radius.full,
    marginRight: tokens.spacing.xs,
  },
  tagChipText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tagRemoveButton: {
    marginLeft: tokens.spacing.xs,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
  quickDateButtons: {
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  quickDateButton: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    minHeight: 44,
  },
  quickDateButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    minHeight: 44,
  },
  modalCloseButtonText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// Memoize component to prevent unnecessary re-renders
export default React.memo(TaskInput);
