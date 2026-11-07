import type { CalendarEventViewModel, Event, EventInput } from './types';
import { mockCalendarEventsFixture } from './fixtures';

export interface CalendarRequestOptions {
  csrfToken?: string;
  etag?: string;
  signal?: AbortSignal;
}

export class CalendarApiClient {
  private inMemoryEvents: CalendarEventViewModel[] = [...mockCalendarEventsFixture];

  async listMyEvents(timeZone?: string, options: CalendarRequestOptions = {}): Promise<CalendarEventViewModel[]> {
    try {
      const query = new URLSearchParams();
      if (timeZone) query.set('timeZone', timeZone);
      const res = await fetch(`/api/v2/me/events?${query.toString()}`, {
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
    return this.inMemoryEvents;
  }

  async listEvents(
    scopeType?: string,
    scopeId?: string,
    options: CalendarRequestOptions = {},
  ): Promise<CalendarEventViewModel[]> {
    try {
      const query = new URLSearchParams();
      if (scopeType) query.set('scopeType', scopeType);
      if (scopeId) query.set('scopeId', scopeId);
      const res = await fetch(`/api/v2/events?${query.toString()}`, {
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
    return this.inMemoryEvents.filter(e => {
      if (scopeType && e.scope.type !== scopeType) return false;
      if (scopeId && e.scope.id !== scopeId) return false;
      return true;
    });
  }

  async createEvent(body: EventInput, options: CalendarRequestOptions = {}): Promise<Event> {
    try {
      const res = await fetch('/api/v2/events', {
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
    const newEvent: CalendarEventViewModel = {
      id: `ev-${Date.now()}`,
      title: body.title,
      scope: body.scope,
      allDay: 'allDay' in body ? body.allDay : undefined,
      timed: 'timed' in body ? body.timed : undefined,
      status: 'active',
      version: 1,
      audience: body.audience,
      content: body.content,
    };
    this.inMemoryEvents.unshift(newEvent);
    return newEvent;
  }

  async cancelEvent(eventId: string, options: CalendarRequestOptions = {}): Promise<Event> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': options.csrfToken ?? 'csrf-token',
      };
      if (options.etag) headers['If-Match'] = options.etag;
      const res = await fetch(`/api/v2/events/${encodeURIComponent(eventId)}/cancel`, {
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
    const event = this.inMemoryEvents.find(e => e.id === eventId);
    if (event) {
      event.status = 'cancelled';
      event.version += 1;
      return event;
    }
    throw new Error('Event not found');
  }
}

export const calendarApi = new CalendarApiClient();
