import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { StudyDateTimePicker } from '../../../components/common/StudyDateTimePicker';
import { api, ApiResponse } from '../../../services/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAppFilter } from '../../../contexts/AppFilterContext';
import { ScheduleEventType } from '@snote/shared';
import {
  Calendar,
  MapPin,
  Save,
  Trash2,
  Repeat
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
  eventToEdit?: any | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
  eventToEdit
}) => {
  const { subjects } = useAppFilter();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(15);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setSubjectId(eventToEdit.subjectId || '');
      setStartTime(eventToEdit.startTime ? new Date(eventToEdit.startTime).toISOString().slice(0, 16) : '');
      setEndTime(eventToEdit.endTime ? new Date(eventToEdit.endTime).toISOString().slice(0, 16) : '');
      setLocation(eventToEdit.location || '');
      setIsRecurring(Boolean(eventToEdit.isRecurring));
    } else {
      const base = defaultDate ? new Date(defaultDate) : new Date();
      const startD = new Date(base);
      if (!defaultDate) {
        startD.setHours(new Date().getHours() + 1, 0, 0, 0);
      } else {
        startD.setHours(7, 0, 0, 0);
      }
      const endD = new Date(startD.getTime() + 90 * 60 * 1000);

      const toLocalISO = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setStartTime(toLocalISO(startD));
      setEndTime(toLocalISO(endD));
      setTitle('');
      setLocation('');
      setSubjectId(subjects[0]?.id || '');
      setIsRecurring(false);
      setRepeatWeeks(15);
    }
  }, [defaultDate, subjects, isOpen, eventToEdit]);

  const handleDelete = async () => {
    if (!eventToEdit?.id) return;
    if (!window.confirm(`Bạn có chắc muốn xóa sự kiện "${eventToEdit.title}" không?`)) return;

    setLoading(true);
    try {
      await api.delete(`/schedule/${eventToEdit.id}`);
      showToast('Đã xóa sự kiện lịch trình', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa sự kiện', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên sự kiện', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (eventToEdit?.id) {
        await api.put(`/schedule/${eventToEdit.id}`, {
          title: title.trim(),
          subjectId: subjectId || undefined,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          location: location.trim() || undefined,
          isRecurring
        });
        showToast('Cập nhật sự kiện thành công!', 'success');
      } else {
        await api.post('/schedule', {
          title: title.trim(),
          subjectId: subjectId || undefined,
          eventType: ScheduleEventType.CLASS,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          location: location.trim() || undefined,
          isRecurring,
          repeatWeeks: isRecurring ? repeatWeeks : undefined
        });

        if (isRecurring && repeatWeeks > 1) {
          showToast(`Đã tạo lịch lặp lại cho ${repeatWeeks} tuần thành công!`, 'success');
        } else {
          showToast('Thêm sự kiện lịch trình thành công!', 'success');
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu lịch trình', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Lịch'}
      maxWidth="580px"
      icon={<Calendar size={20} />}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 1. Event Title */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Tên sự kiện / Tiết học *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="Ví dụ: Họp nhóm, Thi cuối kỳ, Tiết học Lập trình Web..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="snote-input"
            style={{ fontSize: '14px', padding: '10px 14px' }}
          />
        </div>

        {/* 2. Related Subject */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Môn học liên quan (Tùy chọn)
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="snote-select"
            style={{ fontSize: '13.5px', padding: '9px 12px' }}
          >
            <option value="">-- Không thuộc môn cụ thể --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code ? `[${sub.code}] ` : ''}{sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Start Time & End Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <StudyDateTimePicker
            value={startTime}
            onChange={setStartTime}
            label="Thời gian bắt đầu"
            placeholder="Chọn giờ bắt đầu..."
            required
            align="left"
          />

          <StudyDateTimePicker
            value={endTime}
            onChange={setEndTime}
            label="Thời gian kết thúc"
            placeholder="Chọn giờ kết thúc..."
            required
            align="right"
          />
        </div>

        {/* 4. Location */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Địa điểm / Phòng học / Link họp
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <MapPin size={16} />
            </span>
            <input
              type="text"
              placeholder="Ví dụ: Phòng 302-G2 hoặc meet.google.com/xyz..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="snote-input"
              style={{ paddingLeft: '38px', fontSize: '13.5px', padding: '9px 12px 9px 38px' }}
            />
          </div>
        </div>

        {/* 5. Recurring Option (Only on Create mode) */}
        {!eventToEdit && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Repeat size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span>Lặp lại hàng tuần cho cả Học kỳ</span>
                </span>
              </label>

              {isRecurring && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Trong</span>
                  <select
                    value={repeatWeeks}
                    onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                    className="snote-select"
                    style={{ fontSize: '12px', padding: '3px 8px', height: '28px', width: '90px' }}
                  >
                    <option value={5}>5 tuần</option>
                    <option value={10}>10 tuần</option>
                    <option value={15}>15 tuần</option>
                    <option value={18}>18 tuần</option>
                  </select>
                </div>
              )}
            </div>

            {isRecurring && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                💡 SNOTE sẽ tự động sinh lịch đều đặn vào ngày này hàng tuần trong {repeatWeeks} tuần tới.
              </div>
            )}
          </div>
        )}

        {/* 6. Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
          {eventToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-danger)', gap: '4px', padding: '8px 12px' }}
            >
              <Trash2 size={15} />
              <span>Xóa Sự Kiện</span>
            </button>
          ) : <div />}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '9px 18px' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ fontWeight: 700, padding: '9px 22px', gap: '6px' }}
            >
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : eventToEdit ? 'Lưu Thay Đổi' : 'Thêm Sự Kiện'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
