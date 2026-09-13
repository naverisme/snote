import React, { useState, useMemo } from 'react';
import { TaskStatus, TaskPriority } from '@snote/shared';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  BookOpen,
  FolderKanban,
  Edit3,
  Trash2,
  ListTodo,
  ChevronDown,
  ChevronRight,
  Flame,
  User,
  ArrowRight
} from 'lucide-react';
import { extractNoteFeatures } from '../../notes/utils/smartNoteParser';
import { getTaskDueStatus } from '../../../utils/dateUtils';

interface TasksListViewProps {
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void;
  onMoveStatus?: (id: string, newStatus: TaskStatus) => void;
  onOpenTaskModal?: () => void;
}

export const TasksListView: React.FC<TasksListViewProps> = ({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveStatus,
  onOpenTaskModal
}) => {
  const [isDoneSectionOpen, setIsDoneSectionOpen] = useState(true);

  // Group tasks into timeline categories
  const grouped = useMemo(() => {
    const overdue: any[] = [];
    const dueToday: any[] = [];
    const upcoming: any[] = [];
    const noDueDate: any[] = [];
    const done: any[] = [];

    tasks.forEach((t) => {
      if (t.status === TaskStatus.DONE) {
        done.push(t);
        return;
      }

      if (!t.dueDate) {
        noDueDate.push(t);
        return;
      }

      const dueInfo = getTaskDueStatus(t.dueDate, false);
      if (dueInfo.isOverdue) {
        overdue.push(t);
      } else if (dueInfo.isToday) {
        dueToday.push(t);
      } else {
        upcoming.push(t);
      }
    });

    // Sort upcoming by dueDate asc
    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    overdue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return { overdue, dueToday, upcoming, noDueDate, done };
  }, [tasks]);

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return { label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case TaskPriority.HIGH:
        return { label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case TaskPriority.MEDIUM:
        return { label: 'Trung bình', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.3)' };
      default:
        return { label: 'Thấp', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)' };
    }
  };

  const getSubtasks = (desc?: string | null) => {
    if (!desc) return null;
    const features = extractNoteFeatures(desc);
    if (features.checklist.total > 0) {
      return {
        done: features.checklist.done,
        total: features.checklist.total,
        percent: Math.round((features.checklist.done / features.checklist.total) * 100)
      };
    }
    return null;
  };

  const renderTaskRow = (task: any, isOverdue: boolean = false) => {
    const isDone = task.status === TaskStatus.DONE;
    const priority = getPriorityInfo(task.priority);
    const subtasks = getSubtasks(task.description);
    const assigneeName = task.assignees?.[0]?.name || task.assignee?.fullName || task.user?.fullName;
    const assigneeInitial = assigneeName ? assigneeName.slice(0, 2).toUpperCase() : null;

    const dueInfo = getTaskDueStatus(task.dueDate, isDone);
    const relativeDateStr = dueInfo.label || dueInfo.formattedDue;

    return (
      <div
        key={task.id}
        className="snote-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: isDone ? 'var(--bg-secondary)' : isOverdue ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-primary)',
          border: isOverdue && !isDone
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          opacity: isDone ? 0.75 : 1,
          transition: 'all var(--transition-fast)'
        }}
      >
        {/* Left: Checkbox + Title + Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {/* Checkbox */}
          <button
            onClick={() => onToggleStatus(task.id, task.status)}
            className="btn btn-ghost btn-icon"
            style={{
              padding: '2px',
              color: isDone ? 'var(--color-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              flexShrink: 0
            }}
            title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          >
            {isDone ? (
              <CheckCircle2 size={20} style={{ fill: 'rgba(16, 185, 129, 0.2)' }} />
            ) : (
              <Circle size={20} />
            )}
          </button>

          {/* Priority Dot */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: priority.color,
              flexShrink: 0
            }}
            title={`Mức độ ưu tiên: ${priority.label}`}
          />

          {/* Title & Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                onClick={() => onEdit(task)}
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  cursor: 'pointer',
                  wordBreak: 'break-word'
                }}
                title={task.title}
              >
                {task.title}
              </span>

              {/* Subtasks Progress */}
              {subtasks && (
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    padding: '1.5px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <ListTodo size={11} />
                  {subtasks.done}/{subtasks.total} ({subtasks.percent}%)
                </span>
              )}
            </div>

            {/* Subject / Project Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
              {task.subject && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: task.subject.color || 'var(--color-info)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <BookOpen size={10} />
                  {task.subject.code ? `[${task.subject.code}] ` : ''}
                  {task.subject.name}
                </span>
              )}

              {task.project && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(168, 85, 247, 0.12)',
                    color: '#a855f7',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <FolderKanban size={10} />
                  {task.project.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Assignee + Due Date + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Assignee Avatar */}
          {assigneeName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}
              title={`Phụ trách: ${assigneeName}`}
            >
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {assigneeInitial}
              </span>
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {assigneeName}
              </span>
            </div>
          )}

          {/* Due date badge */}
          {task.dueDate && (
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: isOverdue ? 700 : 500,
                color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minWidth: '90px',
                justifyContent: 'flex-end'
              }}
            >
              <Calendar size={13} />
              <span>{relativeDateStr}</span>
            </div>
          )}

          {/* Quick status transition button */}
          {onMoveStatus && !isDone && (
            <button
              onClick={() => {
                const nextStatus = task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE;
                onMoveStatus(task.id, nextStatus);
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px', gap: '4px', color: 'var(--accent-primary)' }}
              title={task.status === TaskStatus.TODO ? 'Chuyển sang Đang thực hiện' : 'Hoàn tất công việc'}
            >
              <span>{task.status === TaskStatus.TODO ? 'Làm ngay' : 'Hoàn thành'}</span>
              <ArrowRight size={12} />
            </button>
          )}

          {/* Edit & Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-icon btn-sm"
              title="Chỉnh sửa chi tiết"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id, task.title)}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ color: 'var(--color-danger)' }}
              title="Xóa công việc"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, icon: any, items: any[], color: string, isOverdue: boolean = false) => {
    if (items.length === 0) return null;
    const Icon = icon;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
          <span style={{ color, display: 'flex' }}>
            <Icon size={16} />
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {title}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '999px',
              backgroundColor: `${color}20`,
              color
            }}
          >
            {items.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((t) => renderTaskRow(t, isOverdue))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Overdue Section */}
      {renderSection('Quá hạn cần giải quyết gấp', AlertCircle, grouped.overdue, '#ef4444', true)}

      {/* 2. Due Today Section */}
      {renderSection('Hạn hôm nay', Clock, grouped.dueToday, '#f59e0b')}

      {/* 3. Upcoming Section */}
      {renderSection('Sắp tới & Tuần này', Calendar, grouped.upcoming, '#0ea5e9')}

      {/* 4. No Due Date Section */}
      {renderSection('Không giới hạn thời gian', ListTodo, grouped.noDueDate, '#8b5cf6')}

      {/* 5. Completed Section (Collapsible) */}
      {grouped.done.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => setIsDoneSectionOpen(!isDoneSectionOpen)}
            className="btn btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '8px',
              padding: '6px 0',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            {isDoneSectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span style={{ color: 'var(--color-success)' }}>
              Đã hoàn thành ({grouped.done.length})
            </span>
          </button>

          {isDoneSectionOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {grouped.done.map((t) => renderTaskRow(t))}
            </div>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Chưa có công việc nào trong danh sách. Hãy thêm công việc ở thanh trên!
        </div>
      )}
    </div>
  );
};
