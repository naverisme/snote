import type {
  BulkTasks,
  Checklist,
  Reassign,
  Task,
  TaskCreate,
  TaskUpdate,
  WorkSession,
  Worksession,
} from './types';
import { mockChecklistFixture, mockTasksFixture, mockWorkSessionsFixture } from './fixtures';

export interface RequestOptions {
  csrfToken?: string;
  etag?: string;
  signal?: AbortSignal;
}

export class TaskApiClient {
  private inMemoryTasks = [...mockTasksFixture];
  private inMemoryChecklist = { ...mockChecklistFixture };
  private inMemorySessions = [...mockWorkSessionsFixture];

  async listWorkspaceTasks(workspaceId: string, options: RequestOptions = {}): Promise<Task[]> {
    try {
      const res = await fetch(`/api/v2/workspaces/${encodeURIComponent(workspaceId)}/tasks`, {
        signal: options.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback to fixture
    }
    return this.inMemoryTasks.filter(t => t.workspaceId === workspaceId);
  }

  async listMyTasks(
    filter?: string,
    timeZone?: string,
    options: RequestOptions = {},
  ): Promise<Task[]> {
    try {
      const query = new URLSearchParams();
      if (filter) query.set('filter', filter);
      if (timeZone) query.set('timeZone', timeZone);
      const res = await fetch(`/api/v2/me/tasks?${query.toString()}`, {
        signal: options.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback to fixture
    }
    return this.inMemoryTasks;
  }

  async createTask(workspaceId: string, body: TaskCreate, options: RequestOptions = {}): Promise<Task> {
    try {
      const res = await fetch(`/api/v2/workspaces/${encodeURIComponent(workspaceId)}/tasks`, {
        method: 'POST',
        signal: options.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspaceId,
      title: body.title,
      importance: body.importance ?? 'medium',
      status: 'todo',
      dueAt: body.dueAt,
      assigneeId: body.assigneeId,
      version: 1,
    };
    this.inMemoryTasks.unshift(newTask);
    return newTask;
  }

  async updateTask(taskId: string, body: TaskUpdate, options: RequestOptions = {}): Promise<Task> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
      };
      if (options.etag) headers['If-Match'] = options.etag;
      const res = await fetch(`/api/v2/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        signal: options.signal,
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const idx = this.inMemoryTasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      this.inMemoryTasks[idx] = {
        ...this.inMemoryTasks[idx],
        ...body,
        version: this.inMemoryTasks[idx].version + 1,
      };
      return this.inMemoryTasks[idx];
    }
    throw new Error('Task not found');
  }

  async reassignTask(taskId: string, body: Reassign, options: RequestOptions = {}): Promise<Task> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
      };
      if (options.etag) headers['If-Match'] = options.etag;
      const res = await fetch(`/api/v2/tasks/${encodeURIComponent(taskId)}/reassign`, {
        method: 'POST',
        signal: options.signal,
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const task = this.inMemoryTasks.find(t => t.id === taskId);
    if (task) {
      task.assigneeId = body.assigneeId;
      task.version += 1;
      return task;
    }
    throw new Error('Task not found');
  }

  async completeTask(taskId: string, options: RequestOptions = {}): Promise<Task> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
      };
      if (options.etag) headers['If-Match'] = options.etag;
      const res = await fetch(`/api/v2/tasks/${encodeURIComponent(taskId)}/complete`, {
        method: 'POST',
        signal: options.signal,
        headers,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const task = this.inMemoryTasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'done';
      task.version += 1;
      return task;
    }
    throw new Error('Task not found');
  }

  async reopenTask(taskId: string, options: RequestOptions = {}): Promise<Task> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
      };
      if (options.etag) headers['If-Match'] = options.etag;
      const res = await fetch(`/api/v2/tasks/${encodeURIComponent(taskId)}/reopen`, {
        method: 'POST',
        signal: options.signal,
        headers,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const task = this.inMemoryTasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'todo';
      task.version += 1;
      return task;
    }
    throw new Error('Task not found');
  }

  async bulkActions(body: BulkTasks, options: RequestOptions = {}): Promise<Task[]> {
    try {
      const res = await fetch('/api/v2/tasks/bulk-actions', {
        method: 'POST',
        signal: options.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    if (body.action === 'trash') {
      const ids = new Set(body.items.map(i => i.id));
      this.inMemoryTasks = this.inMemoryTasks.filter(t => !ids.has(t.id));
      return [];
    }
    if (body.action === 'archive') {
      const ids = new Set(body.items.map(i => i.id));
      for (const t of this.inMemoryTasks) {
        if (ids.has(t.id)) {
          t.status = 'done';
          t.version += 1;
        }
      }
      return this.inMemoryTasks.filter(t => ids.has(t.id));
    }
    return [];
  }

  async listWorkSessions(options: RequestOptions = {}): Promise<Worksession[]> {
    try {
      const res = await fetch('/api/v2/me/work-sessions', {
        signal: options.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    return this.inMemorySessions;
  }

  async createWorkSession(body: WorkSession, options: RequestOptions = {}): Promise<Worksession> {
    try {
      const res = await fetch('/api/v2/me/work-sessions', {
        method: 'POST',
        signal: options.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }
    const session: Worksession = {
      id: `wsess-${Date.now()}`,
      taskId: body.taskId,
      ownerId: 'current-user-id',
      startAt: body.startAt,
      endAt: body.endAt,
      version: 1,
    };
    this.inMemorySessions.push(session);
    return session;
  }
}

export const taskApi = new TaskApiClient();
