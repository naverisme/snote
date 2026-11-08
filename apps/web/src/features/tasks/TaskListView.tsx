import React, { useState } from 'react';
import { Archive, Trash2, CheckCircle2, Clock } from 'lucide-react';
import type { ChecklistItemViewModel, Task } from './types';

interface TaskListViewProps {
  tasks: Task[];
  checklistItems: Record<string, ChecklistItemViewModel[]>;
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  onBulkArchive: (items: { id: string; version: number }[]) => Promise<void>;
  onBulkTrash: (items: { id: string; version: number }[]) => Promise<void>;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  checklistItems,
  onSelectTask,
  selectedTaskId,
  onBulkArchive,
  onBulkTrash,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

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
      return { text: 'Chưa có checklist', percentage: 0 }; // EC-17: 0 items does NOT show 100% or 0/0
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Bulk Action Bar (UXR-14) */}
      {selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
            Đã chọn {selectedIds.size} công việc
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleBulkAction('archive')}
              style={{
                padding: '4px 12px',
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
                padding: '4px 12px',
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

      {/* Task List Table */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-md, 8px)',
          overflowX: 'auto',
          background: 'var(--surface-raised, #ffffff)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--surface-ground, #f4f4f5)', borderBottom: '1px solid var(--hairline)' }}>
              <th style={{ width: '40px', padding: '10px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedIds.size === tasks.length}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                Tiêu đề
              </th>
              <th style={{ width: '110px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                Mức độ
              </th>
              <th style={{ width: '120px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                Trạng thái
              </th>
              <th style={{ width: '160px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>Hạn chót</span>
                </span>
              </th>
              <th style={{ width: '170px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} />
                  <span>Checklist</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--ink-faint)' }} />
                    <span>Không có công việc phù hợp với bộ lọc hiện tại.</span>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map(task => {
                const isSelectedRow = task.id === selectedTaskId;
                const isChecked = selectedIds.has(task.id);
                const chk = getChecklistSummary(task.id);

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{
                      borderBottom: '1px solid var(--hairline)',
                      background: isChecked ? 'rgba(37, 99, 235, 0.06)' : isSelectedRow ? 'var(--surface-ground, #f4f4f5)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast, 0.16s ease)',
                    }}
                  >
                    <td style={{ padding: '10px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => toggleSelect(task.id, e)}
                        aria-label={`Chọn ${task.title}`}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500 }}>
                      <span
                        style={{
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          color: task.status === 'done' ? 'var(--ink-muted)' : 'var(--ink-title)',
                        }}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 600,
                          border: '1px solid var(--hairline)',
                          background:
                            task.importance === 'high'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : task.importance === 'medium'
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'rgba(16, 185, 129, 0.1)',
                          color:
                            task.importance === 'high'
                              ? 'var(--danger)'
                              : task.importance === 'medium'
                              ? '#b45309'
                              : 'var(--success)',
                        }}
                      >
                        {task.importance === 'high' ? 'Cao' : task.importance === 'medium' ? 'Vừa' : 'Thấp'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid var(--hairline)',
                          background:
                            task.status === 'done'
                              ? 'rgba(16, 185, 129, 0.1)'
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
                        {task.status === 'done' && <CheckCircle2 size={11} />}
                        {task.status === 'doing' && <Clock size={11} />}
                        <span>{task.status === 'done' ? 'Đã xong' : task.status === 'doing' ? 'Đang làm' : 'Chờ làm'}</span>
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--ink-muted)' }}>
                      {task.dueAt ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} style={{ color: 'var(--ink-subtle)' }} />
                          <span>
                            {new Date(task.dueAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--ink-faint)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: chk.percentage === 100 ? 'var(--success)' : 'var(--ink-muted)',
                        }}
                      >
                        <CheckCircle2
                          size={12}
                          style={{
                            color: chk.percentage === 100 ? 'var(--success)' : 'var(--ink-faint)',
                          }}
                        />
                        <span>{chk.text}</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
