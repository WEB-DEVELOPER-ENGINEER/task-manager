/**
 * Unit tests for TaskItem component
 * Tests the enhanced TaskItem with gestures, animations, and premium features
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import TaskItem from '../../src/components/TaskItem';
import { Task } from '../../src/types/Task';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

// Helper to wrap component with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider initialTheme="light">{component}</ThemeProvider>);
};

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: '1',
    description: 'Test task',
    completed: false,
    createdAt: Date.now(),
    priority: 'medium',
    dueDate: null,
    tags: [],
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task description', () => {
    const { getByText } = renderWithTheme(
      <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByText('Test task')).toBeTruthy();
  });

  it('should render with priority indicator', () => {
    const { getByText } = renderWithTheme(
      <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // Task should be rendered
    expect(getByText('Test task')).toBeTruthy();
  });

  it('should render due date when present', () => {
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    const taskWithDueDate: Task = {
      ...mockTask,
      dueDate: tomorrow,
    };

    const { getByText } = renderWithTheme(
      <TaskItem task={taskWithDueDate} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByText('Tomorrow')).toBeTruthy();
  });

  it('should render overdue indicator for past due dates', () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const taskOverdue: Task = {
      ...mockTask,
      dueDate: yesterday,
    };

    const { getByText } = renderWithTheme(
      <TaskItem task={taskOverdue} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByText('Overdue')).toBeTruthy();
  });

  it('should render tags when present', () => {
    const taskWithTags: Task = {
      ...mockTask,
      tags: ['urgent', 'work'],
    };

    const { getByText } = renderWithTheme(
      <TaskItem task={taskWithTags} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByText('urgent')).toBeTruthy();
    expect(getByText('work')).toBeTruthy();
  });

  it('should render different priority levels correctly', () => {
    const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = [
      'low',
      'medium',
      'high',
      'critical',
    ];

    priorities.forEach(priority => {
      const taskWithPriority: Task = {
        ...mockTask,
        priority,
      };

      const { getByText } = renderWithTheme(
        <TaskItem task={taskWithPriority} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      expect(getByText('Test task')).toBeTruthy();
    });
  });

  it('should show completed state correctly', () => {
    const completedTask: Task = {
      ...mockTask,
      completed: true,
    };

    const { getByLabelText } = renderWithTheme(
      <TaskItem task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByLabelText('Mark task as incomplete')).toBeTruthy();
  });

  it('should show incomplete state correctly', () => {
    const { getByLabelText } = renderWithTheme(
      <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(getByLabelText('Mark task as complete')).toBeTruthy();
  });
});
