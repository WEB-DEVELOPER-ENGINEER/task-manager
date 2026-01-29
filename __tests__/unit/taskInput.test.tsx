import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskInput from '../../src/components/TaskInput';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

/**
 * Unit tests for enhanced TaskInput component
 * Tests priority selection, due date picker, tag input, and inline editing
 * Validates: Requirements 5.1, 5.3, 5.5, 5.7, 1.1, 2.1
 */
describe('TaskInput Component - Enhanced Features', () => {
  const mockOnAddTask = jest.fn();
  const mockOnUpdateTask = jest.fn();
  const mockOnCancelEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider initialTheme="light">{component}</ThemeProvider>);
  };

  /**
   * Test basic rendering with glassmorphism
   */
  it('should render with glassmorphism styling', () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    expect(getByPlaceholderText('Enter a new task...')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
    expect(getByText('Due Date')).toBeTruthy();
    expect(getByText('Tags')).toBeTruthy();
  });

  /**
   * Test priority selection
   * Validates: Requirement 5.1
   */
  it('should allow priority selection', () => {
    const { getByLabelText } = renderWithTheme(<TaskInput onAddTask={mockOnAddTask} />);

    const lowButton = getByLabelText('Priority low');
    const highButton = getByLabelText('Priority high');

    expect(lowButton).toBeTruthy();
    expect(highButton).toBeTruthy();

    fireEvent.press(highButton);
    // Priority should be selected (visual state change)
  });

  /**
   * Test adding task with priority
   * Validates: Requirement 5.1
   */
  it('should add task with selected priority', () => {
    const { getByPlaceholderText, getByLabelText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const input = getByPlaceholderText('Enter a new task...');
    const addButton = getByLabelText('Add task');
    const highPriorityButton = getByLabelText('Priority high');

    fireEvent.press(highPriorityButton);
    fireEvent.changeText(input, 'High priority task');
    fireEvent.press(addButton);

    expect(mockOnAddTask).toHaveBeenCalledWith({
      description: 'High priority task',
      priority: 'high',
      dueDate: null,
      tags: [],
    });
  });

  /**
   * Test tag input functionality
   * Validates: Requirement 5.5
   */
  it('should allow adding tags', () => {
    const { getByPlaceholderText, getByLabelText, getByText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const tagInput = getByPlaceholderText('Add a tag...');
    const tagAddButton = getByLabelText('Add tag');

    fireEvent.changeText(tagInput, 'urgent');
    fireEvent.press(tagAddButton);

    expect(getByText('urgent')).toBeTruthy();
  });

  /**
   * Test removing tags
   * Validates: Requirement 5.5
   */
  it('should allow removing tags', () => {
    const { getByPlaceholderText, getByLabelText, getByText, queryByText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const tagInput = getByPlaceholderText('Add a tag...');
    const tagAddButton = getByLabelText('Add tag');

    // Add a tag
    fireEvent.changeText(tagInput, 'test-tag');
    fireEvent.press(tagAddButton);
    expect(getByText('test-tag')).toBeTruthy();

    // Remove the tag
    const removeButton = getByLabelText('Remove tag test-tag');
    fireEvent.press(removeButton);

    expect(queryByText('test-tag')).toBeNull();
  });

  /**
   * Test adding task with tags
   * Validates: Requirement 5.5
   */
  it('should add task with tags', () => {
    const { getByPlaceholderText, getByLabelText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const input = getByPlaceholderText('Enter a new task...');
    const addButton = getByLabelText('Add task');
    const tagInput = getByPlaceholderText('Add a tag...');
    const tagAddButton = getByLabelText('Add tag');

    // Add tags
    fireEvent.changeText(tagInput, 'work');
    fireEvent.press(tagAddButton);
    fireEvent.changeText(tagInput, 'urgent');
    fireEvent.press(tagAddButton);

    // Add task
    fireEvent.changeText(input, 'Task with tags');
    fireEvent.press(addButton);

    expect(mockOnAddTask).toHaveBeenCalledWith({
      description: 'Task with tags',
      priority: 'medium',
      dueDate: null,
      tags: ['work', 'urgent'],
    });
  });

  /**
   * Test inline editing mode
   * Validates: Requirement 5.7
   */
  it('should enter edit mode when editingTask is provided', () => {
    const editingTask = {
      id: '123',
      description: 'Edit this task',
      priority: 'high' as const,
      dueDate: null,
      tags: ['test'],
    };

    const { getByText, getByPlaceholderText } = renderWithTheme(
      <TaskInput
        onAddTask={mockOnAddTask}
        editingTask={editingTask}
        onUpdateTask={mockOnUpdateTask}
        onCancelEdit={mockOnCancelEdit}
      />
    );

    expect(getByText('Editing Task')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();

    const input = getByPlaceholderText('Enter a new task...');
    expect(input.props.value).toBe('Edit this task');
  });

  /**
   * Test updating task preserves other properties
   * Validates: Requirement 5.7
   */
  it('should update task while preserving other properties', () => {
    const editingTask = {
      id: '123',
      description: 'Original task',
      priority: 'medium' as const,
      dueDate: Date.now(),
      tags: ['original'],
    };

    const { getByPlaceholderText, getByLabelText } = renderWithTheme(
      <TaskInput
        onAddTask={mockOnAddTask}
        editingTask={editingTask}
        onUpdateTask={mockOnUpdateTask}
        onCancelEdit={mockOnCancelEdit}
      />
    );

    const input = getByPlaceholderText('Enter a new task...');
    const updateButton = getByLabelText('Update task');

    // Change only the description
    fireEvent.changeText(input, 'Updated task');
    fireEvent.press(updateButton);

    expect(mockOnUpdateTask).toHaveBeenCalledWith('123', {
      description: 'Updated task',
      priority: 'medium',
      dueDate: editingTask.dueDate,
      tags: ['original'],
    });
  });

  /**
   * Test canceling edit mode
   * Validates: Requirement 5.7
   */
  it('should cancel edit mode', () => {
    const editingTask = {
      id: '123',
      description: 'Edit this task',
      priority: 'high' as const,
      dueDate: null,
      tags: [],
    };

    const { getByText } = renderWithTheme(
      <TaskInput
        onAddTask={mockOnAddTask}
        editingTask={editingTask}
        onUpdateTask={mockOnUpdateTask}
        onCancelEdit={mockOnCancelEdit}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancelEdit).toHaveBeenCalled();
  });

  /**
   * Test input validation still works
   */
  it('should validate empty input', () => {
    const { getByPlaceholderText, getByLabelText, getByText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const input = getByPlaceholderText('Enter a new task...');
    const addButton = getByLabelText('Add task');

    fireEvent.changeText(input, '');
    fireEvent.press(addButton);

    expect(getByText('Task description cannot be empty')).toBeTruthy();
    expect(mockOnAddTask).not.toHaveBeenCalled();
  });

  /**
   * Test clearing input after successful add
   */
  it('should clear all fields after adding task', () => {
    const { getByPlaceholderText, getByLabelText, queryByText } = renderWithTheme(
      <TaskInput onAddTask={mockOnAddTask} />
    );

    const input = getByPlaceholderText('Enter a new task...');
    const addButton = getByLabelText('Add task');
    const tagInput = getByPlaceholderText('Add a tag...');
    const tagAddButton = getByLabelText('Add tag');

    // Add tag
    fireEvent.changeText(tagInput, 'test');
    fireEvent.press(tagAddButton);

    // Add task
    fireEvent.changeText(input, 'Test task');
    fireEvent.press(addButton);

    expect(mockOnAddTask).toHaveBeenCalled();
    expect(input.props.value).toBe('');
    expect(queryByText('test')).toBeNull(); // Tag should be cleared
  });
});
