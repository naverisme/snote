import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { CalendarEventViewModel, EventInput, Scope } from './types';

interface EventModalProps {
  event?: CalendarEventViewModel;
  onClose: () => void;
  onSave: (input: EventInput) => Promise<void>;
  onCancelEvent?: (eventId: string) => Promise<void>;
  defaultTimeZone?: string;
  defaultScopeType?: Scope['type'];
  defaultScopeId?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onSave,
  onCancelEvent,
  defaultTimeZone = 'Asia/Ho_Chi_Minh',
  defaultScopeType = 'workspace',
  defaultScopeId = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(event?.title ?? '');
  const [scopeType, setScopeType] = useState<Scope['type']>(
    event?.scope.type ?? defaultScopeType,
  );
  const [scopeId, setScopeId] = useState<string>(
    event?.scope.id ?? defaultScopeId,
  );

  // Dynamic realistic initial dates without static fixtures
  const initialDates = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const start = new Date(now);
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmtDt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return {
      todayStr,
      tomorrowStr,
      startsAt: fmtDt(start),
      endsAt: fmtDt(end),
    };
  }, []);

  const [isAllDay, setIsAllDay] = useState<boolean>(Boolean(event?.allDay));
  const [startDate, setStartDate] = useState(
    event?.allDay?.startDate ?? initialDates.todayStr,
  );
  const [endDateExclusive, setEndDateExclusive] = useState(
    event?.allDay?.endDateExclusive ?? initialDates.tomorrowStr,
  );
  const [startsAt, setStartsAt] = useState(
    event?.timed?.startsAt
      ? event.timed.startsAt.slice(0, 16)
      : initialDates.startsAt,
  );
  const [endsAt, setEndsAt] = useState(
    event?.timed?.endsAt
      ? event.timed.endsAt.slice(0, 16)
      : initialDates.endsAt,
  );
  const [audience, setAudience] = useState<string>(
    event?.audience ? event.audience.join(', ') : '',
  );
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

    if (scopeType !== 'private' && !scopeId.trim()) {
      setError('Vui lòng chọn hoặc nhập ID phạm vi (workspace hoặc lớp học)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const scope: Scope = {
        type: scopeType,
        id: scopeType === 'private' ? undefined : scopeId.trim(),
      };
      const audienceList = audience
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

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
    if (
      !confirm(
        'Bạn có chắc chắn muốn hủy sự kiện này? Sự kiện sẽ chuyển sang trạng thái "Đã hủy" và lưu vết audit.',
      )
    )
      return;
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
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        style={{
          background: 'var(--surface-overlay, #ffffff)',
          borderRadius: 'var(--radius-md, 10px)',
          border: '1px solid var(--hairline)',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: 'var(--shadow-overlay)',
          outline: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2
            id="event-modal-title"
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ink-title)',
            }}
          >
            {event ? 'Chi tiết sự kiện' : 'Tạo sự kiện mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              color: 'var(--ink-muted)',
              padding: '4px',
              borderRadius: 'var(--radius-sm, 6px)',
            }}
            aria-label="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              background: '#fff4f2',
              color: '#9f2d20',
              border: '1px solid #f2cbc5',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '12px',
              marginBottom: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div>
            <label
              htmlFor="event-title-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-body)',
                marginBottom: '6px',
              }}
            >
              Tiêu đề sự kiện *
            </label>
            <input
              id="event-title-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--hairline)',
                background: 'var(--surface-raised, #ffffff)',
                color: 'var(--ink-title)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div>
              <label
                htmlFor="event-scope-select"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink-body)',
                  marginBottom: '6px',
                }}
              >
                Phạm vi
              </label>
              <select
                id="event-scope-select"
                value={scopeType}
                onChange={e => setScopeType(e.target.value as Scope['type'])}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface-raised, #ffffff)',
                  color: 'var(--ink-body)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="workspace">Workspace nhóm</option>
                <option value="class">Lớp học</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            {scopeType !== 'private' && (
              <div>
                <label
                  htmlFor="event-scope-id"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  ID Phạm vi
                </label>
                <input
                  id="event-scope-id"
                  type="text"
                  value={scopeId}
                  onChange={e => setScopeId(e.target.value)}
                  placeholder="ID workspace..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                  }}
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
              style={{ cursor: 'pointer' }}
            />
            <label
              htmlFor="allday-chk"
              style={{
                fontSize: '12px',
                color: 'var(--ink-body)',
                cursor: 'pointer',
              }}
            >
              Sự kiện cả ngày (Giữ ngày dân sự không phụ thuộc múi giờ, QA-10)
            </label>
          </div>

          {isAllDay ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <label
                  htmlFor="event-start-date"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  Ngày bắt đầu
                </label>
                <input
                  id="event-start-date"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="event-end-date"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  Ngày kết thúc (Loại trừ)
                </label>
                <input
                  id="event-end-date"
                  type="date"
                  value={endDateExclusive}
                  onChange={e => setEndDateExclusive(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div>
                <label
                  htmlFor="event-starts-at"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  Bắt đầu
                </label>
                <input
                  id="event-starts-at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={e => setStartsAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="event-ends-at"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-body)',
                    marginBottom: '6px',
                  }}
                >
                  Kết thúc
                </label>
                <input
                  id="event-ends-at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={e => setEndsAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--hairline)',
                    background: 'var(--surface-raised, #ffffff)',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {scopeType === 'class' && (
            <div>
              <label
                htmlFor="event-audience"
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink-body)',
                  marginBottom: '6px',
                }}
              >
                Đối tượng nhận (Phân tách bằng dấu phẩy; để trống cho cả lớp)
              </label>
              <input
                id="event-audience"
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="ws-group-1, ws-group-2"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface-raised, #ffffff)',
                  color: 'var(--ink-body)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            {event && event.status === 'active' && onCancelEvent ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelClick}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={13} />
                <span>Hủy sự kiện</span>
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface-raised, #ffffff)',
                  color: 'var(--ink-body)',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--accent)',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-raised)',
                }}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

