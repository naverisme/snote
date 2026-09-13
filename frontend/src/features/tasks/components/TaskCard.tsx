import React from 'react';
import { TaskStatus, TaskPriority } from '@snote/shared';
import { useAuth } from '../../../contexts/AuthContext';
import { getTaskDueStatus } from '../../../utils/dateUtils';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Tag,
  Edit3,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Flame,
  User,
  Users,
  Lock
} from 'lucide-react';

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: string, title: string) => void;
  onToggleStatus: (id: string, currentStatus: TaskStatus) => void;
  onMoveStatus?: (id: string, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveStatus
}) => {
  const { user: currentUser } = useAuth();

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return { label: 'Khẩn cấp', badgeClass: 'badge-rose', isUrgent: true };
      case TaskPriority.HIGH:
        return { label: 'Ưu tiên cao', badgeClass: 'badge-amber', isUrgent: false };
      case TaskPriority.MEDIUM:
        return { label: 'Trung bình', badgeClass: 'badge-blue', isUrgent: false };
      default:
        return { label: 'Thấp', badgeClass: 'badge-neutral', isUrgent: false };
    }
  };

  const priorityBadge = getPriorityBadge(task.priority);
  const isDone = task.status === TaskStatus.DONE;

  // Extract all assignees
  const assigneesList: any[] = (task.assignees && task.assignees.length > 0)
    ? task.assignees
    : (task.assignee ? [task.assignee] : (task.user ? [task.user] : []));

  // Check authorization
  const isAssignee = assigneesList.some((u: any) => u.id === currentUser?.id);
  const isCreator = task.userId === currentUser?.id;
  const isProjectOwner =
    task.project?.userId === currentUser?.id ||
    (task.project?.members || []).some((m: any) => m.userId === currentUser?.id && m.role === 'OWNER');

  const canComplete = task.canComplete !== undefined ? task.canComplete : (isAssignee || isCreator || isProjectOwner || !task.projectId);
  const canEdit = task.canEdit !== undefined ? task.canEdit : (isAssignee || isCreator || isProjectOwner || !task.projectId);

  // Unified Due date status (Cùng ngày nhưng chưa quá giờ thì không tính là quá hạn)
  const dueInfo = getTaskDueStatus(task.dueDate, isDone);
  const dueStatus = dueInfo.status;

  return (
    <div
      className="snote-card stagger-card"
      style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: priorityBadge.isUrgent && !isDone ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
        backgroundColor: isDone ? 'var(--bg-tertiary)' : 'var(--bg-card)',
        opacity: isDone ? 0.75 : 1,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all var(--transition-fast)'
      }}
    >
      {/* Header & Checkbox */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
          <button
            onClick={() => {
              if (canComplete) {
                onToggleStatus(task.id, task.status);
              }
            }}
            disabled={!canComplete}
            className="btn btn-ghost btn-icon"
            style={{
              padding: '2px',
              color: isDone ? 'var(--color-success)' : canComplete ? 'var(--text-muted)' : 'var(--border-color)',
              cursor: canComplete ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexShrink: 0,
              marginTop: '1px'
            }}
            title={
              !canComplete
                ? '🔒 Chỉ thành viên được phân công hoặc Trưởng nhóm mới có quyền hoàn thành task này'
                : isDone
                ? 'Đánh dấu chưa hoàn thành'
                : 'Đánh dấu hoàn thành'
            }
          >
            {isDone ? (
              <CheckCircle2 size={18} style={{ fill: 'rgba(16, 185, 129, 0.2)' }} />
            ) : !canComplete ? (
              <Lock size={16} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <Circle size={18} />
            )}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              onClick={() => onEdit(task)}
              style={{
                margin: '0 0 4px 0',
                fontSize: '14px',
                fontWeight: 700,
                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: isDone ? 'line-through' : 'none',
                cursor: 'pointer',
                lineHeight: 1.35,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
              title="Nhấp để xem chi tiết công việc"
            >
              {task.title}
            </h4>
            {task.description && (
              <p
                onClick={() => onEdit(task)}
                style={{
                  margin: 0,
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  cursor: 'pointer'
                }}
                title="Nhấp để xem chi tiết công việc"
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          {canEdit && (
            <button
              onClick={() => onEdit(task)}
              className="btn btn-ghost btn-icon"
              style={{ padding: '4px', color: 'var(--text-muted)' }}
              title="Chỉnh sửa công việc"
            >
              <Edit3 size={13} />
            </button>
          )}
          {(isCreator || isProjectOwner) && (
            <button
              onClick={() => onDelete(task.id, task.title)}
              className="btn btn-ghost btn-icon"
              style={{ padding: '4px', color: 'var(--color-danger)' }}
              title="Xóa công việc"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Meta tags & Subject Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Priority */}
          <span className={`badge ${priorityBadge.badgeClass}`} style={{ fontSize: '11px', padding: '2px 7px' }}>
            {priorityBadge.isUrgent && <Flame size={11} className="pulse-urgent" />}
            <span>{priorityBadge.label}</span>
          </span>

          {/* Subject badge */}
          {task.subject && (
            <span
              className="badge"
              style={{
                fontSize: '10.5px',
                padding: '2px 7px',
                backgroundColor: task.subject.color ? `${task.subject.color}20` : 'rgba(255,255,255,0.06)',
                color: task.subject.color || 'var(--text-secondary)',
                border: `1px solid ${task.subject.color ? `${task.subject.color}35` : 'var(--border-color)'}`
              }}
            >
              {task.subject.code || task.subject.name}
            </span>
          )}

          {/* Project badge */}
          {task.project && (
            <span
              className="badge badge-purple"
              style={{
                fontSize: '10.5px',
                padding: '2px 7px',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}
              title={`Dự án / BTL: ${task.project.name}`}
            >
              📁 {task.project.name}
            </span>
          )}

          {/* Multi-Assignees Stack / Badge */}
          {assigneesList.length > 0 && (
            <div
              className="badge"
              style={{
                fontSize: '10.5px',
                padding: '2px 7px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={`Thành viên tham gia: ${assigneesList.map((a: any) => a.fullName || a.email).join(', ')}`}
            >
              <Users size={11} />
              <span>
                {assigneesList.length === 1
                  ? (assigneesList[0].id === currentUser?.id ? 'Bạn' : assigneesList[0].fullName?.split(' ').slice(-1)[0] || 'Phụ trách')
                  : (isAssignee ? `Bạn + ${assigneesList.length - 1} người` : `${assigneesList.length} người làm`)}
              </span>
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: dueStatus === 'OVERDUE' ? 'var(--color-danger)' : dueStatus === 'TODAY' ? 'var(--color-warning)' : 'var(--text-muted)',
              fontWeight: dueStatus === 'OVERDUE' || dueStatus === 'TODAY' ? 700 : 500
            }}
          >
            <Calendar size={11} />
            <span>{dueInfo.label || dueInfo.formattedDue}</span>
          </div>
        )}
      </div>

      {/* Quick Move Columns Bar */}
      {onMoveStatus && canComplete && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '6px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '11.5px'
          }}
        >
          {task.status === TaskStatus.TODO && (
            <button
              onClick={() => onMoveStatus(task.id, TaskStatus.IN_PROGRESS)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              <span>Bắt đầu làm</span>
              <ArrowRight size={11} />
            </button>
          )}

          {task.status === TaskStatus.IN_PROGRESS && (
            <>
              <button
                onClick={() => onMoveStatus(task.id, TaskStatus.TODO)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={11} />
                <span>Cần làm</span>
              </button>
              <button
                onClick={() => onMoveStatus(task.id, TaskStatus.DONE)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              >
                <span>Xong</span>
                <CheckCircle2 size={11} />
              </button>
            </>
          )}

          {task.status === TaskStatus.DONE && (
            <button
              onClick={() => onMoveStatus(task.id, TaskStatus.IN_PROGRESS)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={11} />
              <span>Làm lại</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
