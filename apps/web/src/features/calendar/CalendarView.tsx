import React, { useMemo, useState } from 'react';
import type { CalendarEventViewModel, CalendarViewMode } from './types';

interface CalendarViewProps {
  events: CalendarEventViewModel[];
  onSelectEvent: (event: CalendarEventViewModel) => void;
  selectedEventId?: string;
  timeZone: string;
  onTimeZoneChange: (tz: string) => void;
  onNewEventClick: () => void;
  now?: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
  timeZone,
  onTimeZoneChange,
  onNewEventClick,
  now = new Date(),
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [offsetDays, setOffsetDays] = useState(0);

  // Generate days based on viewMode
  const visibleDays = useMemo(() => {
    const base = new Date(now);
    base.setDate(base.getDate() + offsetDays);
    base.setHours(0, 0, 0, 0);

    const count = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [now, offsetDays, viewMode]);

  const headerLabel = useMemo(() => {
    if (visibleDays.length === 1) {
      return visibleDays[0].toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const first = visibleDays[0];
    const last = visibleDays[visibleDays.length - 1];
    return `${first.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${last.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }, [visibleDays]);

  const hasConflict = useMemo(() => {
    return events.some(e => e.conflictWarning && e.status === 'active');
  }, [events]);

  const isToday = (d: Date) => d.toDateString() === now.toDateString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setOffsetDays(prev => prev - (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            ← Trước
          </button>
          <button
            type="button"
            onClick={() => setOffsetDays(0)}
            style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setOffsetDays(prev => prev + (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            Sau →
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#24292f', marginLeft: '6px' }}>
            {headerLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Timezone Selector (QA-10, CAL-01, CAL-07) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="calendar-tz-select" style={{ fontSize: '12px', color: '#57606a' }}>
              Múi giờ:
            </label>
            <select
              id="calendar-tz-select"
              value={timeZone}
              onChange={e => onTimeZoneChange(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
            >
              <option value="Asia/Ho_Chi_Minh">Hà Nội / HCM (UTC+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid #d0d7de', overflow: 'hidden' }}>
            {(['day', 'week', 'month'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  border: 'none',
                  background: viewMode === mode ? '#0969da' : '#fff',
                  color: viewMode === mode ? '#fff' : '#24292f',
                  cursor: 'pointer',
                  borderLeft: mode !== 'day' ? '1px solid #d0d7de' : 'none',
                }}
              >
                {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>

          {/* New Event Button */}
          <button
            type="button"
            onClick={onNewEventClick}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #1a7f37',
              background: '#1f883d',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + Sự kiện mới
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner (CAL-06) */}
      {hasConflict && (
        <div style={{ padding: '8px 12px', background: '#fff8c5', border: '1px solid #d4a72c', borderRadius: '6px', fontSize: '12px', color: '#735c0f', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️ <strong>Cảnh báo trùng lịch:</strong> Có các sự kiện trùng khung giờ trong lịch này. Hệ thống vẫn lưu đầy đủ nhưng bạn nên kiểm tra lại để tránh xung đột.</span>
        </div>
      )}

      {/* All-Day Events Section (QA-10 & EC-13: Civil Date anchored) */}
      <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa', padding: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#57606a', textTransform: 'uppercase', marginBottom: '8px' }}>
          📅 Sự kiện cả ngày (Giữ nguyên ngày dân sự theo QA-10)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {events.filter(e => e.allDay).length === 0 ? (
            <span style={{ fontSize: '12px', color: '#8c959f', fontStyle: 'italic' }}>Không có sự kiện cả ngày</span>
          ) : (
            events
              .filter(e => e.allDay)
              .map(event => (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: event.status === 'cancelled' ? '#ffebe9' : '#ddf4ff',
                    border: event.status === 'cancelled' ? '1px solid #ff8182' : '1px solid #54aeff',
                    color: event.status === 'cancelled' ? '#cf222e' : '#0969da',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{event.title}</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>
                    [{event.allDay?.startDate} → {event.allDay?.endDateExclusive}]
                  </span>
                  {event.status === 'cancelled' && (
                    <span style={{ fontSize: '10px', background: '#cf222e', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                      Đã hủy
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Timed Events Grid */}
      <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', overflowX: 'auto', background: '#fff', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f6f8fa', borderBottom: '1px solid #d0d7de' }}>
              {visibleDays.map(day => (
                <th
                  key={day.toISOString()}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderLeft: '1px solid #e1e4e8',
                    background: isToday(day) ? '#ddf4ff' : 'transparent',
                    color: isToday(day) ? '#0969da' : '#57606a',
                  }}
                >
                  <div style={{ fontWeight: isToday(day) ? 700 : 500 }}>
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: isToday(day) ? 700 : 400 }}>
                    {day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: '320px', verticalAlign: 'top' }}>
              {visibleDays.map(day => {
                const dayStr = day.toISOString().slice(0, 10);
                const dayEvents = events.filter(e => {
                  if (e.timed) {
                    return e.timed.startsAt.slice(0, 10) === dayStr;
                  }
                  return false;
                });

                return (
                  <td
                    key={dayStr}
                    style={{
                      padding: '8px',
                      borderLeft: '1px solid #f0f2f5',
                      borderBottom: '1px solid #f0f2f5',
                      background: isToday(day) ? 'rgba(221, 244, 255, 0.2)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dayEvents.map(ev => {
                        const isCancelled = ev.status === 'cancelled';
                        const isSelected = ev.id === selectedEventId;

                        return (
                          <div
                            key={ev.id}
                            onClick={() => onSelectEvent(ev)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: isCancelled ? '#f6f8fa' : ev.conflictWarning ? '#fff8c5' : '#e7f5ff',
                              border: isCancelled
                                ? '1px solid #d0d7de'
                                : ev.conflictWarning
                                ? '1px solid #d4a72c'
                                : isSelected
                                ? '2px solid #0969da'
                                : '1px solid #a5d8ff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: isCancelled ? '#57606a' : '#1971c2', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                                {ev.title}
                              </span>
                              {isCancelled && (
                                <span style={{ fontSize: '10px', background: '#ffebe9', color: '#cf222e', border: '1px solid #ff8182', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                                  Đã hủy
                                </span>
                              )}
                              {ev.conflictWarning && !isCancelled && (
                                <span style={{ fontSize: '10px', background: '#d4a72c', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }} title="Trùng lịch">
                                  ⚠️ Trùng
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '10px', color: '#57606a' }}>
                              {ev.timed?.startsAt.slice(11, 16)} - {ev.timed?.endsAt.slice(11, 16)} ({timeZone.split('/')[1] ?? timeZone})
                            </div>
                            <div style={{ fontSize: '10px', color: '#8c959f' }}>
                              Phạm vi: {ev.scope.type === 'private' ? 'Riêng tư' : ev.scope.type === 'workspace' ? 'Workspace' : 'Lớp học'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
