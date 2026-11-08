import { randomUUID } from 'node:crypto';
import { DomainError, requireAction, type AuthorizationPort, type Principal } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import type {
  BulkTasks,
  Checklist,
  ChecklistItemRecord,
  Reassign,
  Task,
  TaskAuditRecord,
  TaskCreate,
  TaskFilterOptions,
  TaskUpdate,
  WorkSession,
  Worksession,
} from './tasks.types';

export class TasksService {
  private tasks = new Map<string, Task & { createdAt: Date; updatedAt: Date; dueDateZone?: string }>();
  private checklist = new Map<string, ChecklistItemRecord>();
  private workSessions = new Map<string, Worksession & { createdAt: Date; updatedAt: Date; isLate?: boolean }>();
  private audits: TaskAuditRecord[] = [];

  constructor(private readonly authPort: AuthorizationPort = { decide: async () => ({ allowed: false }) }) {}

  private getAuthorizer(): AuthorizationPort {
    return this.authPort;
  }

  // --- Task Operations ---

  async createTask(
    principal: Principal,
    workspaceId: string,
    input: TaskCreate,
  ): Promise<{ task: Task; etag: string }> {
    if (!input.title || input.title.trim().length === 0) {
      throw new DomainError('INVALID_INPUT', 400);
    }
    const auth = this.getAuthorizer();
    await requireAction(auth, principal, 'task.create', { type: 'workspace', id: workspaceId });

    if (input.assigneeId) {
      await requireAction(auth, principal, 'task.assign', { type: 'workspace', id: workspaceId });
    }

    const taskId = randomUUID();
    const now = new Date();
    const task: Task & { createdAt: Date; updatedAt: Date; dueDateZone?: string } = {
      id: taskId,
      workspaceId,
      title: input.title.trim(),
      importance: input.importance ?? 'medium',
      status: 'todo',
      dueAt: input.dueAt ?? (input.dueDate ? `${input.dueDate.date}T23:59:59Z` : undefined),
      dueDateZone: input.dueDate?.timeZone,
      assigneeId: input.assigneeId,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(taskId, task);
    this.recordAudit(taskId, principal.accountId, 'task.create', { initial: task });

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async getTask(principal: Principal, taskId: string): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    await requireAction(this.getAuthorizer(), principal, 'task.read', { type: 'workspace', id: task.workspaceId });
    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async listWorkspaceTasks(
    principal: Principal,
    workspaceId: string,
    cursor?: string,
    limit = 50,
  ): Promise<{ tasks: Task[]; nextCursor?: string }> {
    await requireAction(this.getAuthorizer(), principal, 'task.read', { type: 'workspace', id: workspaceId });
    const all = Array.from(this.tasks.values())
      .filter(t => t.workspaceId === workspaceId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const startIndex = cursor ? all.findIndex(t => t.id === cursor) + 1 : 0;
    const slice = all.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < all.length ? slice[slice.length - 1]?.id : undefined;

    return { tasks: slice.map(t => this.toPublicTask(t)), nextCursor };
  }

  async listMyTasks(
    principal: Principal,
    options: TaskFilterOptions = {},
  ): Promise<{ tasks: Task[] }> {
    const now = options.now ?? new Date();
    const assigned = Array.from(this.tasks.values()).filter(t => t.assigneeId === principal.accountId);
    const myTasks = [] as typeof assigned;
    for (const task of assigned) {
      const decision = await this.getAuthorizer().decide(principal, 'task.read', { type: 'workspace', id: task.workspaceId });
      if (decision.allowed) myTasks.push(task);
    }

    let filtered = myTasks;

    if (options.filter === 'today') {
      const todayStr = this.getLocalDateString(now, options.timeZone);
      filtered = myTasks.filter(t => {
        const isDueToday = t.dueAt && this.getLocalDateString(new Date(t.dueAt), options.timeZone) === todayStr;
        const hasSessionToday = Array.from(this.workSessions.values()).some(
          s => s.taskId === t.id && s.ownerId === principal.accountId && this.getLocalDateString(new Date(s.startAt), options.timeZone) === todayStr,
        );
        return isDueToday || hasSessionToday;
      });
    } else if (options.filter === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 86400000);
      const tomorrowStr = this.getLocalDateString(tomorrow, options.timeZone);
      filtered = myTasks.filter(t => {
        const isDueTomorrow = t.dueAt && this.getLocalDateString(new Date(t.dueAt), options.timeZone) === tomorrowStr;
        const hasSessionTomorrow = Array.from(this.workSessions.values()).some(
          s => s.taskId === t.id && s.ownerId === principal.accountId && this.getLocalDateString(new Date(s.startAt), options.timeZone) === tomorrowStr,
        );
        return isDueTomorrow || hasSessionTomorrow;
      });
    } else if (options.filter === 'important') {
      filtered = myTasks.filter(t => t.importance === 'high');
    } else if (options.filter === 'upcoming') {
      const tomorrow = new Date(now.getTime() + 86400000);
      filtered = myTasks.filter(t => t.dueAt && new Date(t.dueAt) > tomorrow);
    }

    const sorted = this.sortNextTasks(filtered, principal.accountId, now, options.timeZone);
    return { tasks: sorted.map(t => this.toPublicTask(t)) };
  }

  async updateTask(
    principal: Principal,
    taskId: string,
    input: TaskUpdate,
    ifMatch?: string,
  ): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    await requireAction(this.getAuthorizer(), principal, 'task.edit_common', { type: 'workspace', id: task.workspaceId });

    const change: Record<string, unknown> = {};
    if (input.title !== undefined) {
      if (!input.title.trim()) throw new DomainError('INVALID_INPUT', 400);
      change.oldTitle = task.title;
      task.title = input.title.trim();
      change.newTitle = task.title;
    }
    if (input.importance !== undefined) {
      change.oldImportance = task.importance;
      task.importance = input.importance;
      change.newImportance = task.importance;
    }
    if (input.status !== undefined) {
      change.oldStatus = task.status;
      task.status = input.status;
      change.newStatus = task.status;
    }
    if (input.dueAt !== undefined || input.dueDate !== undefined) {
      change.oldDueAt = task.dueAt;
      task.dueAt = input.dueAt ?? (input.dueDate ? `${input.dueDate.date}T23:59:59Z` : undefined);
      task.dueDateZone = input.dueDate?.timeZone;
      change.newDueAt = task.dueAt;
    }

    task.version += 1;
    task.updatedAt = new Date();
    this.recordAudit(taskId, principal.accountId, 'task.update', change);

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async reassignTask(
    principal: Principal,
    taskId: string,
    input: Reassign,
    ifMatch?: string,
  ): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    await requireAction(this.getAuthorizer(), principal, 'task.assign', { type: 'workspace', id: task.workspaceId });

    const previousAssignee = task.assigneeId;
    task.assigneeId = input.assigneeId;
    task.version += 1;
    task.updatedAt = new Date();

    // QA-11 & EC-18: Previous assignee's private work sessions stay with previous owner.
    // They are NOT transferred to new assignee.
    this.recordAudit(taskId, principal.accountId, 'task.reassign', {
      previousAssignee,
      newAssignee: input.assigneeId,
      sessionsPreservedForPreviousOwner: true,
    });

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async completeTask(
    principal: Principal,
    taskId: string,
    ifMatch?: string,
  ): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    // TASK-04, TASK-08: Confirming completion
    if (task.assigneeId !== principal.accountId) {
      await requireAction(this.getAuthorizer(), principal, 'task.edit_common', { type: 'workspace', id: task.workspaceId });
    }

    task.status = 'done';
    task.version += 1;
    task.updatedAt = new Date();
    this.recordAudit(taskId, principal.accountId, 'task.complete', { completedAt: task.updatedAt });

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async reopenTask(
    principal: Principal,
    taskId: string,
    ifMatch?: string,
  ): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    if (task.assigneeId !== principal.accountId) {
      await requireAction(this.getAuthorizer(), principal, 'task.edit_common', { type: 'workspace', id: task.workspaceId });
    }

    task.status = 'todo';
    task.version += 1;
    task.updatedAt = new Date();
    this.recordAudit(taskId, principal.accountId, 'task.reopen', { reopenedAt: task.updatedAt });

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async bulkActions(principal: Principal, input: BulkTasks): Promise<{ tasks: Task[] }> {
    const updated: Task[] = [];
    const auth = this.getAuthorizer();

    // First pass: validate all versions and permissions (fail-fast on conflict)
    for (const item of input.items) {
      const task = this.tasks.get(item.id);
      if (!task) throw new DomainError('NOT_FOUND', 404);
      if (task.version !== item.version) {
        throw new DomainError('VERSION_CONFLICT', 412);
      }
      const requiredAction = input.action === 'trash' ? 'task.delete' : 'task.edit_common';
      await requireAction(auth, principal, requiredAction, { type: 'workspace', id: task.workspaceId });
    }

    // Second pass: apply actions
    for (const item of input.items) {
      const task = this.tasks.get(item.id)!;
      if (input.action === 'archive') {
        task.status = 'done';
      } else if (input.action === 'trash') {
        this.tasks.delete(item.id);
      }
      task.version += 1;
      task.updatedAt = new Date();
      this.recordAudit(item.id, principal.accountId, `task.bulk_${input.action}`, { action: input.action });
      if (input.action !== 'trash') {
        updated.push(this.toPublicTask(task));
      }
    }

    return { tasks: updated };
  }

  // --- Checklist Operations ---

  async addChecklistItem(
    principal: Principal,
    taskId: string,
    input: Checklist,
    ifMatch?: string,
  ): Promise<{ task: Task; checklistItem: ChecklistItemRecord; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    await this.requireChecklistPermission(principal, task);

    const items = this.getItemsForTask(taskId);
    const now = new Date();
    const itemRecord: ChecklistItemRecord = {
      id: randomUUID(),
      taskId,
      text: input.text.trim(),
      done: input.done ?? false,
      position: items.length,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.checklist.set(itemRecord.id, itemRecord);
    task.version += 1;
    task.updatedAt = now;
    this.recordAudit(taskId, principal.accountId, 'checklist.add', { item: itemRecord });

    return { task: this.toPublicTask(task), checklistItem: itemRecord, etag: `"${task.version}"` };
  }

  async updateChecklistItem(
    principal: Principal,
    taskId: string,
    itemId: string,
    input: Checklist,
    ifMatch?: string,
  ): Promise<{ task: Task; checklistItem: ChecklistItemRecord; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    await this.requireChecklistPermission(principal, task);

    const item = this.checklist.get(itemId);
    if (!item || item.taskId !== taskId) throw new DomainError('NOT_FOUND', 404);

    if (input.text !== undefined) item.text = input.text.trim();
    if (input.done !== undefined) item.done = input.done;
    item.version += 1;
    item.updatedAt = new Date();

    // TASK-08 & EC-17: Updating checklist does NOT automatically mark task complete
    task.version += 1;
    task.updatedAt = item.updatedAt;
    this.recordAudit(taskId, principal.accountId, 'checklist.update', { itemId, done: item.done });

    return { task: this.toPublicTask(task), checklistItem: item, etag: `"${task.version}"` };
  }

  async deleteChecklistItem(
    principal: Principal,
    taskId: string,
    itemId: string,
    ifMatch?: string,
  ): Promise<{ task: Task; etag: string }> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    requireVersion(task.version, ifMatch);

    await this.requireChecklistPermission(principal, task);

    const item = this.checklist.get(itemId);
    if (!item || item.taskId !== taskId) throw new DomainError('NOT_FOUND', 404);

    this.checklist.delete(itemId);
    task.version += 1;
    task.updatedAt = new Date();
    this.recordAudit(taskId, principal.accountId, 'checklist.delete', { itemId });

    return { task: this.toPublicTask(task), etag: `"${task.version}"` };
  }

  async getChecklistItems(principal: Principal, taskId: string): Promise<ChecklistItemRecord[]> {
    const task = this.tasks.get(taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    await requireAction(this.getAuthorizer(), principal, 'task.read', { type: 'workspace', id: task.workspaceId });
    return this.getItemsForTask(taskId);
  }

  private async requireChecklistPermission(principal: Principal, task: Task): Promise<void> {
    if (task.assigneeId === principal.accountId) {
      return; // Assignee has permission to edit checklist (TASK-04, TASK-15)
    }
    await requireAction(this.getAuthorizer(), principal, 'task.checklist', { type: 'workspace', id: task.workspaceId });
  }

  private getItemsForTask(taskId: string): ChecklistItemRecord[] {
    return Array.from(this.checklist.values())
      .filter(i => i.taskId === taskId)
      .sort((a, b) => a.position - b.position);
  }

  // --- Private Work Sessions Operations ---

  async listWorkSessions(
    principal: Principal,
    cursor?: string,
    limit = 50,
  ): Promise<{ sessions: Worksession[]; nextCursor?: string }> {
    // CAL-05 & EC-15: Strictly scoped to current user. Never leaked to other users.
    const userSessions = Array.from(this.workSessions.values())
      .filter(s => s.ownerId === principal.accountId)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    const startIndex = cursor ? userSessions.findIndex(s => s.id === cursor) + 1 : 0;
    const slice = userSessions.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < userSessions.length ? slice[slice.length - 1]?.id : undefined;

    return { sessions: slice.map(s => this.toPublicWorkSession(s)), nextCursor };
  }

  async createWorkSession(
    principal: Principal,
    input: WorkSession,
  ): Promise<{ session: Worksession; isLate: boolean; etag: string }> {
    const task = this.tasks.get(input.taskId);
    if (!task) throw new DomainError('NOT_FOUND', 404);
    if (task.assigneeId !== principal.accountId) throw new DomainError('FORBIDDEN', 403);
    await requireAction(this.getAuthorizer(), principal, 'task.read', { type: 'workspace', id: task.workspaceId });

    const start = new Date(input.startAt).getTime();
    const end = new Date(input.endAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    // TASK-07: Buổi làm sau hạn vẫn lưu và có nhãn "Làm muộn"
    const isLate = Boolean(task.dueAt && end > new Date(task.dueAt).getTime());

    const sessionId = randomUUID();
    const now = new Date();
    const sessionRecord = {
      id: sessionId,
      taskId: input.taskId,
      ownerId: principal.accountId,
      startAt: input.startAt,
      endAt: input.endAt,
      isLate,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.workSessions.set(sessionId, sessionRecord);
    return { session: this.toPublicWorkSession(sessionRecord), isLate, etag: `"${sessionRecord.version}"` };
  }

  async updateWorkSession(
    principal: Principal,
    sessionId: string,
    input: WorkSession,
    ifMatch?: string,
  ): Promise<{ session: Worksession; etag: string }> {
    const session = this.workSessions.get(sessionId);
    if (!session || session.ownerId !== principal.accountId) {
      throw new DomainError('NOT_FOUND', 404);
    }
    requireVersion(session.version, ifMatch);

    const start = new Date(input.startAt).getTime();
    const end = new Date(input.endAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    session.startAt = input.startAt;
    session.endAt = input.endAt;
    session.version += 1;
    session.updatedAt = new Date();

    const task = this.tasks.get(session.taskId);
    session.isLate = Boolean(task?.dueAt && end > new Date(task.dueAt).getTime());

    return { session: this.toPublicWorkSession(session), etag: `"${session.version}"` };
  }

  async deleteWorkSession(
    principal: Principal,
    sessionId: string,
    ifMatch?: string,
  ): Promise<{ session: Worksession }> {
    const session = this.workSessions.get(sessionId);
    if (!session || session.ownerId !== principal.accountId) {
      throw new DomainError('NOT_FOUND', 404);
    }
    requireVersion(session.version, ifMatch);

    this.workSessions.delete(sessionId);
    return { session: this.toPublicWorkSession(session) };
  }

  // --- Auditing & Diagnostics ---

  getAudits(taskId: string): TaskAuditRecord[] {
    return this.audits.filter(a => a.taskId === taskId);
  }

  private recordAudit(taskId: string, actorId: string, action: string, change: Record<string, unknown>): void {
    this.audits.push({
      id: randomUUID(),
      taskId,
      actorId,
      action,
      change,
      at: new Date(),
    });
  }

  // --- Helpers ---

  private toPublicTask(task: Task): Task {
    return {
      id: task.id,
      workspaceId: task.workspaceId,
      title: task.title,
      importance: task.importance,
      status: task.status,
      dueAt: task.dueAt,
      assigneeId: task.assigneeId,
      version: task.version,
    };
  }

  private toPublicWorkSession(session: Worksession): Worksession {
    return {
      id: session.id,
      taskId: session.taskId,
      ownerId: session.ownerId,
      startAt: session.startAt,
      endAt: session.endAt,
      version: session.version,
    };
  }

  private getLocalDateString(date: Date, timeZone?: string): string {
    try {
      return date.toLocaleDateString('en-CA', { timeZone: timeZone || 'UTC' });
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }

  // TASK-11 & TASK-17 Ordering Implementation
  private sortNextTasks(
    tasks: (Task & { createdAt: Date; dueDateZone?: string })[],
    ownerId: string,
    now: Date,
    timeZone?: string,
  ): (Task & { createdAt: Date; dueDateZone?: string })[] {
    const todayStr = this.getLocalDateString(now, timeZone);

    const isOverdue = (t: Task & { dueDateZone?: string }): boolean => {
      if (t.status === 'done' || !t.dueAt) return false;
      const due = new Date(t.dueAt);
      return due.getTime() < now.getTime();
    };

    const isDueToday = (t: Task): boolean => {
      if (!t.dueAt) return false;
      return this.getLocalDateString(new Date(t.dueAt), timeZone) === todayStr;
    };

    const hasSessionToday = (t: Task): boolean => {
      return Array.from(this.workSessions.values()).some(
        s => s.taskId === t.id && s.ownerId === ownerId && this.getLocalDateString(new Date(s.startAt), timeZone) === todayStr,
      );
    };

    const importanceRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

    // Grouping
    const g1Overdue: typeof tasks = [];
    const g2DueToday: typeof tasks = [];
    const g3SessionToday: typeof tasks = [];
    const g4Unscheduled: typeof tasks = [];
    const gOther: typeof tasks = [];

    for (const t of tasks) {
      if (isOverdue(t)) {
        g1Overdue.push(t);
      } else if (isDueToday(t)) {
        g2DueToday.push(t);
      } else if (hasSessionToday(t)) {
        g3SessionToday.push(t);
      } else if (!t.dueAt) {
        g4Unscheduled.push(t);
      } else {
        gOther.push(t);
      }
    }

    // Sort group 1: oldest due first
    g1Overdue.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

    // Sort group 2: earliest due today first
    g2DueToday.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

    // Sort group 3: earliest session today first
    g3SessionToday.sort((a, b) => {
      const aSession = Array.from(this.workSessions.values()).find(s => s.taskId === a.id && s.ownerId === ownerId);
      const bSession = Array.from(this.workSessions.values()).find(s => s.taskId === b.id && s.ownerId === ownerId);
      return (aSession ? new Date(aSession.startAt).getTime() : 0) - (bSession ? new Date(bSession.startAt).getTime() : 0);
    });

    // Sort group 4 (TASK-17): High -> Medium -> Low, then oldest created, then ID
    g4Unscheduled.sort((a, b) => {
      const impDiff = (importanceRank[b.importance] ?? 0) - (importanceRank[a.importance] ?? 0);
      if (impDiff !== 0) return impDiff;
      const createdDiff = a.createdAt.getTime() - b.createdAt.getTime();
      if (createdDiff !== 0) return createdDiff;
      return a.id.localeCompare(b.id);
    });

    // Other upcoming tasks
    gOther.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

    return [...g1Overdue, ...g2DueToday, ...g3SessionToday, ...g4Unscheduled, ...gOther];
  }
}
