import React, { useCallback, useEffect, useRef, useState } from 'react';
import { calendarApi } from './api';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
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
  const [events, setEvents] = useState<CalendarEventViewModel[]>([]);
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
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError('Không thể tải lịch. Kiểm tra kết nối rồi thử lại.');
      setEvents([]);
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
        <div role="alert" style={{ padding: '12px 14px', background: '#fff4f2', color: '#9f2d20', border: '1px solid #f2cbc5', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{error}</span>
          <button type="button" onClick={() => void loadEvents()} style={{ border: '1px solid currentColor', borderRadius: 6, background: 'transparent', color: 'inherit', padding: '5px 9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Thử lại</button>
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
