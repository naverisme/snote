import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
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
  // CUXA-01 / CUXA-04: Default 'week' on desktop, 'day' on mobile (< 768px)
  const isMobileInitial = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  };

  const [viewMode, setViewMode] = useState<CalendarViewMode>(() =>
    isMobileInitial() ? 'day' : 'week',
  );
  const [offsetDays, setOffsetDays] = useState(0);

  // Sync with responsive viewport changes
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(prev => {
        if (isMobile && prev === 'week') return 'day';
        if (!isMobile && prev === 'day') return 'week';
        return prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      return visibleDays[0].toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
      }}
    >
      {/* Top Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() =>
              setOffsetDays(
                prev => prev - (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30),
              )
            }
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={13} />
            <span>Trước</span>
          </button>
          <button
            type="button"
            onClick={() => setOffsetDays(0)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-title)',
              cursor: 'pointer',
            }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() =>
              setOffsetDays(
                prev => prev + (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30),
              )
            }
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Sau</span>
            <ChevronRight size={13} />
          </button>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ink-title)',
              marginLeft: '6px',
            }}
          >
            <CalendarIcon size={16} style={{ color: 'var(--accent)' }} />
            <span>{headerLabel}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Timezone Selector (QA-10, CAL-01, CAL-07) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              htmlFor="calendar-tz-select"
              style={{ fontSize: '12px', color: 'var(--ink-muted)' }}
            >
              Múi giờ:
            </label>
            <select
              id="calendar-tz-select"
              value={timeZone}
              onChange={e => onTimeZoneChange(e.target.value)}
              style={{
                padding: '5px 8px',
                fontSize: '12px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--hairline)',
                background: 'var(--surface-raised, #ffffff)',
                color: 'var(--ink-body)',
                cursor: 'pointer',
              }}
            >
              <option value="Asia/Ho_Chi_Minh">Hà Nội / HCM (UTC+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
            </select>
          </div>

          {/* View Mode Switcher (CUXA-01) */}
          <div
            style={{
              display: 'inline-flex',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              overflow: 'hidden',
            }}
          >
            {(['day', 'week', 'month'] as CalendarViewMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  border: 'none',
                  background:
                    viewMode === mode
                      ? 'var(--accent)'
                      : 'var(--surface-raised, #ffffff)',
                  color: viewMode === mode ? '#ffffff' : 'var(--ink-body)',
                  cursor: 'pointer',
                  borderLeft:
                    mode !== 'day' ? '1px solid var(--hairline)' : 'none',
                  fontWeight: viewMode === mode ? 600 : 400,
                  transition: 'background var(--transition-fast, 0.16s ease)',
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
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: 'var(--bg-app)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-raised)',
              transition: 'background var(--transition-fast, 0.16s ease)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Plus size={14} />
              <span>Sự kiện mới</span>
            </span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner (CAL-06) */}
      {hasConflict && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-sm, 6px)',
            fontSize: '12px',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle
            size={16}
            style={{ flexShrink: 0, color: 'var(--warning)' }}
          />
          <span>
            <strong>Cảnh báo trùng lịch:</strong> Có các sự kiện trùng khung giờ trong lịch này. Hệ thống vẫn lưu đầy đủ nhưng bạn nên kiểm tra lại để tránh xung đột.
          </span>
        </div>
      )}

      {/* When no events exist */}
      {events.length === 0 ? (
        <div
          style={{
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md, 10px)',
            background: 'var(--surface-raised, #ffffff)',
            boxShadow: 'var(--shadow-raised)',
            padding: '48px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--surface-ground, #f4f4f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--ink-muted)',
            }}
          >
            <CalendarIcon size={22} />
          </div>

          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--ink-title)',
              marginBottom: '4px',
            }}
          >
            Chưa có sự kiện trong lịch trình
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--ink-subtle)',
              maxWidth: '380px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            Lên kế hoạch cho các buổi họp nhóm, sự kiện lớp học hoặc lịch làm việc riêng để quản lý thời gian hiệu quả.
          </p>

          <button
            type="button"
            onClick={onNewEventClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--accent)',
              color: 'var(--bg-app)',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid var(--accent)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-raised)',
            }}
          >
            <Plus size={15} />
            <span>Tạo sự kiện mới</span>
            <ArrowRight size={14} style={{ opacity: 0.8 }} />
          </button>
        </div>
      ) : (
        <>
          {/* All-Day Events Section (QA-10 & EC-13: Civil Date anchored) */}
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--surface-ground, #f4f4f5)',
              padding: '12px 14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--ink-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px',
                letterSpacing: '0.02em',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CalendarIcon size={13} />
                <span>Sự kiện cả ngày (Giữ nguyên ngày dân sự theo QA-10)</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {events.filter(e => e.allDay).length === 0 ? (
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--ink-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  Không có sự kiện cả ngày
                </span>
              ) : (
                events
                  .filter(e => e.allDay)
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        background:
                          event.status === 'cancelled'
                            ? 'rgba(239, 68, 68, 0.08)'
                            : 'rgba(37, 99, 235, 0.08)',
                        border:
                          event.status === 'cancelled'
                            ? '1px solid rgba(239, 68, 68, 0.3)'
                            : '1px solid rgba(37, 99, 235, 0.25)',
                        color:
                          event.status === 'cancelled'
                            ? 'var(--danger)'
                            : 'var(--accent)',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{event.title}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          opacity: 0.8,
                          color: 'var(--ink-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        [{event.allDay?.startDate}{' '}
                        <ArrowRight size={10} style={{ display: 'inline' }} />{' '}
                        {event.allDay?.endDateExclusive}]
                      </span>
                      {event.status === 'cancelled' && (
                        <span
                          style={{
                            fontSize: '10px',
                            background: 'var(--danger)',
                            color: '#ffffff',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          Đã hủy
                        </span>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Timed Events Grid */}
          <div
            style={{
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-md, 8px)',
              overflowX: 'auto',
              background: 'var(--surface-raised, #ffffff)',
              flex: 1,
              boxShadow: 'var(--shadow-raised)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                minWidth: '700px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--surface-ground, #f4f4f5)',
                    borderBottom: '1px solid var(--hairline)',
                  }}
                >
                  {visibleDays.map(day => (
                    <th
                      key={day.toISOString()}
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderLeft: '1px solid var(--hairline)',
                        background: isToday(day)
                          ? 'rgba(37, 99, 235, 0.04)'
                          : 'transparent',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: isToday(day) ? 700 : 500,
                          color: isToday(day)
                            ? 'var(--accent)'
                            : 'var(--ink-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </div>
                      {/* Solid Disc cho ngày hiện tại (Stageshow Standard) */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginTop: '4px',
                        }}
                      >
                        {isToday(day) ? (
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--accent)',
                              color: 'var(--bg-app)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                            }}
                          >
                            {day.toLocaleDateString('vi-VN', { day: '2-digit' })}
                          </span>
                        ) : (
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--ink-title)',
                            }}
                          >
                            {day.toLocaleDateString('vi-VN', { day: '2-digit' })}
                          </span>
                        )}
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
                          borderLeft: '1px solid var(--hairline)',
                          borderBottom: '1px solid var(--hairline)',
                          background: isToday(day)
                            ? 'rgba(37, 99, 235, 0.02)'
                            : 'transparent',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          {dayEvents.map(ev => {
                            const isCancelled = ev.status === 'cancelled';
                            const isSelected = ev.id === selectedEventId;

                            return (
                              <div
                                key={ev.id}
                                onClick={() => onSelectEvent(ev)}
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 'var(--radius-sm, 6px)',
                                  background: isCancelled
                                    ? 'var(--surface-ground, #f4f4f5)'
                                    : ev.conflictWarning
                                    ? 'rgba(245, 158, 11, 0.1)'
                                    : 'rgba(37, 99, 235, 0.06)',
                                  border: isCancelled
                                    ? '1px solid var(--hairline)'
                                    : ev.conflictWarning
                                    ? '1px solid rgba(245, 158, 11, 0.4)'
                                    : isSelected
                                    ? '2px solid var(--accent)'
                                    : '1px solid rgba(37, 99, 235, 0.2)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '3px',
                                  transition:
                                    'transform var(--transition-fast, 0.16s ease), box-shadow var(--transition-fast, 0.16s ease)',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '4px',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: isCancelled
                                        ? 'var(--ink-muted)'
                                        : 'var(--ink-title)',
                                      textDecoration: isCancelled
                                        ? 'line-through'
                                        : 'none',
                                    }}
                                  >
                                    {ev.title}
                                  </span>
                                  {isCancelled && (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--danger)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        padding: '1px 4px',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      Đã hủy
                                    </span>
                                  )}
                                  {ev.conflictWarning && !isCancelled && (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        background: 'var(--warning)',
                                        color: '#ffffff',
                                        padding: '1px 4px',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                      title="Trùng lịch"
                                    >
                                      <AlertTriangle size={10} />
                                      <span>Trùng</span>
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: 'var(--ink-muted)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                  }}
                                >
                                  <Clock
                                    size={10}
                                    style={{ color: 'var(--ink-muted)' }}
                                  />
                                  <span>
                                    {ev.timed?.startsAt.slice(11, 16)} -{' '}
                                    {ev.timed?.endsAt.slice(11, 16)} (
                                    {timeZone.split('/')[1] ?? timeZone})
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '10px',
                                    color: 'var(--ink-muted)',
                                  }}
                                >
                                  Phạm vi:{' '}
                                  {ev.scope.type === 'private'
                                    ? 'Riêng tư'
                                    : ev.scope.type === 'workspace'
                                    ? 'Workspace'
                                    : 'Lớp học'}
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
        </>
      )}
    </div>
  );
};

