import React, { useCallback, useEffect, useRef, useState } from 'react';
import { calendarApi } from './api';
import { listWorkspaces } from '../../shared/api';
import { CalendarView } from './CalendarView';
import { EventModal } from './EventModal';
import type { CalendarEventViewModel, EventInput, Scope } from './types';

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
  const [resolvedWorkspaceId, setResolvedWorkspaceId] = useState<string | undefined>(scopeId);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Resolve real default workspace ID if not provided (EC-01)
  useEffect(() => {
    if (scopeId) {
      setResolvedWorkspaceId(scopeId);
      return;
    }
    void listWorkspaces()
      .then(res => {
        const defWs = res.data.find(w => w.kind === 'default') ?? res.data[0];
        if (defWs) setResolvedWorkspaceId(defWs.id);
      })
      .catch(() => {
        // Handled when user attempts workspace-scoped actions
      });
  }, [scopeId]);

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
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('403') || msg.includes('FORBIDDEN')) {
        setError('Bạn không có quyền truy cập lịch trình này (403 Forbidden).');
      } else if (msg.includes('404') || msg.includes('NOT_FOUND')) {
        setError('Không tìm thấy lịch trình hoặc phạm vi tương ứng (404 Not Found).');
      } else if (msg.includes('500')) {
        setError('Lỗi máy chủ nội bộ khi tải lịch trình (500). Vui lòng thử lại sau.');
      } else {
        setError('Không thể tải lịch trình. Vui lòng kiểm tra kết nối và thử lại.');
      }
      // Zero fake fixtures on error:
      setEvents([]);
      setSelectedEvent(undefined);
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

  const effectiveScopeType: Scope['type'] = (scopeType as Scope['type']) ?? (resolvedWorkspaceId ? 'workspace' : 'private');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            background: '#fff4f2',
            color: '#9f2d20',
            border: '1px solid #f2cbc5',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: '12px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadEvents()}
            style={{
              border: '1px solid currentColor',
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'transparent',
              color: 'inherit',
              padding: '5px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            Thử lại
          </button>
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
          defaultScopeType={effectiveScopeType}
          defaultScopeId={resolvedWorkspaceId}
        />
      )}
    </div>
  );
};

