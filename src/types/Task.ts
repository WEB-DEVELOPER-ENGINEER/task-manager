export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  dueDate: number | null; // Unix timestamp
  tags: string[];
}

export interface TaskInput {
  description: string;
  priority?: Priority;
  dueDate?: number | null;
  tags?: string[];
}
