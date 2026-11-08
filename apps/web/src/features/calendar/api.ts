import { request } from '../../api/generated/client';
import { getCsrfToken } from '../../shared/api';
import type { CalendarEventViewModel, Event, EventInput } from './types';

export interface CalendarRequestOptions {
  csrfToken?: string;
  etag?: string;
  signal?: AbortSignal;
}

type Data<T> = { data: T };

function withAuth(options: CalendarRequestOptions = {}) {
  return { ...options, csrfToken: options.csrfToken ?? getCsrfToken() };
}

export class CalendarApiClient {
  async listMyEvents(timeZone?: string, options: CalendarRequestOptions = {}): Promise<CalendarEventViewModel[]> {
    const query = new URLSearchParams();
    if (timeZone) query.set('timeZone', timeZone);
    const result = await request<Data<CalendarEventViewModel[]>>(`/me/events?${query}`, 'GET', undefined, options);
    return result.data;
  }

  async listEvents(
    scopeType?: string,
    scopeId?: string,
    options: CalendarRequestOptions = {},
  ): Promise<CalendarEventViewModel[]> {
    const query = new URLSearchParams();
    if (scopeType) query.set('scopeType', scopeType);
    if (scopeId) query.set('scopeId', scopeId);
    const result = await request<Data<CalendarEventViewModel[]>>(`/events?${query}`, 'GET', undefined, options);
    return result.data;
  }

  async createEvent(body: EventInput, options: CalendarRequestOptions = {}): Promise<Event> {
    const result = await request<Data<Event>>('/events', 'POST', body, withAuth(options));
    return result.data;
  }

  async cancelEvent(eventId: string, options: CalendarRequestOptions = {}): Promise<Event> {
    const result = await request<Data<Event>>(
      `/events/${encodeURIComponent(eventId)}/cancel`, 'POST', undefined, withAuth(options),
    );
    return result.data;
  }
}

export const calendarApi = new CalendarApiClient();
