import React, { useEffect, useRef, useState } from 'react';
import { X, Check, Lock, RotateCcw, Plus, Clock } from 'lucide-react';
import type { ChecklistItemViewModel, Task, WorkSessionViewModel } from './types';
import { VIETNAM_TIME_ZONE } from '../../shared/time-zone';

interface TaskDetailPanelProps {
  task: Task;
  checklistItems: ChecklistItemViewModel[];
  workSessions: WorkSessionViewModel[];
  onClose: () => void;
  onUpdateTask: (updates: Partial<Task>) => Promise<void>;
  onCompleteTask: () => Promise<void>;
  onReopenTask: () => Promise<void>;
  onReassignTask: (newAssigneeId: string) => Promise<void>;
  onAddChecklistItem: (text: string) => Promise<void>;
  onToggleChecklistItem: (itemId: string, done: boolean) => Promise<void>;
  onDeleteChecklistItem: (itemId: string) => Promise<void>;
  onAddWorkSession: (startAt: string, endAt: string) => Promise<void>;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  checklistItems,
  workSessions,
  onClose,
  onUpdateTask,
  onCompleteTask,
  onReopenTask,
  onReassignTask,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddWorkSession,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [showReassignInput, setShowReassignInput] = useState(false);
  const [newAssignee, setNewAssignee] = useState(task.assigneeId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus management on mount (QA-13)
  useEffect(() => {
    panelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const doneCount = checklistItems.filter(i => i.done).length;
  const checklistRatio = checklistItems.length === 0
    ? 'Chưa có checklist'
    : `${doneCount}/${checklistItems.length} (${Math.round((doneCount / checklistItems.length) * 100)}%)`;

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddChecklistItem(newChecklistText.trim());
      setNewChecklistText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionStart || !sessionEnd) return;
    setIsSubmitting(true);
    try {
      await onAddWorkSession(new Date(sessionStart).toISOString(), new Date(sessionEnd).toISOString());
      setSessionStart('');
      setSessionEnd('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!newAssignee.trim()) return;
    setIsSubmitting(true);
    try {
      await onReassignTask(newAssignee.trim());
      setShowReassignInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="task-detail-title"
      style={{
        width: '100%',
        maxWidth: '420px',
        borderLeft: '1px solid var(--hairline)',
        background: 'var(--surface-raised, #ffffff)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        outline: 'none',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Chi tiết công việc
          </span>
          <h2 id="task-detail-title" style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 0 0', color: 'var(--ink-title)' }}>
            {task.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--ink-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
          aria-label="Đóng bảng chi tiết"
        >
          <X size={16} />
        </button>
      </div>

      {/* Completion & Reopen Controls (TASK-08, TASK-09, QA-11) */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {task.status !== 'done' ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCompleteTask}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--success)',
              background: 'var(--success)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Check size={14} />
            <span>Xác nhận hoàn thành việc</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onReopenTask}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-ground, #f4f4f5)',
              color: 'var(--ink-body)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={13} />
            <span>Mở lại việc</span>
          </button>
        )}
        <span
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: task.status === 'done' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.08)',
            color: task.status === 'done' ? 'var(--success)' : 'var(--accent)',
            fontWeight: 500,
            border: '1px solid var(--hairline)',
          }}
        >
          {task.status === 'done' ? 'Đã hoàn thành' : 'Đang xử lý'}
        </span>
      </div>

      {/* Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '13px' }}>
        <span style={{ color: 'var(--ink-muted)' }}>Mức quan trọng:</span>
        <div>
          <select
            value={task.importance}
            onChange={e => onUpdateTask({ importance: e.target.value as 'high' | 'medium' | 'low' })}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body)',
            }}
          >
            <option value="high">Cao</option>
            <option value="medium">Vừa</option>
            <option value="low">Thấp</option>
          </select>
        </div>

        <span style={{ color: 'var(--ink-muted)' }}>Hạn chót:</span>
        <div>
          <span style={{ color: 'var(--ink-title)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} style={{ color: 'var(--ink-muted)' }} />
            <span>{task.dueAt ? new Date(task.dueAt).toLocaleString('vi-VN', { timeZone: VIETNAM_TIME_ZONE }) : 'Chưa đặt hạn'}</span>
          </span>
        </div>

        <span style={{ color: 'var(--ink-muted)' }}>Người phụ trách:</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--ink-title)', fontWeight: 500 }}>
              {task.assigneeId ?? 'Chưa phân công'}
            </span>
            <button
              type="button"
              onClick={() => setShowReassignInput(prev => !prev)}
              style={{ fontSize: '11px', color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            >
              [Giao lại]
            </button>
          </div>

          {showReassignInput && (
            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--surface-ground, #f4f4f5)', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--hairline)' }}>
              <input
                type="text"
                placeholder="ID người nhận mới"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  marginBottom: '6px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface-raised, #ffffff)',
                  color: 'var(--ink-body)',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleReassign}
                  style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: 'var(--accent)', color: 'var(--bg-app)', border: 'none', borderRadius: 'var(--radius-sm, 6px)', cursor: 'pointer' }}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setShowReassignInput(false)}
                  style={{ padding: '4px 10px', fontSize: '11px', background: 'var(--surface-raised, #ffffff)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-sm, 6px)', color: 'var(--ink-body)', cursor: 'pointer' }}
                >
                  Hủy
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '6px' }}>
                * Lưu ý: Buổi làm riêng của người cũ sẽ không bị chuyển giao (EC-18).
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: '4px 0' }} />

      {/* Checklist Section (TASK-08, TASK-15, EC-17) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-title)' }}>Checklist</span>
          <span style={{ fontSize: '12px', color: 'var(--ink-subtle)', fontWeight: 500 }}>{checklistRatio}</span>
        </div>
        <p role="status" style={{ margin: '0 0 10px', fontSize: '12px', color: 'var(--ink-muted)' }}>
          Checklist hiện chưa khả dụng. Mục mới chưa thể được lưu và đồng bộ.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {checklistItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--surface-ground, #f4f4f5)',
                border: '1px solid var(--hairline)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  disabled
                  checked={item.done}
                  onChange={e => onToggleChecklistItem(item.id, e.target.checked)}
                />
                <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--ink-muted)' : 'var(--ink-body)' }}>
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                disabled
                onClick={() => onDeleteChecklistItem(item.id)}
                style={{ border: 'none', background: 'transparent', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '2px 4px' }}
                aria-label="Xóa mục checklist"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            disabled
            placeholder="Thêm mục checklist..."
            value={newChecklistText}
            onChange={e => setNewChecklistText(e.target.value)}
            style={{ flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--hairline)', background: 'var(--surface-raised, #ffffff)', color: 'var(--ink-body)' }}
          />
          <button
            type="submit"
            disabled
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-ground, #f4f4f5)',
              color: 'var(--ink-muted)',
              cursor: 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={12} />
            <span>Thêm</span>
          </button>
        </form>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--hairline)', margin: '4px 0' }} />

      {/* Private Work Sessions (TASK-07, CAL-05, EC-15) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-title)' }}>
            Lịch làm riêng của tôi
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={11} />
            <span>Chỉ bạn nhìn thấy</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {workSessions.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
              Chưa có buổi làm riêng nào cho công việc này.
            </div>
          ) : (
            workSessions.map(sess => (
              <div
                key={sess.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--surface-ground, #f4f4f5)',
                  border: '1px solid var(--hairline)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span>
                    {new Date(sess.startAt).toLocaleString('vi-VN', { timeZone: VIETNAM_TIME_ZONE, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(sess.endAt).toLocaleTimeString('vi-VN', { timeZone: VIETNAM_TIME_ZONE, hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {sess.isLate && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                      Làm muộn
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddSession} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="datetime-local"
              value={sessionStart}
              onChange={e => setSessionStart(e.target.value)}
              style={{ flex: 1, padding: '6px', fontSize: '11px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--hairline)', background: 'var(--surface-raised, #ffffff)', color: 'var(--ink-body)' }}
            />
            <input
              type="datetime-local"
              value={sessionEnd}
              onChange={e => setSessionEnd(e.target.value)}
              style={{ flex: 1, padding: '6px', fontSize: '11px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--hairline)', background: 'var(--surface-raised, #ffffff)', color: 'var(--ink-body)' }}
            />
          </div>
          <button
            type="submit"
            disabled={!sessionStart || !sessionEnd || isSubmitting}
            style={{
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-ground, #f4f4f5)',
              color: 'var(--ink-title)',
              cursor: (!sessionStart || !sessionEnd || isSubmitting) ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={13} />
            <span>Đặt lịch làm việc riêng</span>
          </button>
        </form>
      </div>
    </div>
  );
};

