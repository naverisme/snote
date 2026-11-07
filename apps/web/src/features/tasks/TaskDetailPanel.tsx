import React, { useEffect, useRef, useState } from 'react';
import type { ChecklistItemViewModel, Task, WorkSessionViewModel } from './types';

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
        borderLeft: '1px solid #d0d7de',
        background: '#fff',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        outline: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#57606a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Chi tiết công việc
          </span>
          <h2 id="task-detail-title" style={{ fontSize: '18px', fontWeight: 600, margin: '4px 0 0 0', color: '#24292f' }}>
            {task.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '18px',
            color: '#57606a',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Đóng bảng chi tiết"
        >
          ✕
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
              borderRadius: '6px',
              border: '1px solid #1a7f37',
              background: '#1f883d',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            ✓ Xác nhận hoàn thành việc
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
              borderRadius: '6px',
              border: '1px solid #d0d7de',
              background: '#f6f8fa',
              color: '#24292f',
              cursor: 'pointer',
            }}
          >
            ↺ Mở lại việc
          </button>
        )}
        <span
          style={{
            fontSize: '12px',
            padding: '4px 10px',
            borderRadius: '12px',
            background: task.status === 'done' ? '#dafbe1' : '#ddf4ff',
            color: task.status === 'done' ? '#1a7f37' : '#0969da',
            fontWeight: 500,
          }}
        >
          {task.status === 'done' ? 'Đã hoàn thành' : 'Đang xử lý'}
        </span>
      </div>

      {/* Attributes */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '13px' }}>
        <span style={{ color: '#57606a' }}>Mức quan trọng:</span>
        <div>
          <select
            value={task.importance}
            onChange={e => onUpdateTask({ importance: e.target.value as 'high' | 'medium' | 'low' })}
            style={{ padding: '3px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d0d7de' }}
          >
            <option value="high">Cao</option>
            <option value="medium">Vừa</option>
            <option value="low">Thấp</option>
          </select>
        </div>

        <span style={{ color: '#57606a' }}>Hạn chót:</span>
        <div>
          <span style={{ color: '#24292f', fontWeight: 500 }}>
            {task.dueAt ? new Date(task.dueAt).toLocaleString('vi-VN') : 'Chưa đặt hạn'}
          </span>
        </div>

        <span style={{ color: '#57606a' }}>Người phụ trách:</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#24292f', fontWeight: 500 }}>
              {task.assigneeId ?? 'Chưa phân công'}
            </span>
            <button
              type="button"
              onClick={() => setShowReassignInput(prev => !prev)}
              style={{ fontSize: '11px', color: '#0969da', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
            >
              [Giao lại]
            </button>
          </div>

          {showReassignInput && (
            <div style={{ marginTop: '8px', padding: '8px', background: '#f6f8fa', borderRadius: '6px', border: '1px solid #d0d7de' }}>
              <input
                type="text"
                placeholder="ID người nhận mới"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                style={{ width: '100%', padding: '4px 6px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '6px' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleReassign}
                  style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 600, background: '#0969da', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setShowReassignInput(false)}
                  style={{ padding: '3px 8px', fontSize: '11px', background: '#fff', border: '1px solid #d0d7de', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#57606a', marginTop: '6px' }}>
                * Lưu ý: Buổi làm riêng của người cũ sẽ không bị chuyển giao (EC-18).
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eaeef2', margin: '4px 0' }} />

      {/* Checklist Section (TASK-08, TASK-15, EC-17) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#24292f' }}>Checklist</span>
          <span style={{ fontSize: '12px', color: '#57606a', fontWeight: 500 }}>{checklistRatio}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {checklistItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                background: '#f6f8fa',
                border: '1px solid #eaeef2',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={e => onToggleChecklistItem(item.id, e.target.checked)}
                />
                <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#57606a' : '#24292f' }}>
                  {item.text}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onDeleteChecklistItem(item.id)}
                style={{ border: 'none', background: 'transparent', color: '#cf222e', fontSize: '12px', cursor: 'pointer', padding: '2px 4px' }}
                aria-label="Xóa mục checklist"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Thêm mục checklist..."
            value={newChecklistText}
            onChange={e => setNewChecklistText(e.target.value)}
            style={{ flex: 1, padding: '5px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #d0d7de' }}
          />
          <button
            type="submit"
            disabled={!newChecklistText.trim() || isSubmitting}
            style={{ padding: '5px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: '1px solid #d0d7de', background: '#f6f8fa', cursor: 'pointer' }}
          >
            + Thêm
          </button>
        </form>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eaeef2', margin: '4px 0' }} />

      {/* Private Work Sessions (TASK-07, CAL-05, EC-15) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#24292f' }}>
            Lịch làm riêng của tôi
          </span>
          <span style={{ fontSize: '11px', color: '#0969da' }}>🔒 Chỉ bạn nhìn thấy</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {workSessions.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#57606a', fontStyle: 'italic' }}>
              Chưa có buổi làm riêng nào cho công việc này.
            </div>
          ) : (
            workSessions.map(sess => (
              <div
                key={sess.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#f6f8fa',
                  border: '1px solid #d0d7de',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span>
                    {new Date(sess.startAt).toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(sess.endAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {sess.isLate && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', background: '#ffebe9', color: '#cf222e', border: '1px solid #ff8182', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
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
              style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d0d7de' }}
            />
            <input
              type="datetime-local"
              value={sessionEnd}
              onChange={e => setSessionEnd(e.target.value)}
              style={{ flex: 1, padding: '4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #d0d7de' }}
            />
          </div>
          <button
            type="submit"
            disabled={!sessionStart || !sessionEnd || isSubmitting}
            style={{
              padding: '5px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '4px',
              border: '1px solid #d0d7de',
              background: '#f6f8fa',
              cursor: 'pointer',
            }}
          >
            + Đặt lịch làm việc riêng
          </button>
        </form>
      </div>
    </div>
  );
};
