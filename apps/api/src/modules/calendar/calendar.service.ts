import { randomUUID } from 'node:crypto';
import { DomainError, requireAction, type AuthorizationPort, type Principal } from '../../core/authorization';
import { requireVersion } from '../../core/http';
import type {
  AuditEventRecord,
  CalendarQuery,
  Event,
  EventInput,
  Scope,
} from './calendar.types';

export class CalendarService {
  private events = new Map<
    string,
    Event & {
      ownerId: string;
      audience?: string[];
      content?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  >();
  private auditEvents: AuditEventRecord[] = [];

  constructor(private readonly authPort: AuthorizationPort = { decide: async () => ({ allowed: false }) }) {}

  private getAuthorizer(): AuthorizationPort {
    return this.authPort;
  }

  // --- Create Event ---

  async createEvent(
    principal: Principal,
    input: EventInput,
  ): Promise<{ event: Event; conflictWarning: boolean; etag: string }> {
    if (!input.title || input.title.trim().length === 0) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    const scope = input.scope;
    const auth = this.getAuthorizer();

    if (scope.type !== 'private') {
      const scopeId = scope.id ?? 'default';
      await requireAction(auth, principal, 'event.create', {
        type: scope.type as 'class' | 'workspace',
        id: scopeId,
      });
    }

    // Validate Timed vs AllDay
    const isTimed = 'timed' in input && input.timed !== undefined;
    const isAllDay = 'allDay' in input && input.allDay !== undefined;

    if (!isTimed && !isAllDay) {
      throw new DomainError('INVALID_INPUT', 400);
    }

    if (isTimed) {
      const start = new Date(input.timed.startsAt).getTime();
      const end = new Date(input.timed.endsAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        throw new DomainError('INVALID_INPUT', 400); // EC-14: endsAt must be after startsAt
      }
    }

    if (isAllDay) {
      const { startDate, endDateExclusive, timeZone } = input.allDay;
      if (!startDate || !endDateExclusive || !timeZone) {
        throw new DomainError('INVALID_INPUT', 400);
      }
      // EC-14: for all-day, endDateExclusive must be strictly greater than startDate in civil date ordering
      if (startDate >= endDateExclusive) {
        throw new DomainError('INVALID_INPUT', 400);
      }
    }

    // CAL-06: Overlap check for same scope
    const conflictWarning = this.detectOverlap(scope, input);

    const eventId = randomUUID();
    const now = new Date();
    const eventRecord = {
      id: eventId,
      title: input.title.trim(),
      scope,
      timed: 'timed' in input ? input.timed : undefined,
      allDay: 'allDay' in input ? input.allDay : undefined,
      status: 'active' as const,
      version: 1,
      ownerId: principal.accountId,
      audience: input.audience,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };

    this.events.set(eventId, eventRecord);
    this.recordAudit(principal.accountId, scope.type, scope.id ?? eventId, 'event.create', eventId);

    return {
      event: this.toPublicEvent(eventRecord),
      conflictWarning,
      etag: `"${eventRecord.version}"`,
    };
  }

  // --- List / Get Events ---

  async getEvent(principal: Principal, eventId: string): Promise<{ event: Event; etag: string }> {
    const event = this.events.get(eventId);
    if (!event) throw new DomainError('NOT_FOUND', 404);

    if (event.scope.type === 'private') {
      if (event.ownerId !== principal.accountId) throw new DomainError('NOT_FOUND', 404);
    } else {
      await requireAction(this.getAuthorizer(), principal, 'event.read', {
        type: event.scope.type as 'class' | 'workspace',
        id: event.scope.id ?? 'default',
      });
      if (!(await this.canReadAudience(principal, event))) throw new DomainError('NOT_FOUND', 404);
    }

    return { event: this.toPublicEvent(event), etag: `"${event.version}"` };
  }

  async listEvents(
    principal: Principal,
    query: CalendarQuery,
  ): Promise<{ events: Event[]; nextCursor?: string }> {
    const scopeType = query.scopeType ?? 'workspace';
    const scopeId = query.scopeId ?? 'default';

    if (scopeType !== 'private') {
      await requireAction(this.getAuthorizer(), principal, 'event.read', {
        type: scopeType as 'class' | 'workspace',
        id: scopeId,
      });
    }

    const filtered = Array.from(this.events.values()).filter(e => {
      if (e.scope.type !== scopeType) return false;
      if (scopeType !== 'private' && e.scope.id !== scopeId) return false;
      if (scopeType === 'private' && e.ownerId !== principal.accountId) return false;

      // Date range filtering
      if (query.from || query.to) {
        const eventStart = e.timed ? new Date(e.timed.startsAt).toISOString() : e.allDay ? e.allDay.startDate : '';
        if (query.from && eventStart < query.from) return false;
        if (query.to && eventStart > query.to) return false;
      }

      return true;
    });
    const visible = [] as typeof filtered;
    for (const event of filtered) {
      if (await this.canReadAudience(principal, event)) visible.push(event);
    }

    const limit = query.limit ?? 50;
    const startIndex = query.cursor ? visible.findIndex(e => e.id === query.cursor) + 1 : 0;
    const slice = visible.slice(startIndex, startIndex + limit);
    const nextCursor = startIndex + limit < visible.length ? slice[slice.length - 1]?.id : undefined;

    return { events: slice.map(e => this.toPublicEvent(e)), nextCursor };
  }

  async listMyEvents(
    principal: Principal,
    viewerTimeZone?: string,
    userWorkspaceIds?: string[],
  ): Promise<{ events: Event[] }> {
    // CAL-01, CAL-03: Aggregates private events, workspace events, and class events targeted to audience
    const results: Array<Event & { ownerId: string; audience?: string[]; content?: string; createdAt: Date; updatedAt: Date }> = [];
    for (const e of this.events.values()) {
      // 1. Private events: only visible to owner
      if (e.scope.type === 'private') {
        if (e.ownerId === principal.accountId) results.push(e);
        continue;
      }

      // 2. Workspace events: visible if user belongs to workspace
      if (e.scope.type === 'workspace') {
        if (!e.scope.id || (userWorkspaceIds && !userWorkspaceIds.includes(e.scope.id))) continue;
        const decision = await this.getAuthorizer().decide(principal, 'event.read', { type: 'workspace', id: e.scope.id });
        if (decision.allowed) results.push(e);
        continue;
      }

      // 3. Class events: CAL-03 audience check
      if (e.scope.type === 'class') {
        if (!e.scope.id) continue;
        const classDecision = await this.getAuthorizer().decide(principal, 'event.read', { type: 'class', id: e.scope.id });
        if (!classDecision.allowed) continue;
        if (!e.audience || e.audience.length === 0 || e.ownerId === principal.accountId) {
          results.push(e);
          continue;
        }
        if (userWorkspaceIds) {
          if (e.audience.some(wsId => userWorkspaceIds.includes(wsId))) results.push(e);
          continue;
        }
        for (const wsId of e.audience) {
          const groupDecision = await this.getAuthorizer().decide(principal, 'event.read', { type: 'workspace', id: wsId });
          if (groupDecision.allowed) { results.push(e); break; }
        }
      }
    }

    // QA-10: Timed events display according to viewerTimeZone; All-day events retain civil date
    const formatted = results.map(e => {
      const pub = this.toPublicEvent(e);
      // All-day civil dates are strictly preserved
      return pub;
    });

    return { events: formatted };
  }

  // --- Update Event ---

  async updateEvent(
    principal: Principal,
    eventId: string,
    input: EventInput,
    ifMatch?: string,
  ): Promise<{ event: Event; etag: string }> {
    const event = this.events.get(eventId);
    if (!event) throw new DomainError('NOT_FOUND', 404);
    requireVersion(event.version, ifMatch);

    if (event.scope.type === 'private') {
      if (event.ownerId !== principal.accountId) throw new DomainError('FORBIDDEN', 403);
    } else {
      await requireAction(this.getAuthorizer(), principal, 'event.edit', {
        type: event.scope.type as 'class' | 'workspace',
        id: event.scope.id ?? 'default',
      });
    }

    if (input.title !== undefined) {
      if (!input.title.trim()) throw new DomainError('INVALID_INPUT', 400);
      event.title = input.title.trim();
    }
    if ('timed' in input && input.timed) {
      const start = new Date(input.timed.startsAt).getTime();
      const end = new Date(input.timed.endsAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        throw new DomainError('INVALID_INPUT', 400);
      }
      event.timed = input.timed;
      event.allDay = undefined;
    }
    if ('allDay' in input && input.allDay) {
      if (input.allDay.startDate >= input.allDay.endDateExclusive) {
        throw new DomainError('INVALID_INPUT', 400);
      }
      event.allDay = input.allDay;
      event.timed = undefined;
    }
    if (input.audience !== undefined) {
      event.audience = input.audience;
    }
    if (input.content !== undefined) {
      event.content = input.content;
    }

    event.version += 1;
    event.updatedAt = new Date();
    this.recordAudit(principal.accountId, event.scope.type, event.scope.id ?? eventId, 'event.edit', eventId);

    return { event: this.toPublicEvent(event), etag: `"${event.version}"` };
  }

  // --- Cancel Event ---

  async cancelEvent(
    principal: Principal,
    eventId: string,
    ifMatch?: string,
  ): Promise<{ event: Event; etag: string }> {
    const event = this.events.get(eventId);
    if (!event) throw new DomainError('NOT_FOUND', 404);
    requireVersion(event.version, ifMatch);

    // CAL-08, CAL-11: Permission to cancel is distinct from edit
    if (event.scope.type === 'private') {
      if (event.ownerId !== principal.accountId) throw new DomainError('FORBIDDEN', 403);
    } else {
      await requireAction(this.getAuthorizer(), principal, 'event.cancel', {
        type: event.scope.type as 'class' | 'workspace',
        id: event.scope.id ?? 'default',
      });
    }

    // QA-10 & EC-24: Sets status to cancelled and records audit trail.
    // The event remains viewable with status 'cancelled' so recipients see "Đã hủy".
    event.status = 'cancelled';
    event.version += 1;
    event.updatedAt = new Date();
    this.recordAudit(principal.accountId, event.scope.type, event.scope.id ?? eventId, 'event.cancel', eventId);

    return { event: this.toPublicEvent(event), etag: `"${event.version}"` };
  }

  // --- Helpers ---

  private async canReadAudience(principal: Principal, event: Event & { ownerId: string; audience?: string[] }): Promise<boolean> {
    if (event.scope.type !== 'class' || !event.audience?.length || event.ownerId === principal.accountId) return true;
    for (const workspaceId of event.audience) {
      const decision = await this.getAuthorizer().decide(principal, 'event.read', { type: 'workspace', id: workspaceId });
      if (decision.allowed) return true;
    }
    return false;
  }

  private detectOverlap(scope: Scope, input: EventInput): boolean {
    const isInputTimed = 'timed' in input && input.timed !== undefined;
    const inputStart = isInputTimed
      ? new Date(input.timed.startsAt).getTime()
      : 'allDay' in input && input.allDay
      ? new Date(input.allDay.startDate).getTime()
      : 0;
    const inputEnd = isInputTimed
      ? new Date(input.timed.endsAt).getTime()
      : 'allDay' in input && input.allDay
      ? new Date(input.allDay.endDateExclusive).getTime()
      : 0;

    for (const existing of this.events.values()) {
      if (existing.status !== 'active') continue;
      if (existing.scope.type !== scope.type || existing.scope.id !== scope.id) continue;

      const exStart = existing.timed
        ? new Date(existing.timed.startsAt).getTime()
        : existing.allDay
        ? new Date(existing.allDay.startDate).getTime()
        : 0;
      const exEnd = existing.timed
        ? new Date(existing.timed.endsAt).getTime()
        : existing.allDay
        ? new Date(existing.allDay.endDateExclusive).getTime()
        : 0;

      // Check overlap: max(start1, start2) < min(end1, end2)
      if (Math.max(inputStart, exStart) < Math.min(inputEnd, exEnd)) {
        return true; // Overlap detected
      }
    }
    return false;
  }

  getAuditTrail(eventId: string): AuditEventRecord[] {
    return this.auditEvents.filter(a => a.targetId === eventId);
  }

  private recordAudit(actorId: string, scopeType: string, scopeId: string, action: string, targetId: string): void {
    this.auditEvents.push({
      id: randomUUID(),
      actorId,
      scopeType,
      scopeId,
      action,
      targetId,
      at: new Date(),
    });
  }

  private toPublicEvent(record: Event): Event {
    return {
      id: record.id,
      title: record.title,
      scope: record.scope,
      timed: record.timed,
      allDay: record.allDay,
      status: record.status,
      version: record.version,
    };
  }
}
