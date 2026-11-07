import React, { useCallback, useEffect, useRef, useState } from 'react';
import { calendarApi } from './api';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
import { mockCalendarEventsFixture } from './fixtures';
import type { CalendarEventViewModel, EventInput } from './types';

interface CalendarContainerProps {
  scopeType?: string;
  scopeId?: string;
  initialTimeZone?: string;
}

export const CalendarContainer: React.FC<CalendarContainerProps> = ({
  scopeType,
  scopeId,
  initialTimeZone = 'Asia/Ho_Chi_Minh',
}) => {
  const [events, setEvents] = useState<CalendarEventViewModel[]>(mockCalendarEventsFixture);
  const [timeZone, setTimeZone] = useState<string>(initialTimeZone);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventViewModel | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadEvents = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let loaded: CalendarEventViewModel[];
      if (scopeType && scopeId) {
        loaded = await calendarApi.listEvents(scopeType, scopeId, { signal: controller.signal });
      } else {
        loaded = await calendarApi.listMyEvents(timeZone, { signal: controller.signal });
      }
      setEvents(loaded);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Không thể đồng bộ lịch từ máy chủ. Đang hiển thị bản nháp ngoại tuyến.');
      setEvents(mockCalendarEventsFixture);
    }
  }, [scopeType, scopeId, timeZone]);

  useEffect(() => {
    void loadEvents();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [loadEvents]);

  const handleSaveEvent = async (input: EventInput) => {
    const created = await calendarApi.createEvent(input);
    setEvents(prev => [created, ...prev]);
  };

  const handleCancelEvent = async (eventId: string) => {
    const cancelled = await calendarApi.cancelEvent(eventId);
    setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, status: 'cancelled', version: cancelled.version } : e)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {error && (
        <div style={{ padding: '8px 12px', background: '#ffebe9', color: '#cf222e', borderRadius: '6px', marginBottom: '10px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <CalendarView
        events={events}
        onSelectEvent={ev => {
          setSelectedEvent(ev);
          setIsModalOpen(true);
        }}
        selectedEventId={selectedEvent?.id}
        timeZone={timeZone}
        onTimeZoneChange={setTimeZone}
        onNewEventClick={() => {
          setSelectedEvent(undefined);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(undefined);
          }}
          onSave={handleSaveEvent}
          onCancelEvent={handleCancelEvent}
          defaultTimeZone={timeZone}
        />
      )}
    </div>
  );
};
