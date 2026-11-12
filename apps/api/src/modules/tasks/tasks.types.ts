import type { components } from '@snote/contracts';

export type Task = components['schemas']['Task'];
export type TaskCreate = components['schemas']['TaskCreate'];
export type TaskUpdate = components['schemas']['TaskUpdate'];
export type BulkTasks = components['schemas']['BulkTasks'];
export type Reassign = components['schemas']['Reassign'];
export type Checklist = components['schemas']['Checklist'];
export type ChecklistItem = components['schemas']['ChecklistItem'];
export type ChecklistItemListResult = components['schemas']['ChecklistItemListResult'];
export type WorkSession = components['schemas']['WorkSession'];
export type Worksession = components['schemas']['Worksession'];
export type DueDate = components['schemas']['DueDate'];
export type TaskResult = components['schemas']['TaskResult'];
export type TaskListResult = components['schemas']['TaskListResult'];
export type WorksessionResult = components['schemas']['WorksessionResult'];
export type WorksessionListResult = components['schemas']['WorksessionListResult'];

export interface ChecklistItemRecord {
  id: string;
  taskId: string;
  text: string;
  done: boolean;
  position: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAuditRecord {
  id: string;
  taskId: string;
  actorId: string;
  action: string;
  change: Record<string, unknown>;
  at: Date;
}

export interface TaskFilterOptions {
  filter?: 'all' | 'today' | 'tomorrow' | 'important' | 'upcoming';
  timeZone?: string;
  now?: Date;
}
