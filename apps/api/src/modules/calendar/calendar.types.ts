import type { components } from '@snote/contracts';

export type Event = components['schemas']['Event'];
export type EventInput = components['schemas']['EventInput'];
export type Scope = components['schemas']['Scope'];
export type AllDay = components['schemas']['AllDay'];
export type Timed = components['schemas']['Timed'];
export type EventResult = components['schemas']['EventResult'];
export type EventListResult = components['schemas']['EventListResult'];

export interface AuditEventRecord {
  id: string;
  actorId: string;
  scopeType: string;
  scopeId: string;
  action: string;
  targetId: string;
  at: Date;
}

export interface CalendarQuery {
  scopeType?: string;
  scopeId?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}
