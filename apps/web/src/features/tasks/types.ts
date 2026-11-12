import type { components } from '@snote/contracts';

export type Task = components['schemas']['Task'];
export type TaskCreate = components['schemas']['TaskCreate'];
export type TaskUpdate = components['schemas']['TaskUpdate'];
export type BulkTasks = components['schemas']['BulkTasks'];
export type Reassign = components['schemas']['Reassign'];
export type Checklist = components['schemas']['Checklist'];
export type ChecklistItem = components['schemas']['ChecklistItem'];
export type WorkSession = components['schemas']['WorkSession'];
export type Worksession = components['schemas']['Worksession'];
export type DueDate = components['schemas']['DueDate'];

export interface ChecklistItemViewModel {
  id: string;
  taskId: string;
  text: string;
  done: boolean;
  position: number;
}

export interface WorkSessionViewModel {
  id: string;
  taskId: string;
  ownerId: string;
  startAt: string;
  endAt: string;
  isLate?: boolean;
  version: number;
}

export type TaskFilter = 'all' | 'today' | 'tomorrow' | 'important' | 'upcoming';
export type TaskSortMode = 'next_tasks' | 'importance' | 'due_date';
export type TaskViewMode = 'gantt' | 'list';
