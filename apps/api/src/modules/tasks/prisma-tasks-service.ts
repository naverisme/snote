import { Prisma, type PrismaClient } from '@prisma/client';
import type { AuthorizationPort, Principal } from '../../core/authorization';
import { TasksService } from './tasks.service';
import { civilDateEnd } from '../../core/civil-date';
import type { Task } from './tasks.types';

type State = ReturnType<TasksService['snapshot']>;

const writes = new Set([
  'createTask', 'updateTask', 'reassignTask', 'completeTask', 'reopenTask',
  'bulkActions', 'addChecklistItem', 'updateChecklistItem', 'deleteChecklistItem',
  'createWorkSession', 'updateWorkSession', 'deleteWorkSession',
]);
const reads = new Set([
  'getTask', 'listWorkspaceTasks', 'listMyTasks', 'getChecklistItems', 'listWorkSessions',
]);
const NONE_ID = '00000000-0000-0000-0000-000000000000';

function changed<T extends { id: string }>(before: T[], after: T[]): T[] {
  const old = new Map(before.map(row => [row.id, JSON.stringify(row)]));
  return after.filter(row => old.get(row.id) !== JSON.stringify(row));
}

function removed<T extends { id: string }>(before: T[], after: T[]): string[] {
  const next = new Set(after.map(row => row.id));
  return before.filter(row => !next.has(row.id)).map(row => row.id);
}

async function persist(tx: Prisma.TransactionClient, before: State, after: State): Promise<void> {
  for (const task of changed(before.tasks, after.tasks)) {
    const data = {
      workspaceId: task.workspaceId,
      assigneeId: task.assigneeId ?? null,
      title: task.title,
      dueAt: task.dueDate ? null : task.dueAt ? new Date(task.dueAt) : null,
      dueDate: task.dueDate ? new Date(`${task.dueDate}T00:00:00Z`) : null,
      dueDateZone: task.dueDateZone ?? null,
      importance: task.importance,
      status: task.status,
      version: task.version,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
    await tx.task.upsert({ where: { id: task.id }, create: { id: task.id, ...data }, update: data });
  }
  for (const id of removed(before.tasks, after.tasks)) await tx.task.delete({ where: { id } });

  for (const item of changed(before.checklist, after.checklist)) {
    const data = { taskId: item.taskId, text: item.text, done: item.done, position: item.position,
      version: item.version, createdAt: item.createdAt, updatedAt: item.updatedAt };
    await tx.checklistItem.upsert({ where: { id: item.id }, create: { id: item.id, ...data }, update: data });
  }
  for (const id of removed(before.checklist, after.checklist)) await tx.checklistItem.delete({ where: { id } });

  for (const session of changed(before.workSessions, after.workSessions)) {
    const data = { taskId: session.taskId, ownerId: session.ownerId, startAt: new Date(session.startAt),
      endAt: new Date(session.endAt), version: session.version, createdAt: session.createdAt,
      updatedAt: session.updatedAt };
    await tx.privateWorkSession.upsert({ where: { id: session.id }, create: { id: session.id, ...data }, update: data });
  }
  for (const id of removed(before.workSessions, after.workSessions)) await tx.privateWorkSession.delete({ where: { id } });

  const existingAudits = new Set(before.audits.map(audit => audit.id));
  for (const audit of after.audits.filter(audit => !existingAudits.has(audit.id))) {
    await tx.taskAudit.create({ data: { id: audit.id, taskId: audit.taskId, actorId: audit.actorId,
      at: audit.at, change: { action: audit.action, details: audit.change } as Prisma.InputJsonValue } });
  }
}

async function load(tx: Prisma.TransactionClient, method: string, args: unknown[]): Promise<State> {
  const principal = args[0] as Principal;
  const taskId = args[1] as string;
  let taskWhere: Prisma.TaskWhereInput = { id: NONE_ID };
  let sessionWhere: Prisma.PrivateWorkSessionWhereInput = { id: NONE_ID };
  if (method === 'listWorkspaceTasks') taskWhere = { workspaceId: taskId };
  else if (method === 'listMyTasks') {
    taskWhere = { assigneeId: principal.accountId };
    sessionWhere = { ownerId: principal.accountId };
  } else if (method === 'bulkActions') {
    taskWhere = { id: { in: (args[1] as { items: { id: string }[] }).items.map(item => item.id) } };
  } else if (method === 'createWorkSession') taskWhere = { id: (args[1] as { taskId: string }).taskId };
  else if (method === 'listWorkSessions') sessionWhere = { ownerId: principal.accountId };
  else if (method === 'updateWorkSession' || method === 'deleteWorkSession') {
    sessionWhere = { id: taskId, ownerId: principal.accountId };
  } else if (method !== 'createTask') taskWhere = { id: taskId };

  const workSessions = await tx.privateWorkSession.findMany({ where: sessionWhere });
  if (method === 'updateWorkSession' && workSessions[0]) taskWhere = { id: workSessions[0].taskId };
  const tasks = await tx.task.findMany({ where: taskWhere });
  const checklist = ['addChecklistItem', 'updateChecklistItem', 'deleteChecklistItem', 'getChecklistItems']
    .includes(method) ? await tx.checklistItem.findMany({ where: { taskId } }) : [];
  return {
    tasks: tasks.map(row => ({ id: row.id, workspaceId: row.workspaceId, title: row.title,
      assigneeId: row.assigneeId ?? undefined,
      dueAt: row.dueDate && row.dueDateZone
        ? civilDateEnd(row.dueDate.toISOString().slice(0, 10), row.dueDateZone).toISOString()
        : row.dueAt?.toISOString(),
      dueDate: row.dueDate?.toISOString().slice(0, 10),
      dueDateZone: row.dueDateZone ?? undefined, importance: row.importance as Task['importance'],
      status: row.status as Task['status'], version: row.version,
      createdAt: row.createdAt, updatedAt: row.updatedAt })),
    checklist: checklist.map(row => ({ id: row.id, taskId: row.taskId, text: row.text, done: row.done,
      position: row.position, version: row.version, createdAt: row.createdAt, updatedAt: row.updatedAt })),
    workSessions: workSessions.map(row => ({ id: row.id, taskId: row.taskId, ownerId: row.ownerId,
      startAt: row.startAt.toISOString(), endAt: row.endAt.toISOString(), version: row.version,
      createdAt: row.createdAt, updatedAt: row.updatedAt })),
    audits: [],
  };
}

/** Each operation loads a fresh state under a database transaction; writes hold a shared advisory lock. */
export function createPrismaTasksService(auth: AuthorizationPort, db: PrismaClient): TasksService {
  const service = new TasksService(auth);
  return new Proxy(service, {
    get(target, key, receiver) {
      if (typeof key !== 'string' || (!writes.has(key) && !reads.has(key))) {
        return Reflect.get(target, key, receiver);
      }
      return (...args: unknown[]) => db.$transaction(async tx => {
        if (writes.has(key)) await tx.$queryRaw`SELECT pg_advisory_xact_lock(14140013)::text`;
        const working = new TasksService(auth);
        working.loadState(await load(tx, key, args));
        const before = writes.has(key) ? structuredClone(working.snapshot()) : undefined;
        const action = (working as unknown as Record<string, (...params: unknown[]) => Promise<unknown>>)[key];
        const result = await action.apply(working, args);
        if (before) await persist(tx, before, working.snapshot());
        return result;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 30000 });
    },
  });
}
