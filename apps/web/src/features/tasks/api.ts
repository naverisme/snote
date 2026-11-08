import { request } from '../../api/generated/client';
import { getCsrfToken } from '../../shared/api';
import type {
  BulkTasks,
  Reassign,
  Task,
  TaskCreate,
  TaskUpdate,
  WorkSession,
  Worksession,
} from './types';

export interface RequestOptions {
  csrfToken?: string;
  etag?: string;
  signal?: AbortSignal;
}

type Data<T> = { data: T };

function withAuth(options: RequestOptions = {}) {
  return { ...options, csrfToken: options.csrfToken ?? getCsrfToken() };
}

export class TaskApiClient {
  async listWorkspaceTasks(workspaceId: string, options: RequestOptions = {}): Promise<Task[]> {
    const result = await request<Data<Task[]>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/tasks`, 'GET', undefined, options,
    );
    return result.data;
  }

  async listMyTasks(filter?: string, timeZone?: string, options: RequestOptions = {}): Promise<Task[]> {
    const query = new URLSearchParams();
    if (filter) query.set('filter', filter);
    if (timeZone) query.set('timeZone', timeZone);
    const result = await request<Data<Task[]>>(`/me/tasks?${query}`, 'GET', undefined, options);
    return result.data;
  }

  async createTask(workspaceId: string, body: TaskCreate, options: RequestOptions = {}): Promise<Task> {
    const result = await request<Data<Task>>(
      `/workspaces/${encodeURIComponent(workspaceId)}/tasks`, 'POST', body, withAuth(options),
    );
    return result.data;
  }

  async updateTask(taskId: string, body: TaskUpdate, options: RequestOptions = {}): Promise<Task> {
    const result = await request<Data<Task>>(
      `/tasks/${encodeURIComponent(taskId)}`, 'PATCH', body, withAuth(options),
    );
    return result.data;
  }

  async reassignTask(taskId: string, body: Reassign, options: RequestOptions = {}): Promise<Task> {
    const result = await request<Data<Task>>(
      `/tasks/${encodeURIComponent(taskId)}/reassign`, 'POST', body, withAuth(options),
    );
    return result.data;
  }

  async completeTask(taskId: string, options: RequestOptions = {}): Promise<Task> {
    const result = await request<Data<Task>>(
      `/tasks/${encodeURIComponent(taskId)}/complete`, 'POST', undefined, withAuth(options),
    );
    return result.data;
  }

  async reopenTask(taskId: string, options: RequestOptions = {}): Promise<Task> {
    const result = await request<Data<Task>>(
      `/tasks/${encodeURIComponent(taskId)}/reopen`, 'POST', undefined, withAuth(options),
    );
    return result.data;
  }

  async bulkActions(body: BulkTasks, options: RequestOptions = {}): Promise<Task[]> {
    const result = await request<Data<Task[]>>('/tasks/bulk-actions', 'POST', body, withAuth(options));
    return result.data;
  }

  async listWorkSessions(options: RequestOptions = {}): Promise<Worksession[]> {
    const result = await request<Data<Worksession[]>>('/me/work-sessions', 'GET', undefined, options);
    return result.data;
  }

  async createWorkSession(body: WorkSession, options: RequestOptions = {}): Promise<Worksession> {
    const result = await request<Data<Worksession>>('/me/work-sessions', 'POST', body, withAuth(options));
    return result.data;
  }
}

export const taskApi = new TaskApiClient();
