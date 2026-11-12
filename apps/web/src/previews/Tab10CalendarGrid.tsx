import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, AlertTriangle, Clock, MapPin, Check } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  time: string;
  scope: 'class' | 'group' | 'personal';
  location: string;
}

const EVENTS: Record<number, EventItem[]> = {
  3: [{ id: 'e-1', title: 'Họp khởi động Đồ án môn học', time: '08:00 - 10:00', scope: 'class', location: 'Phòng B4-302' }],
  9: [{ id: 'e-2', title: 'Họp kỹ thuật Nhóm 01: Thiết kế API', time: '14:00 - 16:00', scope: 'group', location: 'Google Meet' }],
  14: [{ id: 'e-3', title: 'Buổi làm riêng: Hoàn thiện UI Tests', time: '19:00 - 21:00', scope: 'personal', location: 'Thư viện trung tâm' }],
  18: [{ id: 'e-4', title: 'Báo cáo tiến độ Giữa kỳ (Giáo viên)', time: '09:00 - 11:30', scope: 'class', location: 'Hội trường H1' }],
  22: [
    { id: 'e-5', title: 'Review Code SNOTE v2 Sprint 3', time: '15:00 - 16:30', scope: 'group', location: 'Lab 402' },
    { id: 'e-6', title: 'Họp đồng thời Ban cán sự (Trùng lịch)', time: '15:30 - 17:00', scope: 'class', location: 'Online' },
  ],
};

const DAYS_HEADER = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const Tab10CalendarGrid: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(22);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const dayEvents = EVENTS[selectedDay] || [];
  const hasConflict = dayEvents.length > 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Header Controls */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', padding: '0 8px' }}>Tháng 11, 2026</span>
            <button type="button" className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}><ChevronRight size={14} /></button>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '3px 10px' }}
                onClick={() => setViewMode(mode)}
              >
                {mode === 'month' ? 'Tháng' : mode === 'week' ? 'Tuần' : 'Ngày'}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} />
          <span>Thêm sự kiện lịch</span>
        </button>
      </div>

      {/* Main Grid + Sidebar Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        {/* Month Calendar Grid */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
            {DAYS_HEADER.map(d => (
              <div key={d} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const events = EVENTS[day] || [];
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    minHeight: '80px',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: isSelected ? 'var(--surface-hover)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 0 0 1px var(--text-primary)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {day}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {events.map(ev => (
                      <div
                        key={ev.id}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '3px',
                          background: 'var(--surface-hover)',
                          border: '1px solid var(--border-divider)',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              Lịch trình ngày {selectedDay}/11/2026
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Có {dayEvents.length} sự kiện được lên lịch
            </div>
          </div>

          {hasConflict && (
            <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                <strong>Cảnh báo trùng lịch:</strong> Có 2 sự kiện diễn ra cùng khung giờ chiều nay!
              </div>
            </div>
          )}

          {dayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              Không có sự kiện nào trong ngày này.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border-divider)',
                    borderRadius: '6px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '3px', background: 'var(--surface-card)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {ev.scope === 'class' ? 'Lớp học' : ev.scope === 'group' ? 'Nhóm' : 'Cá nhân'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{ev.time}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{ev.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    <span>{ev.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
