import React, { useState } from 'react';
import {
  Archive,
  Trash2,
  CheckCircle2,
  CheckSquare,
  Clock,
  Plus,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import type { ChecklistItemViewModel, Task } from './types';
import { VIETNAM_TIME_ZONE, vietnamDateTimeParts } from '../../shared/time-zone';

interface TaskListViewProps {
  tasks: Task[];
  checklistItems: Record<string, ChecklistItemViewModel[]>;
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  onBulkArchive: (items: { id: string; version: number }[]) => Promise<void>;
  onBulkTrash: (items: { id: string; version: number }[]) => Promise<void>;
  onToggleTaskStatus?: (taskId: string, currentStatus: string) => Promise<void>;
  onCreateTaskClick?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  checklistItems,
  onSelectTask,
  selectedTaskId,
  onBulkArchive,
  onBulkTrash,
  onToggleTaskStatus,
  onCreateTaskClick,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<'all' | 'today' | 'overdue' | 'high' | 'done' | 'unscheduled'>('all');
  const today = vietnamDateTimeParts(new Date()).date;
  const doneCount = tasks.filter(task => task.status === 'done').length;
  const dueCount = tasks.filter(task => task.status !== 'done' && task.dueAt && vietnamDateTimeParts(task.dueAt).date === today).length;
  const overdueCount = tasks.filter(task => task.status !== 'done' && task.dueAt && vietnamDateTimeParts(task.dueAt).date < today).length;
  const highCount = tasks.filter(task => task.importance === 'high' && task.status !== 'done').length;
  const checklist = Object.values(checklistItems).flat();
  const checklistDone = checklist.filter(item => item.done).length;
  const filterCounts = {
    all: tasks.length,
    today: dueCount,
    overdue: overdueCount,
    high: highCount,
    done: doneCount,
    unscheduled: tasks.filter(task => !task.dueAt).length,
  };
  const visibleTasks = tasks.filter(task => {
    const dueDate = task.dueAt ? vietnamDateTimeParts(task.dueAt).date : null;
    if (listFilter === 'today') return task.status !== 'done' && dueDate === today;
    if (listFilter === 'overdue') return task.status !== 'done' && dueDate !== null && dueDate < today;
    if (listFilter === 'high') return task.status !== 'done' && task.importance === 'high';
    if (listFilter === 'done') return task.status === 'done';
    if (listFilter === 'unscheduled') return !task.dueAt;
    return true;
  });

  const toggleSelect = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  };

  const getChecklistSummary = (taskId: string) => {
    const items = checklistItems[taskId];
    if (!items || items.length === 0) {
      return { text: 'Chưa có checklist', percentage: 0 };
    }
    const doneCount = items.filter(i => i.done).length;
    const pct = Math.round((doneCount / items.length) * 100);
    return { text: `${doneCount}/${items.length} (${pct}%)`, percentage: pct };
  };

  const handleBulkAction = async (action: 'archive' | 'trash') => {
    const selectedTasks = tasks.filter(t => selectedIds.has(t.id));
    if (selectedTasks.length === 0) return;
    const items = selectedTasks.map(t => ({ id: t.id, version: t.version }));

    setIsProcessing(true);
    try {
      if (action === 'archive') {
        await onBulkArchive(items);
      } else {
        await onBulkTrash(items);
      }
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckboxClick = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!onToggleTaskStatus) return;

    setBouncingId(task.id);
    setTimeout(() => {
      setBouncingId(null);
    }, 120);

    await onToggleTaskStatus(task.id, task.status);
  };

  if (tasks.length === 0) {
    return (
      <div
        style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md, 10px)',
          background: 'var(--surface-raised, #ffffff)',
          boxShadow: 'var(--shadow-raised)',
          padding: '48px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--surface-ground, #f4f4f5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--ink-muted)',
          }}
        >
          <CheckSquare size={22} />
        </div>

        <h2
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--ink-title)',
            marginBottom: '4px',
          }}
        >
          Chưa có công việc nào
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--ink-subtle)',
            maxWidth: '380px',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Bắt đầu lên danh sách công việc và sắp xếp mức độ ưu tiên để quản lý tiến độ hiệu quả.
        </p>

        {onCreateTaskClick && (
          <button
            type="button"
            onClick={onCreateTaskClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--accent)',
              color: 'var(--bg-app)',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid var(--accent)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-raised)',
            }}
          >
            <Plus size={15} />
            <span>Tạo công việc đầu tiên</span>
            <ArrowRight size={14} style={{ opacity: 0.8 }} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="review-screen task-list-screen">
      <div className="review-hero">
        <div><h1>Công việc & Tiêu chí kiểm tra</h1><p>Theo dõi danh sách công việc và tiến độ checklist trong phạm vi đang mở.</p></div>
        {onCreateTaskClick && <button type="button" className="btn btn-primary" onClick={onCreateTaskClick}><Plus size={15} /> Thêm công việc</button>}
      </div>
      <div className="review-stats" aria-label="Tổng quan công việc">
        <div><span>Tổng công việc</span><strong>{tasks.length}</strong><small>{doneCount} đã xong</small></div>
        <div><span>Hôm nay & quá hạn</span><strong>{dueCount + overdueCount}</strong><small>{overdueCount} quá hạn</small></div>
        <div><span>Ưu tiên cao</span><strong>{highCount}</strong><small>việc chưa xong</small></div>
        <div><span>Tiến độ kiểm tra</span><strong>{checklist.length ? `${Math.round(checklistDone / checklist.length * 100)}%` : '—'}</strong><small>{checklistDone}/{checklist.length} mục</small></div>
      </div>
      <div className="review-toolbar task-list-toolbar"><div className="review-filters" role="group" aria-label="Lọc danh sách công việc">{(['all', 'today', 'overdue', 'high', 'done', 'unscheduled'] as const).map(option => <button key={option} type="button" className={listFilter === option ? 'active' : ''} onClick={() => setListFilter(option)}>{{ all: 'Tất cả việc', today: 'Hôm nay', overdue: 'Quá hạn', high: 'Quan trọng', done: 'Đã hoàn thành', unscheduled: 'Chưa có mốc' }[option]} <span>{filterCounts[option]}</span></button>)}</div></div>
      {/* Scoped Checkbox Micro-Interaction Pop Keyframes (scale 1.15x -> 1.0x in 120ms) */}
      <style>{`
        @keyframes checkbox-pop {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.0); }
        }
        .checkbox-bouncing {
          animation: checkbox-pop 120ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .checkbox-bouncing {
            animation: none !important;
          }
        }
      `}</style>

      {/* Bulk Action Bar (UXR-14) */}
      {selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            Đã chọn {selectedIds.size} công việc
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleBulkAction('archive')}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--hairline)',
                background: 'var(--surface-raised, #ffffff)',
                color: 'var(--ink-body)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Archive size={13} style={{ color: 'var(--ink-muted)' }} />
              <span>Lưu trữ hàng loạt</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleBulkAction('trash')}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--danger)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={13} />
              <span>Xóa hàng loạt</span>
            </button>
          </div>
        </div>
      )}

      {/* Select All Toggle Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={tasks.length > 0 && selectedIds.size === tasks.length}
            onChange={toggleSelectAll}
            aria-label="Chọn tất cả công việc"
            style={{ cursor: 'pointer' }}
          />
          <span>Chọn tất cả ({tasks.length})</span>
        </div>
        <span>Hiển thị {visibleTasks.length}/{tasks.length} công việc</span>
      </div>

      {/* Task Rows Stack (Recipe 1 Stageshow Card Pattern) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibleTasks.length === 0 && <div className="review-panel review-empty">Không có công việc khớp bộ lọc.</div>}
        {visibleTasks.map(task => {
          const isSelectedRow = task.id === selectedTaskId;
          const isChecked = selectedIds.has(task.id);
          const chk = getChecklistSummary(task.id);
          const isDone = task.status === 'done';
          const isBouncing = bouncingId === task.id;

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTask(task);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px', // Inset >= 12px (Stageshow Standard)
                borderRadius: 'var(--radius-md, 10px)',
                border: isSelectedRow
                  ? '1px solid var(--accent)'
                  : isChecked
                  ? '1px solid rgba(37, 99, 235, 0.4)'
                  : '1px solid var(--hairline)', // Hairline 1px (Stageshow Standard)
                background: isChecked
                  ? 'rgba(37, 99, 235, 0.04)'
                  : isSelectedRow
                  ? 'var(--surface-ground, #f4f4f5)'
                  : 'var(--surface-raised, #ffffff)',
                boxShadow: 'var(--shadow-raised)',
                cursor: 'pointer',
                transition:
                  'transform 150ms ease-out, box-shadow 150ms ease-out, background 150ms ease-out',
                gap: '12px',
              }}
            >
              {/* Left Column: Select Box + Micro-interaction Checkbox + Title & Subtitle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {/* Multi-select for bulk operations */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => toggleSelect(task.id, e)}
                  onClick={e => e.stopPropagation()}
                  aria-label={`Chọn ${task.title}`}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                />

                {/* Recipe 1 Stageshow Micro-interaction Completion Checkbox */}
                <button
                  type="button"
                  onClick={e => void handleCheckboxClick(e, task)}
                  className={isBouncing ? 'checkbox-bouncing' : ''}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isDone
                      ? '1px solid var(--accent)'
                      : '1px solid var(--ink-faint)',
                    background: isDone
                      ? 'var(--accent)'
                      : 'var(--surface-raised, #ffffff)',
                    color: isDone ? 'var(--bg-app)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                    transition:
                      'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), background 150ms ease',
                  }}
                  aria-label={
                    isDone
                      ? 'Đánh dấu chưa hoàn thành'
                      : 'Đánh dấu hoàn thành'
                  }
                >
                  {isDone && <CheckCircle2 size={13} strokeWidth={2.5} />}
                </button>

                {/* Title & Metadata (Word budget <= 7 phrases) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isDone
                        ? 'var(--ink-muted)'
                        : 'var(--ink-title)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      transition: 'color 150ms ease',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.title}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '12px',
                      color: 'var(--ink-subtle)',
                    }}
                  >
                    {task.dueAt ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={11} style={{ color: 'var(--ink-muted)' }} />
                        <span>
                          {new Date(task.dueAt).toLocaleDateString('vi-VN', {
                            timeZone: VIETNAM_TIME_ZONE,
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ink-faint)' }}>Chưa đặt hạn</span>
                    )}

                    {/* Checklist summary */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color:
                          chk.percentage === 100
                            ? 'var(--success)'
                            : 'var(--ink-muted)',
                      }}
                    >
                      <CheckCircle2
                        size={11}
                        style={{
                          color:
                            chk.percentage === 100
                              ? 'var(--success)'
                              : 'var(--ink-faint)',
                        }}
                      />
                      <span>{chk.text}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Chips & Chevron Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                }}
              >
                {/* Importance Chip */}
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontWeight: 600,
                    border: '1px solid var(--hairline)',
                    background:
                      task.importance === 'high'
                        ? 'rgba(239, 68, 68, 0.08)'
                        : task.importance === 'medium'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(16, 185, 129, 0.08)',
                    color:
                      task.importance === 'high'
                        ? 'var(--danger)'
                        : task.importance === 'medium'
                        ? '#b45309'
                        : 'var(--success)',
                  }}
                >
                  {task.importance === 'high'
                    ? 'Cao'
                    : task.importance === 'medium'
                    ? 'Vừa'
                    : 'Thấp'}
                </span>

                {/* Status Chip */}
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid var(--hairline)',
                    background:
                      task.status === 'done'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : task.status === 'doing'
                        ? 'rgba(37, 99, 235, 0.08)'
                        : 'var(--surface-ground, #f4f4f5)',
                    color:
                      task.status === 'done'
                        ? 'var(--success)'
                        : task.status === 'doing'
                        ? 'var(--accent)'
                        : 'var(--ink-muted)',
                  }}
                >
                  {task.status === 'done'
                    ? 'Đã xong'
                    : task.status === 'doing'
                    ? 'Đang làm'
                    : 'Chờ làm'}
                </span>

                <ChevronRight
                  size={15}
                  style={{
                    color: isSelectedRow ? 'var(--accent)' : 'var(--ink-muted)',
                    opacity: isSelectedRow ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
