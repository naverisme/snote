import React, { useState, useEffect, useRef } from 'react';
import type { AssignmentInput, LatePolicySetting, WorkspaceGroup } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface AssignmentCreateModalProps {
  isOpen: boolean;
  classId: string;
  availableGroups: WorkspaceGroup[];
  onClose: () => void;
  onSubmit: (input: AssignmentInput) => Promise<void>;
}

export const AssignmentCreateModal: React.FC<AssignmentCreateModalProps> = ({
  isOpen,
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
  const [deadlineZone, setDeadlineZone] = useState('Asia/Ho_Chi_Minh');
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
      setSelectedGroupIds(availableGroups.map(g => g.id)); // Default: select all groups
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề bài giao là bắt buộc.');
      return;
    }
    if (selectedGroupIds.length === 0) {
      setError('Cần chọn ít nhất một nhóm nhận bài.');
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
      input.deadline = new Date(deadlineDateTime).toISOString();
    } else if (deadlineType === 'date' && deadlineDate) {
      input.deadlineDate = {
        date: deadlineDate,
        timeZone: deadlineZone,
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
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        transition: reducedMotion ? 'none' : 'opacity 180ms ease',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#111827',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="modal-title" style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Tạo bài giao mới
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng biểu mẫu"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="assignment-title" style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Tiêu đề bài giao <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="assignment-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Đồ án giữa kỳ"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="assignment-desc" style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Mô tả bài giao (tùy chọn)
            </label>
            <textarea
              id="assignment-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Nội dung yêu cầu, mục tiêu..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Group recipient selection (CUXD-01) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>
                Nhóm nhận bài <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <button
                type="button"
                onClick={selectAllGroups}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Chọn tất cả nhóm
              </button>
            </div>
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                maxHeight: '120px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {availableGroups.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6b7280', padding: '4px' }}>Lớp chưa có nhóm nào</div>
              ) : (
                availableGroups.map(group => (
                  <label
                    key={group.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Deadline controls (ASG-07) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Hạn nộp
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="datetime"
                  checked={deadlineType === 'datetime'}
                  onChange={() => setDeadlineType('datetime')}
                />
                Ngày kèm giờ
              </label>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="date"
                  checked={deadlineType === 'date'}
                  onChange={() => setDeadlineType('date')}
                />
                Chỉ ngày (cuối ngày)
              </label>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="deadlineType"
                  value="none"
                  checked={deadlineType === 'none'}
                  onChange={() => setDeadlineType('none')}
                />
                Không đặt hạn
              </label>
            </div>

            {deadlineType === 'datetime' && (
              <input
                type="datetime-local"
                value={deadlineDateTime}
                onChange={e => setDeadlineDateTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {deadlineType === 'date' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                <select
                  value={deadlineZone}
                  onChange={e => setDeadlineZone(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            )}
          </div>

          {/* Late policy overrides (CUXD-02, ASG-05/06/15) */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              Cài đặt sau hạn (Quyền độc lập)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label htmlFor="late-first-select" style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
                  Nộp lần đầu sau hạn:
                </label>
                <select
                  id="late-first-select"
                  value={lateFirst}
                  onChange={e => setLateFirst(e.target.value as LatePolicySetting)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="inherit">Kế thừa lớp</option>
                  <option value="allow">Cho phép</option>
                  <option value="lock">Khóa</option>
                </select>
              </div>

              <div>
                <label htmlFor="late-revision-select" style={{ display: 'block', fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
                  Sửa bản đã nộp sau hạn:
                </label>
                <select
                  id="late-revision-select"
                  value={lateRevision}
                  onChange={e => setLateRevision(e.target.value as LatePolicySetting)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="inherit">Kế thừa lớp</option>
                  <option value="allow">Cho phép</option>
                  <option value="lock">Khóa</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                background: '#fff',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || selectedGroupIds.length === 0}
              style={{
                padding: '8px 18px',
                border: 'none',
                background: submitting || !title.trim() || selectedGroupIds.length === 0 ? '#93c5fd' : '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: submitting || !title.trim() || selectedGroupIds.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Đang tạo...' : 'Giao bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
