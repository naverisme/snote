import React, { useState } from 'react';
import { CheckSquare, Square, Calendar, Plus, Filter, Check, Clock, AlertTriangle } from 'lucide-react';

interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'normal' | 'low';
  assignee: string;
  checklist: { id: string; text: string; done: boolean }[];
  isCompleted: boolean;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Kiểm thử CSRF token và Header spoofing gate',
    dueDate: 'Hôm nay',
    priority: 'high',
    assignee: 'Nguyễn Văn Minh',
    isCompleted: false,
    checklist: [
      { id: 'c-1', text: 'Chạy HTTP Smoke 3 Rejection', done: true },
      { id: 'c-2', text: 'Kiểm tra CSRF mutative header 403', done: true },
      { id: 'c-3', text: 'Kiểm tra cookie s_note_session', done: false },
    ],
  },
  {
    id: 't-2',
    title: 'Đồng bộ hóa Token Stageshow trong theme.css',
    dueDate: 'Hôm nay',
    priority: 'normal',
    assignee: 'Trần Thị Mai',
    isCompleted: false,
    checklist: [
      { id: 'c-4', text: 'Loại bỏ hardcoded hex colors', done: true },
      { id: 'c-5', text: 'Xác minh WCAG AA contrast > 4.5:1', done: true },
    ],
  },
  {
    id: 't-3',
    title: 'Tối ưu hiệu ứng co dãn Sidebar 240ms cubic-bezier',
    dueDate: 'Ngày mai',
    priority: 'normal',
    assignee: 'Lê Hoàng Nam',
    isCompleted: false,
    checklist: [
      { id: 'c-6', text: 'will-change width containment', done: true },
      { id: 'c-7', text: 'white-space nowrap label text', done: true },
    ],
  },
  {
    id: 't-4',
    title: 'Đặc tả bàn giao trách nhiệm khi rời nhóm (STR-09)',
    dueDate: 'Tuần này',
    priority: 'low',
    assignee: 'Phạm Quỳnh Anh',
    isCompleted: true,
    checklist: [
      { id: 'c-8', text: 'Soạn thảo văn bản cảnh báo bàn giao', done: true },
    ],
  },
];

export const Tab09TasksList: React.FC = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'important'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleChecklist = (taskId: string, checkId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const updatedChecklist = t.checklist.map(c => c.id === checkId ? { ...c, done: !c.done } : c);
      const allDone = updatedChecklist.every(c => c.done);
      return {
        ...t,
        checklist: updatedChecklist,
        isCompleted: allDone,
      };
    }));
    showNotice('Đã cập nhật mục checklist (VT-07: Xác nhận audit trail)');
  };

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'today') return t.dueDate === 'Hôm nay';
    if (activeFilter === 'upcoming') return t.dueDate === 'Ngày mai' || t.dueDate === 'Tuần này';
    if (activeFilter === 'important') return t.priority === 'high';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {feedback && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs Bar (UXR-12 Segmented Filter) */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'today', 'upcoming', 'important'] as const).map(f => (
            <button
              key={f}
              type="button"
              className={`btn btn-sm ${activeFilter === f ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '12px', padding: '4px 12px' }}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' ? 'Tất cả việc' : f === 'today' ? 'Hôm nay' : f === 'upcoming' ? 'Sắp tới' : 'Quan trọng'}
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} />
          <span>Tạo công việc mới</span>
        </button>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.map(t => {
          const doneCount = t.checklist.filter(c => c.done).length;
          const totalCount = t.checklist.length;

          return (
            <div
              key={t.id}
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-divider)',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: t.priority === 'high' ? 'var(--text-primary)' : 'var(--surface-hover)', color: t.priority === 'high' ? 'var(--bg-app)' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {t.priority === 'high' ? 'Khẩn cấp' : t.priority === 'normal' ? 'Bình thường' : 'Thấp'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Hạn chót: <strong>{t.dueDate}</strong> • Người nhận: {t.assignee}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)', margin: 0, textDecoration: t.isCompleted ? 'line-through' : 'none' }}>
                    {t.title}
                  </h3>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Checklist: <strong>{doneCount}/{totalCount}</strong>
                </div>
              </div>

              {/* Checklist items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: '2px solid var(--border-divider)' }}>
                {t.checklist.map(item => (
                  <label
                    key={item.id}
                    onClick={() => handleToggleChecklist(t.id, item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: item.done ? 'var(--text-secondary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textDecoration: item.done ? 'line-through' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    {item.done ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
