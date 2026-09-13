import React, { useMemo } from 'react';
import { TaskStatus, TaskPriority } from '@snote/shared';
import { getTaskDueStatus } from '../../../utils/dateUtils';
import {
  Flame,
  Calendar,
  Zap,
  Coffee,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  FolderKanban,
  Edit3,
  Trash2,
  ListTodo
} from 'lucide-react';
import { extractNoteFeatures } from '../../notes/utils/smartNoteParser';

interface TasksEisenhowerViewProps {
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void;
  onMoveStatus?: (id: string, newStatus: TaskStatus) => void;
  onOpenCreate?: () => void;
}

export const TasksEisenhowerView: React.FC<TasksEisenhowerViewProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveStatus,
  onOpenCreate
}) => {
  // Categorize active tasks into 4 Quadrants
  const quadrants = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const threeDaysLater = today + 3 * 24 * 60 * 60 * 1000;

    const q1: any[] = []; // Urgent & Important (Do First)
    const q2: any[] = []; // Not Urgent & Important (Schedule)
    const q3: any[] = []; // Urgent & Not Important (Delegate / Quick)
    const q4: any[] = []; // Not Urgent & Not Important (Eliminate / Later)

    tasks.forEach((t) => {
      if (t.status === TaskStatus.DONE) return;

      const isUrgentPriority = t.priority === TaskPriority.URGENT;
      const isHighPriority = t.priority === TaskPriority.HIGH;
      const isMediumPriority = t.priority === TaskPriority.MEDIUM;
      const isLowPriority = t.priority === TaskPriority.LOW;

      const due = t.dueDate ? new Date(t.dueDate).getTime() : null;
      const isDueSoon = due != null && due <= threeDaysLater;

      if (isUrgentPriority || (isHighPriority && isDueSoon)) {
        q1.push(t);
      } else if (isHighPriority || (isMediumPriority && !isDueSoon)) {
        q2.push(t);
      } else if (isDueSoon || isMediumPriority) {
        q3.push(t);
      } else {
        q4.push(t);
      }
    });

    return { q1, q2, q3, q4 };
  }, [tasks]);

  const renderTaskMiniCard = (task: any) => {
    const isDone = task.status === TaskStatus.DONE;
    const features = task.description ? extractNoteFeatures(task.description) : null;
    const hasChecklist = features && features.checklist.total > 0;

    return (
      <div
        key={task.id}
        className="snote-card"
        style={{
          padding: '10px 12px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <button
            onClick={() => onToggleStatus(task.id, task.status)}
            className="btn btn-ghost btn-icon"
            style={{
              padding: '2px',
              color: isDone ? 'var(--color-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
              marginTop: '1px'
            }}
          >
            {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              onClick={() => onEdit(task)}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                display: 'block'
              }}
              title={task.title}
            >
              {task.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ padding: '2px' }}
              title="Chỉnh sửa"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={() => onDelete(task.id, task.title)}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ padding: '2px', color: 'var(--color-danger)' }}
              title="Xóa"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Footer Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
            {task.subject && (
              <span
                style={{
                  color: task.subject.color || 'var(--color-info)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {task.subject.name}
              </span>
            )}
            {hasChecklist && (
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <ListTodo size={10} />
                {features?.checklist.done}/{features?.checklist.total}
              </span>
            )}
          </div>

          {task.dueDate && (() => {
            const dueInfo = getTaskDueStatus(task.dueDate, isDone);
            return (
              <span
                style={{
                  flexShrink: 0,
                  fontWeight: dueInfo.isOverdue || dueInfo.isToday ? 700 : 500,
                  color: dueInfo.isOverdue ? 'var(--color-danger)' : dueInfo.isToday ? 'var(--color-warning)' : 'inherit'
                }}
              >
                {dueInfo.label || dueInfo.formattedDue}
              </span>
            );
          })()}
        </div>
      </div>
    );
  };

  const matrixConfigs = [
    {
      id: 'q1',
      title: 'Q1: Khẩn Cấp & Quan Trọng',
      subtitle: 'Làm Ngay (Do First) — Hạn sát nút, kỳ thi',
      icon: Flame,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.04)',
      border: 'rgba(239, 68, 68, 0.3)',
      items: quadrants.q1
    },
    {
      id: 'q2',
      title: 'Q2: Quan Trọng Nhưng Chưa Gấp',
      subtitle: 'Lên Kế Hoạch (Schedule) — Đồ án, nghiên cứu',
      icon: Calendar,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.04)',
      border: 'rgba(245, 158, 11, 0.3)',
      items: quadrants.q2
    },
    {
      id: 'q3',
      title: 'Q3: Khẩn Cấp Nhưng Ít Quan Trọng',
      subtitle: 'Giải Quyết Nhanh (Delegate / Quick) — Thủ tục, form',
      icon: Zap,
      color: '#0ea5e9',
      bg: 'rgba(14, 165, 233, 0.04)',
      border: 'rgba(14, 165, 233, 0.3)',
      items: quadrants.q3
    },
    {
      id: 'q4',
      title: 'Q4: Không Gấp & Không Quan Trọng',
      subtitle: 'Xem Xét Sau (Eliminate / Later) — Đọc thêm ngoài lề',
      icon: Coffee,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.04)',
      border: 'rgba(139, 92, 246, 0.3)',
      items: quadrants.q4
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '16px',
        alignItems: 'stretch'
      }}
    >
      {matrixConfigs.map((q) => {
        const Icon = q.icon;
        return (
          <div
            key={q.id}
            className="snote-card"
            style={{
              backgroundColor: q.bg,
              border: `1px solid ${q.border}`,
              borderRadius: 'var(--radius-xl)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '340px'
            }}
          >
            {/* Quadrant Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: q.color, display: 'flex' }}>
                  <Icon size={18} />
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {q.title}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {q.subtitle}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: `${q.color}25`,
                  color: q.color
                }}
              >
                {q.items.length}
              </span>
            </div>

            {/* Tasks in Quadrant */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {q.items.length === 0 ? (
                <div
                  style={{
                    padding: '30px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '12.5px',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                  }}
                >
                  Không có việc trong góc này
                </div>
              ) : (
                q.items.map((t) => renderTaskMiniCard(t))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
