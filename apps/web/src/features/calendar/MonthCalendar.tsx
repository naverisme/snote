import { useState } from 'react';
import { AlertTriangle, CalendarDays } from 'lucide-react';
import type { CalendarEventViewModel } from './types';
import { vietnamDateTimeParts } from '../../shared/time-zone';

interface Props {
  month: Date;
  events: CalendarEventViewModel[];
  onSelectEvent: (event: CalendarEventViewModel) => void;
  today: string;
}

function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function eventsOnDate(events: CalendarEventViewModel[], day: string) {
  return events.filter(event => {
    if (event.allDay) return event.allDay.startDate <= day && day < event.allDay.endDateExclusive;
    return event.timed ? vietnamDateTimeParts(event.timed.startsAt).date === day : false;
  });
}

export function MonthCalendar({ month, events, onSelectEvent, today }: Props) {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;
  const [selected, setSelected] = useState<string | null>(null);
  const selectedDay = selected?.slice(0, 7) === dateKey(first).slice(0, 7) ? selected : today.slice(0, 7) === dateKey(first).slice(0, 7) ? today : dateKey(first);
  const selectedEvents = eventsOnDate(events, selectedDay);
  const cells = Array.from({ length: leading + daysInMonth }, (_, index) => {
    if (index < leading) return null;
    return new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), index - leading + 1));
  });

  return <div className="review-month-layout">
    <section className="review-panel review-month-grid" aria-label="Lịch tháng">
      <div className="review-month-weekdays">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="review-month-days">{cells.map((day, index) => day ? (() => {
        const key = dateKey(day);
        const dayEvents = eventsOnDate(events, key);
        return <button key={key} type="button" className={`review-month-day ${key === selectedDay ? 'selected' : ''} ${key === today ? 'today' : ''}`} onClick={() => setSelected(key)} aria-label={`${day.getUTCDate()} tháng ${day.getUTCMonth() + 1}, ${dayEvents.length} sự kiện`}>
          <strong>{day.getUTCDate()}</strong>
          {dayEvents.slice(0, 3).map(event => <span key={event.id} className="review-month-event">{event.title}</span>)}
          {dayEvents.length > 3 && <small>+{dayEvents.length - 3} sự kiện</small>}
        </button>;
      })() : <span key={`empty-${index}`} aria-hidden="true" />)}</div>
    </section>
    <aside className="review-panel review-month-agenda" aria-label="Lịch trong ngày đã chọn">
      <h2>Lịch trình ngày {new Date(`${selectedDay}T12:00:00Z`).toLocaleDateString('vi-VN', { timeZone: 'UTC' })}</h2>
      <p>{selectedEvents.length} sự kiện được lên lịch</p>
      {selectedEvents.some(event => event.conflictWarning && event.status === 'active') && <div className="review-agenda-warning"><AlertTriangle size={15} /> Có sự kiện trùng lịch trong ngày này.</div>}
      {selectedEvents.length === 0 ? <div className="review-agenda-empty"><CalendarDays size={20} /> Chưa có sự kiện trong ngày.</div> : selectedEvents.map(event => <button key={event.id} type="button" className="review-agenda-item" onClick={() => onSelectEvent(event)}>
        <span>{event.allDay ? 'Cả ngày' : event.timed ? vietnamDateTimeParts(event.timed.startsAt).time : 'Sự kiện'}</span>
        <strong>{event.title}</strong>
        {event.status === 'cancelled' && <small>Đã hủy</small>}
      </button>)}
    </aside>
  </div>;
}
