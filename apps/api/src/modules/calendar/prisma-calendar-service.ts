import { Prisma, type PrismaClient } from '@prisma/client';
import type { AuthorizationPort, Principal } from '../../core/authorization';
import { CalendarService } from './calendar.service';
import type { CalendarQuery, Event, EventInput, Scope } from './calendar.types';

type State = ReturnType<CalendarService['snapshot']>;
const writes = new Set(['createEvent', 'updateEvent', 'cancelEvent']);
const reads = new Set(['getEvent', 'listEvents', 'listMyEvents']);

async function load(tx: Prisma.TransactionClient, method: string, args: unknown[]): Promise<State> {
  const principal = args[0] as Principal;
  let where: Prisma.EventWhereInput = {};
  if (method === 'createEvent') {
    const scope = (args[1] as EventInput).scope;
    where = scope.type === 'private'
      ? { scopeType: 'private', ownerId: principal.accountId }
      : { scopeType: scope.type, scopeId: scope.id ?? 'default' };
  } else if (method === 'listEvents') {
    const query = args[1] as CalendarQuery;
    const scopeType = query.scopeType ?? 'workspace';
    where = scopeType === 'private'
      ? { scopeType, ownerId: principal.accountId }
      : { scopeType, scopeId: query.scopeId ?? 'default' };
  } else if (method !== 'listMyEvents') {
    where = { id: args[1] as string };
  }
  const rows = await tx.event.findMany({ where });
  const audienceRows = await tx.eventAudience.findMany({ where: { eventId: { in: rows.map(row => row.id) } } });
  const audience = new Map<string, string[]>();
  for (const row of audienceRows) {
    if (!row.workspaceId) continue;
    const ids = audience.get(row.eventId) ?? [];
    ids.push(row.workspaceId);
    audience.set(row.eventId, ids);
  }
  return {
    events: rows.map(row => ({
      id: row.id,
      title: row.title,
      scope: (row.scopeType === 'private'
        ? { type: 'private' }
        : { type: row.scopeType, id: row.scopeId }) as Scope,
      timed: row.timedStart && row.timedEnd
        ? { startsAt: row.timedStart.toISOString(), endsAt: row.timedEnd.toISOString() } : undefined,
      allDay: row.allDayStart && row.allDayEndExclusive
        ? { startDate: row.allDayStart.toISOString().slice(0, 10),
          endDateExclusive: row.allDayEndExclusive.toISOString().slice(0, 10),
          timeZone: row.sourceZone ?? 'UTC' } : undefined,
      status: row.status as Event['status'],
      version: row.version,
      ownerId: row.ownerId ?? row.scopeId,
      audience: audience.get(row.id),
      content: row.content ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    auditEvents: [],
  };
}

async function persist(tx: Prisma.TransactionClient, before: State, after: State): Promise<void> {
  const original = new Map(before.events.map(event => [event.id, JSON.stringify(event)]));
  for (const event of after.events) {
    if (original.get(event.id) === JSON.stringify(event)) continue;
    const data = {
      ownerId: event.ownerId,
      content: event.content ?? null,
      scopeType: event.scope.type,
      scopeId: event.scope.id ?? event.ownerId,
      kind: event.timed ? 'timed' : 'all_day',
      title: event.title,
      timedStart: event.timed ? new Date(event.timed.startsAt) : null,
      timedEnd: event.timed ? new Date(event.timed.endsAt) : null,
      allDayStart: event.allDay ? new Date(`${event.allDay.startDate}T00:00:00Z`) : null,
      allDayEndExclusive: event.allDay ? new Date(`${event.allDay.endDateExclusive}T00:00:00Z`) : null,
      sourceZone: event.allDay?.timeZone ?? null,
      status: event.status,
      version: event.version,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
    await tx.event.upsert({ where: { id: event.id }, create: { id: event.id, ...data }, update: data });
    await tx.eventAudience.deleteMany({ where: { eventId: event.id } });
    if (event.audience?.length) {
      await tx.eventAudience.createMany({ data: [...new Set(event.audience)].map(workspaceId => ({
        eventId: event.id, workspaceId,
      })) });
    }
  }
  for (const audit of after.auditEvents) {
    await tx.auditEvent.create({ data: audit });
  }
}

/** Calendar state is loaded and committed inside one transaction for each operation. */
export function createPrismaCalendarService(auth: AuthorizationPort, db: PrismaClient): CalendarService {
  const service = new CalendarService(auth);
  return new Proxy(service, {
    get(target, key, receiver) {
      if (typeof key !== 'string' || (!writes.has(key) && !reads.has(key))) {
        return Reflect.get(target, key, receiver);
      }
      return (...args: unknown[]) => db.$transaction(async tx => {
        if (writes.has(key)) await tx.$queryRaw`SELECT pg_advisory_xact_lock(14140014)::text`;
        const working = new CalendarService(auth);
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
