import React, { useState } from 'react';
import { Archive, Trash2 } from 'lucide-react';
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
            background: '#ddf4ff',
            border: '1px solid #54aeff',
            borderRadius: '6px',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0969da' }}>
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
                borderRadius: '6px',
                border: '1px solid #d0d7de',
                background: '#fff',
                color: '#24292f',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Archive size={13} />
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
                borderRadius: '6px',
                border: '1px solid #ff8182',
                background: '#ffebe9',
                color: '#cf222e',
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
      <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', overflowX: 'auto', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f6f8fa', borderBottom: '1px solid #d0d7de' }}>
              <th style={{ width: '40px', padding: '10px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={tasks.length > 0 && selectedIds.size === tasks.length}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>Tiêu đề</th>
              <th style={{ width: '110px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>Mức độ</th>
              <th style={{ width: '110px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>Trạng thái</th>
              <th style={{ width: '150px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>Hạn chót</th>
              <th style={{ width: '160px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#57606a', fontSize: '13px' }}>
                  Không có công việc phù hợp với bộ lọc hiện tại.
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
                      borderBottom: '1px solid #eaeef2',
                      background: isChecked ? '#f1f8ff' : isSelectedRow ? '#f6f8fa' : '#fff',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
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
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#24292f' }}>
                      <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#57606a' : '#24292f' }}>
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
                          background: task.importance === 'high' ? '#ffebe9' : task.importance === 'medium' ? '#fff8c5' : '#dafbe1',
                          color: task.importance === 'high' ? '#cf222e' : task.importance === 'medium' ? '#9a6700' : '#1a7f37',
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
                          background: task.status === 'done' ? '#dafbe1' : task.status === 'doing' ? '#ddf4ff' : '#f6f8fa',
                          color: task.status === 'done' ? '#1a7f37' : task.status === 'doing' ? '#0969da' : '#57606a',
                        }}
                      >
                        {task.status === 'done' ? 'Đã xong' : task.status === 'doing' ? 'Đang làm' : 'Chờ làm'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#57606a' }}>
                      {task.dueAt ? new Date(task.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#57606a' }}>
                      {chk.text}
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
