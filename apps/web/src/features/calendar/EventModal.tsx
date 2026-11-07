import React, { useEffect, useRef, useState } from 'react';
import type { CalendarEventViewModel, EventInput, Scope } from './types';

interface EventModalProps {
  event?: CalendarEventViewModel;
  onClose: () => void;
  onSave: (input: EventInput) => Promise<void>;
  onCancelEvent?: (eventId: string) => Promise<void>;
  defaultTimeZone?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onSave,
  onCancelEvent,
  defaultTimeZone = 'Asia/Ho_Chi_Minh',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(event?.title ?? '');
  const [scopeType, setScopeType] = useState<Scope['type']>(event?.scope.type ?? 'workspace');
  const [scopeId, setScopeId] = useState<string>(event?.scope.id ?? 'ws-team-alpha');
  const [isAllDay, setIsAllDay] = useState<boolean>(Boolean(event?.allDay));
  const [startDate, setStartDate] = useState(event?.allDay?.startDate ?? '2026-11-10');
  const [endDateExclusive, setEndDateExclusive] = useState(event?.allDay?.endDateExclusive ?? '2026-11-11');
  const [startsAt, setStartsAt] = useState(event?.timed?.startsAt ? event.timed.startsAt.slice(0, 16) : '2026-11-08T09:00');
  const [endsAt, setEndsAt] = useState(event?.timed?.endsAt ? event.timed.endsAt.slice(0, 16) : '2026-11-08T10:30');
  const [audience, setAudience] = useState<string>(event?.audience ? event.audience.join(', ') : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape & trap focus
  useEffect(() => {
    modalRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề sự kiện');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const scope: Scope = { type: scopeType, id: scopeType === 'private' ? undefined : scopeId };
      const audienceList = audience.split(',').map(s => s.trim()).filter(Boolean);

      let input: EventInput;
      if (isAllDay) {
        if (startDate >= endDateExclusive) {
          setError('Ngày kết thúc loại trừ phải sau ngày bắt đầu');
          setIsSubmitting(false);
          return;
        }
        input = {
          title: title.trim(),
          scope,
          allDay: { startDate, endDateExclusive, timeZone: defaultTimeZone },
          audience: audienceList.length > 0 ? audienceList : undefined,
        };
      } else {
        const startIso = new Date(startsAt).toISOString();
        const endIso = new Date(endsAt).toISOString();
        if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
          setError('Thời điểm kết thúc phải sau thời điểm bắt đầu');
          setIsSubmitting(false);
          return;
        }
        input = {
          title: title.trim(),
          scope,
          timed: { startsAt: startIso, endsAt: endIso },
          audience: audienceList.length > 0 ? audienceList : undefined,
        };
      }

      await onSave(input);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi lưu sự kiện');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = async () => {
    if (!event || !onCancelEvent) return;
    if (!confirm('Bạn có chắc chắn muốn hủy sự kiện này? Sự kiện sẽ chuyển sang trạng thái "Đã hủy" và lưu vết audit.')) return;
    setIsSubmitting(true);
    try {
      await onCancelEvent(event.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể hủy sự kiện');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="event-modal-title"
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 id="event-modal-title" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#24292f' }}>
            {event ? 'Chi tiết sự kiện' : 'Tạo sự kiện mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#57606a' }}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: '#ffebe9', color: '#cf222e', borderRadius: '6px', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
              Tiêu đề sự kiện *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                Phạm vi
              </label>
              <select
                value={scopeType}
                onChange={e => setScopeType(e.target.value as Scope['type'])}
                style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
              >
                <option value="workspace">Workspace nhóm</option>
                <option value="class">Lớp học</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            {scopeType !== 'private' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                  ID Phạm vi
                </label>
                <input
                  type="text"
                  value={scopeId}
                  onChange={e => setScopeId(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>

          {/* All-Day vs Timed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="allday-chk"
              checked={isAllDay}
              onChange={e => setIsAllDay(e.target.checked)}
            />
            <label htmlFor="allday-chk" style={{ fontSize: '13px', color: '#24292f', cursor: 'pointer' }}>
              Sự kiện cả ngày (Giữ ngày dân sự không phụ thuộc múi giờ, QA-10)
            </label>
          </div>

          {isAllDay ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                  Ngày kết thúc (Loại trừ)
                </label>
                <input
                  type="date"
                  value={endDateExclusive}
                  onChange={e => setEndDateExclusive(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                  Bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                  Kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {scopeType === 'class' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#24292f', marginBottom: '4px' }}>
                Đối tượng nhận (Phân tách bằng dấu phẩy; để trống cho cả lớp)
              </label>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="ws-group-1, ws-group-2"
                style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            {event && event.status === 'active' && onCancelEvent ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelClick}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid #ff8182',
                  background: '#ffebe9',
                  color: '#cf222e',
                  cursor: 'pointer',
                }}
              >
                ✕ Hủy sự kiện
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '6px', border: '1px solid #1f883d', background: '#1f883d', color: '#fff', cursor: 'pointer' }}
              >
                Lưu
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
