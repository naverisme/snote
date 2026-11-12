import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, X, Check, ShieldAlert, Info } from 'lucide-react';
import type { AssignmentInput, LatePolicySetting, WorkspaceGroup } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { vietnamLocalToIso } from '../../../shared/time-zone';

export interface AssignmentCreateModalProps {
  isOpen: boolean;
  classId: string;
  classTimeZone: string;
  availableGroups: WorkspaceGroup[];
  onClose: () => void;
  onSubmit: (input: AssignmentInput) => Promise<void>;
}

export const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  isOpen,
  classTimeZone,
  availableGroups,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [deadlineType, setDeadlineType] = useState<'none' | 'datetime' | 'date'>('datetime');
  const [deadlineDateTime, setDeadlineDateTime] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [lateFirst, setLateFirst] = useState<LatePolicySetting>('inherit');
  const [lateRevision, setLateRevision] = useState<LatePolicySetting>('inherit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reducedMotion = useReducedMotion();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSelectedGroupIds(availableGroups.map(g => g.id)); // Default: select all groups (ASG-01)
      setDeadlineDateTime('');
      setDeadlineDate('');
      setLateFirst('inherit');
      setLateRevision('inherit');
      setError(null);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen, availableGroups]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleGroup = (id: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const selectAllGroups = () => {
    setSelectedGroupIds(availableGroups.map(g => g.id));
  };

  const clearAllGroups = () => {
    setSelectedGroupIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài giao.');
      return;
    }
    if (selectedGroupIds.length === 0) {
      setError('Vui lòng chọn ít nhất một nhóm nhận bài.');
      return;
    }

    const input: AssignmentInput = {
      title: title.trim(),
      recipientWorkspaceIds: selectedGroupIds,
      description: description.trim() || undefined,
      lateFirst,
      lateRevision,
    };

    if (deadlineType === 'datetime' && deadlineDateTime) {
      input.deadline = vietnamLocalToIso(deadlineDateTime);
    } else if (deadlineType === 'date' && deadlineDate) {
      input.deadlineDate = {
        date: deadlineDate,
        timeZone: classTimeZone,
      };
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(input);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi tạo bài giao.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-assignment-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9, 9, 11, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        boxSizing: 'border-box',
        transition: reducedMotion ? 'none' : 'opacity 160ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface-overlay)',
          borderRadius: '14px', // Nested outer radius = 10px inner + 4px
          border: '1px solid var(--hairline)',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-overlay)',
          padding: '20px 24px', // Inset >= 12px
          color: 'var(--ink-body)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div>
            <h2
              id="modal-assignment-title"
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--ink-title)',
                margin: 0,
              }}
            >
              Tạo bài giao mới
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--ink-subtle)' }}>
              Phân công nhóm và cài đặt sau hạn
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng biểu mẫu"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--ink-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--surface-ground)';
              e.currentTarget.style.color = 'var(--ink-title)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--ink-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px 14px', // Inset >= 12px
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* CUXD-01: Tiêu đề bắt buộc */}
          <div>
            <label
              htmlFor="assignment-title-input"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ink-title)',
                marginBottom: '6px',
              }}
            >
              Tiêu đề bài giao <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="assignment-title-input"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Đồ án Giữa kỳ — Thiết kế kiến trúc SNOTE v2"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--ink-title)',
                backgroundColor: 'var(--surface-raised)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            />
          </div>

          {/* CUXD-01: Mô tả tùy chọn */}
          <div>
            <label
              htmlFor="assignment-desc-input"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--ink-title)',
                marginBottom: '6px',
              }}
            >
              Mô tả bài giao <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>(tùy chọn)</span>
            </label>
            <textarea
              id="assignment-desc-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Nội dung yêu cầu, mục tiêu học tập, tiêu chí bàn giao..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--ink-body)',
                backgroundColor: 'var(--surface-raised)',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            />
          </div>

          {/* CUXD-01: Nhóm nhận bài bắt buộc */}
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--hairline)',
              backgroundColor: 'var(--surface-ground)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} style={{ color: 'var(--ink-subtle)' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-title)' }}>
                  Nhóm nhận bài <span style={{ color: 'var(--danger)' }}>*</span>
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--hairline)',
                    color: 'var(--ink-subtle)',
                  }}
                >
                  Đã chọn {selectedGroupIds.length}/{availableGroups.length} nhóm
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={selectAllGroups}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    fontWeight: 500,
                  }}
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={clearAllGroups}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-muted)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {availableGroups.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                Chưa có nhóm nào trong lớp học. Vui lòng tạo nhóm trước khi giao bài.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--hairline)',
                  backgroundColor: 'var(--surface-raised)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {availableGroups.map(group => {
                  const isChecked = selectedGroupIds.includes(group.id);
                  return (
                    <label
                      key={group.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: isChecked ? 'var(--surface-ground)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: isChecked ? 'var(--ink-title)' : 'var(--ink-body)',
                        fontWeight: isChecked ? 500 : 400,
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGroup(group.id)}
                          style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                        <span>{group.name}</span>
                      </div>
                      {group.memberCount !== undefined && (
                        <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                          {group.memberCount} thành viên
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* CUXD-01: Hạn nộp tùy chọn */}
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--hairline)',
              backgroundColor: 'var(--surface-ground)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Calendar size={15} style={{ color: 'var(--ink-subtle)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-title)' }}>
                Thời hạn nộp bài (tùy chọn)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="none"
                  checked={deadlineType === 'none'}
                  onChange={() => setDeadlineType('none')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Không giới hạn thời gian</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="datetime"
                  checked={deadlineType === 'datetime'}
                  onChange={() => setDeadlineType('datetime')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Ngày và giờ cụ thể</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="date"
                  checked={deadlineType === 'date'}
                  onChange={() => setDeadlineType('date')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>Chỉ ngày (cuối ngày lớp học)</span>
              </label>
            </div>

            {deadlineType === 'datetime' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} style={{ color: 'var(--ink-muted)' }} />
                <input
                  type="datetime-local"
                  value={deadlineDateTime}
                  onChange={e => setDeadlineDateTime(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--ink-title)',
                    backgroundColor: 'var(--surface-raised)',
                  }}
                />
              </div>
            )}

            {deadlineType === 'date' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--ink-title)',
                    backgroundColor: 'var(--surface-raised)',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
                  Hết hạn lúc 23:59:59 của ngày này
                </span>
              </div>
            )}
          </div>

          {/* CUXD-02: 2 điều khiển độc lập sau hạn: Nộp lần đầu & Sửa bản đã nộp */}
          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--hairline)',
              backgroundColor: 'var(--surface-ground)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-title)' }}>
                Cài đặt chính sách sau hạn
              </span>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={12} />
                <span>Giá trị tường minh trên bài giao được ưu tiên so với cấu hình mặc định của lớp.</span>
              </div>
            </div>

            {/* Điều khiển 1: Nộp lần đầu sau hạn */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--hairline)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-title)', marginBottom: '6px' }}>
                Nộp lần đầu sau hạn (áp dụng cho nhóm chưa có bản nộp nào):
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateFirst"
                    value="inherit"
                    checked={lateFirst === 'inherit'}
                    onChange={() => setLateFirst('inherit')}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span>Kế thừa lớp (mặc định)</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateFirst"
                    value="allow"
                    checked={lateFirst === 'allow'}
                    onChange={() => setLateFirst('allow')}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Cho phép nộp muộn</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateFirst"
                    value="lock"
                    checked={lateFirst === 'lock'}
                    onChange={() => setLateFirst('lock')}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Khóa sau hạn</span>
                </label>
              </div>
            </div>

            {/* Điều khiển 2: Sửa bản đã nộp sau hạn */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--hairline)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-title)', marginBottom: '6px' }}>
                Sửa bản đã nộp sau hạn (áp dụng cho nhóm đã có bản nộp trước đó):
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateRevision"
                    value="inherit"
                    checked={lateRevision === 'inherit'}
                    onChange={() => setLateRevision('inherit')}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span>Kế thừa lớp (mặc định)</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateRevision"
                    value="allow"
                    checked={lateRevision === 'allow'}
                    onChange={() => setLateRevision('allow')}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Cho phép sửa sau hạn</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="lateRevision"
                    value="lock"
                    checked={lateRevision === 'lock'}
                    onChange={() => setLateRevision('lock')}
                    style={{ accentColor: 'var(--danger)', fontWeight: 500 }}
                  />
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Khóa sửa sau hạn</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-raised)',
                color: 'var(--ink-subtle)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: submitting ? 'var(--ink-faint)' : 'var(--accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-raised)',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <Check size={15} />
              <span>{submitting ? 'Đang tạo...' : 'Tạo bài giao'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
