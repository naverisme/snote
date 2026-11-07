import type { components } from '@snote/contracts';

export type Event = components['schemas']['Event'];
export type EventInput = components['schemas']['EventInput'];
export type Scope = components['schemas']['Scope'];
export type AllDay = components['schemas']['AllDay'];
export type Timed = components['schemas']['Timed'];

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEventViewModel extends Event {
  audience?: string[];
  content?: string;
  conflictWarning?: boolean;
}
