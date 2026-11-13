import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import type { ChecklistItemViewModel, Task, WorkSessionViewModel } from './types';
import { VIETNAM_TIME_ZONE, vietnamDateTimeParts } from '../../shared/time-zone';

interface TaskGanttViewProps {
  tasks: Task[];
  workSessions: WorkSessionViewModel[];
  checklistMap?: Record<string, ChecklistItemViewModel[]>;
  isPersonalWorkspace?: boolean;
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  now?: Date;
  onCreateTaskClick?: () => void;
}

export const TaskGanttView: React.FC<TaskGanttViewProps> = ({
  tasks,
  workSessions,
  checklistMap = {},
  isPersonalWorkspace = false,
  onSelectTask,
  selectedTaskId,
  now = new Date(),
  onCreateTaskClick,
}) => {
  // Timeline offset by weeks (each jump is 7 days)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Normalize current date
  const todayStr = useMemo(() => vietnamDateTimeParts(now).date, [now]);

  // Compute Monday of the base week
  const baseMonday = useMemo(() => {
    const day = vietnamDateTimeParts(now).date;
    const d = new Date(`${day}T00:00:00+07:00`);
    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfWeek = new Date(`${day}T12:00:00Z`).getUTCDay();
    const distanceToMonday = (dayOfWeek + 6) % 7; // Distance from Monday
    d.setUTCDate(d.getUTCDate() - distanceToMonday + weekOffset * 7);
    return d;
  }, [now, weekOffset]);

  // 5 weeks = 35 days
  const TOTAL_DAYS = 35;
  const DAY_WIDTH = 36; // px per day

  const timelineDays = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(baseMonday);
      d.setUTCDate(d.getUTCDate() + i);
      return d;
    });
  }, [baseMonday]);

  // Weeks breakdown (5 weeks)
  const weeks = useMemo(() => {
    return [0, 1, 2, 3, 4].map(wIndex => {
      const start = timelineDays[wIndex * 7];
      const end = timelineDays[wIndex * 7 + 6];
      return {
        index: wIndex + 1,
        label: `Tuần ${wIndex + 1}`,
        subLabel: `${start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: VIETNAM_TIME_ZONE })} - ${end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: VIETNAM_TIME_ZONE })}`,
        start,
        end,
      };
    });
  }, [timelineDays]);

  const timelineStartMs = timelineDays[0].getTime();
  const timelineEndMs = timelineDays[timelineDays.length - 1].getTime() + 86400000;

  // Date range label for header
  const rangeHeaderLabel = useMemo(() => {
    const first = timelineDays[0];
    const last = timelineDays[timelineDays.length - 1];
    return `${first.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: VIETNAM_TIME_ZONE })} - ${last.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: VIETNAM_TIME_ZONE })} (5 Tuần)`;
  }, [timelineDays]);

  // Priority color coding helper
  const getPriorityMeta = (importance: string, isOverdue: boolean) => {
    if (isOverdue) {
      return {
        label: 'Khẩn cấp',
        badgeBg: '#fef2f2',
        badgeColor: '#b91c1c',
        badgeBorder: '#fecaca',
        barBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        barBorder: '#b91c1c',
        dotColor: '#ef4444',
      };
    }
    switch (importance) {
      case 'high':
        return {
          label: 'Cao',
          badgeBg: '#fffbeb',
          badgeColor: '#b45309',
          badgeBorder: '#fde68a',
          barBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          barBorder: '#b45309',
          dotColor: '#f59e0b',
        };
      case 'low':
        return {
          label: 'Thấp',
          badgeBg: '#f3f4f6',
          badgeColor: '#4b5563',
          badgeBorder: '#e5e7eb',
          barBg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          barBorder: '#374151',
          dotColor: '#9ca3af',
        };
      case 'medium':
      default:
        return {
          label: 'Trung bình',
          badgeBg: '#eff6ff',
          badgeColor: '#1d4ed8',
          badgeBorder: '#bfdbfe',
          barBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          barBorder: '#1d4ed8',
          dotColor: '#3b82f6',
        };
    }
  };

  // Compute Task Calculations (Duration, Progress, Dates, Status)
  const enrichedTasks = useMemo(() => {
    return tasks.map((task, idx) => {
      const isDone = task.status === 'done';
      const dueStr = task.dueAt ? task.dueAt.slice(0, 10) : undefined;
      const isDueToday = Boolean(dueStr && dueStr === todayStr);
      const isOverdue = Boolean(!isDone && dueStr && dueStr < todayStr);

      // Checklist progress
      const items = checklistMap[task.id] || [];
      let progress = 0;
      if (isDone) {
        progress = 100;
      } else if (items.length > 0) {
        const doneCount = items.filter(i => i.done).length;
        progress = Math.round((doneCount / items.length) * 100);
      } else if (task.status === 'doing') {
        progress = 40;
      }

      // Dates & Duration
      let dueDate: Date | null = null;
      if (task.dueAt) {
        dueDate = new Date(task.dueAt);
      }

      const sessionsForTask = workSessions.filter(s => s.taskId === task.id);
      let startDate: Date;
      if (sessionsForTask.length > 0) {
        const sorted = [...sessionsForTask].sort((a, b) => a.startAt.localeCompare(b.startAt));
        startDate = new Date(sorted[0].startAt);
      } else if (dueDate) {
        // Default to 3 days before deadline
        startDate = new Date(dueDate.getTime() - 3 * 86400000);
      } else {
        startDate = new Date(now);
      }
      startDate = new Date(`${vietnamDateTimeParts(startDate).date}T00:00:00+07:00`);

      let durationDays = 1;
      if (dueDate) {
        const diffMs = dueDate.getTime() - startDate.getTime();
        durationDays = Math.max(1, Math.ceil(diffMs / 86400000));
      }

      const priorityMeta = getPriorityMeta(task.importance, isOverdue);

      return {
        ...task,
        wbs: `${idx + 1}.0`,
        isDone,
        isDueToday,
        isOverdue,
        progress,
        startDate,
        dueDate,
        durationDays,
        priorityMeta,
      };
    });
  }, [tasks, checklistMap, todayStr, now]);

  if (tasks.length === 0) {
    return (
      <div
        style={{
          border: '1px solid var(--border-divider, #e2e8f0)',
          borderRadius: '10px',
          background: 'var(--surface-raised, #ffffff)',
          boxShadow: 'var(--shadow-raised, 0 1px 3px rgba(0,0,0,0.05))',
          padding: '56px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--surface-ground, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--accent, #2563eb)',
          }}
        >
          <Calendar size={26} />
        </div>

        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--ink-title, #0f172a)',
            marginBottom: '6px',
          }}
        >
          Chưa có công việc trong tiến độ Gantt
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--ink-muted, #64748b)',
            maxWidth: '420px',
            marginBottom: '20px',
            lineHeight: 1.6,
          }}
        >
          Hãy tạo công việc mới và đặt thời hạn hoặc mức ưu tiên để theo dõi biểu đồ tiến độ Gantt trực quan 5 tuần.
        </p>

        {onCreateTaskClick && (
          <button
            type="button"
            onClick={onCreateTaskClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '8px',
              background: 'var(--accent, #2563eb)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <Plus size={16} />
            <span>Tạo công việc ngay</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Header: Legend on Left & Navigation Toolbar on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '12px 18px',
          background: 'var(--surface-raised, #ffffff)',
          border: '1px solid var(--border-divider, #e2e8f0)',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04))',
        }}
      >
        {/* Left: Color Coding Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 650, color: 'var(--ink-title, #0f172a)' }}>
            <Sparkles size={14} style={{ color: 'var(--accent, #2563eb)' }} />
            <span>Ưu tiên:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ink-body, #334155)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span>Khẩn cấp</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ink-body, #334155)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span>Cao</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ink-body, #334155)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            <span>Trung bình</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ink-body, #334155)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af', display: 'inline-block' }} />
            <span>Thấp</span>
          </div>

          <div style={{ height: '14px', width: '1px', background: 'var(--hairline, #cbd5e1)', margin: '0 4px' }} />

          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              fontWeight: 650,
            }}
          >
            Quá hạn
          </span>

          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              fontWeight: 650,
            }}
          >
            Hôm nay
          </span>

          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontWeight: 650,
            }}
          >
            Đã xong
          </span>
        </div>

        {/* Right: Quick Navigation Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev - 1)}
            style={{
              padding: '6px 11px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--hairline, #cbd5e1)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body, #334155)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={14} />
            <span>Tuần trước</span>
          </button>

          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 650,
              borderRadius: '6px',
              border: '1px solid var(--hairline, #cbd5e1)',
              background: weekOffset === 0 ? 'var(--accent, #2563eb)' : 'var(--surface-raised, #ffffff)',
              color: weekOffset === 0 ? '#ffffff' : 'var(--ink-title, #0f172a)',
              cursor: 'pointer',
            }}
          >
            Hôm nay
          </button>

          <button
            type="button"
            onClick={() => setWeekOffset(prev => prev + 1)}
            style={{
              padding: '6px 11px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--hairline, #cbd5e1)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body, #334155)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Tuần sau</span>
            <ChevronRight size={14} />
          </button>

          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-title, #0f172a)',
              marginLeft: '6px',
              paddingLeft: '10px',
              borderLeft: '1px solid var(--hairline, #cbd5e1)',
            }}
          >
            {rangeHeaderLabel}
          </span>
        </div>
      </div>

      {/* 2. Main Two-Pane Split: Left Table & Right Gantt Chart Matrix */}
      <div
        style={{
          border: '1px solid var(--border-divider, #e2e8f0)',
          borderRadius: '10px',
          background: 'var(--surface-raised, #ffffff)',
          boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* === LEFT PANE: WORK BREAKDOWN STRUCTURE & TASK DETAILS TABLE === */}
        <div
          style={{
            width: '560px',
            minWidth: '560px',
            borderRight: '2px solid var(--hairline, #cbd5e1)',
            background: 'var(--surface-raised, #ffffff)',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '46px 1fr 90px 85px 85px 55px 70px',
              height: '56px',
              background: 'var(--surface-ground, #f8fafc)',
              borderBottom: '1px solid var(--hairline, #cbd5e1)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--ink-muted, #64748b)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              alignItems: 'center',
              padding: '0 8px',
            }}
          >
            <div style={{ textAlign: 'center' }}>WBS</div>
            <div style={{ paddingLeft: '8px' }}>Tên công việc</div>
            <div style={{ textAlign: 'center' }}>Ưu tiên</div>
            <div style={{ textAlign: 'center' }}>Phụ trách</div>
            <div style={{ textAlign: 'center' }}>Hạn chót</div>
            <div style={{ textAlign: 'center' }}>Số ngày</div>
            <div style={{ textAlign: 'center' }}>% Xong</div>
          </div>

          {/* Table Body Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {enrichedTasks.map(task => {
              const isSelected = task.id === selectedTaskId;

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr 90px 85px 85px 55px 70px',
                    height: '48px',
                    alignItems: 'center',
                    padding: '0 8px',
                    borderBottom: '1px solid var(--hairline, #f1f5f9)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 140ms ease',
                  }}
                  title="Nhấp để xem hoặc chỉnh sửa chi tiết"
                >
                  {/* WBS */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ink-muted, #64748b)',
                    }}
                  >
                    {task.wbs}
                  </div>

                  {/* Title & Status */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingLeft: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: task.priorityMeta.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: task.isDone ? 'var(--ink-muted, #94a3b8)' : 'var(--ink-title, #0f172a)',
                        textDecoration: task.isDone ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 650,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: task.priorityMeta.badgeBg,
                        color: task.priorityMeta.badgeColor,
                        border: `1px solid ${task.priorityMeta.badgeBorder}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task.priorityMeta.label}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      color: 'var(--ink-body, #475569)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      padding: '0 4px',
                    }}
                  >
                    {isPersonalWorkspace ? 'Cá nhân' : (task.assigneeId ? task.assigneeId.slice(0, 8) : '—')}
                  </div>

                  {/* Due Date */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: task.isOverdue || task.isDueToday ? 700 : 500,
                      color: task.isOverdue ? '#dc2626' : task.isDueToday ? '#d97706' : 'var(--ink-body, #334155)',
                    }}
                  >
                    {task.dueAt ? new Date(task.dueAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: VIETNAM_TIME_ZONE }) : '—'}
                  </div>

                  {/* Duration */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      color: 'var(--ink-muted, #64748b)',
                    }}
                  >
                    {task.durationDays}d
                  </div>

                  {/* % Complete Progress Mini Bar */}
                  <div style={{ padding: '0 6px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '5px',
                          background: '#e2e8f0',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${task.progress}%`,
                            height: '100%',
                            background: task.isDone ? '#10b981' : 'var(--accent, #2563eb)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 650, color: 'var(--ink-muted, #64748b)', width: '24px' }}>
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === RIGHT PANE: TIMELINE GANTT BARS GRID (5 WEEKS x 7 DAYS) === */}
        <div
          style={{
            flex: 1,
            minWidth: `${TOTAL_DAYS * DAY_WIDTH}px`,
            position: 'relative',
            background: 'var(--surface-raised, #ffffff)',
          }}
        >
          {/* Header Tier 1: Weeks (Tuần 1 -> Tuần 5) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(5, ${DAY_WIDTH * 7}px)`,
              height: '28px',
              background: 'var(--surface-ground, #f8fafc)',
              borderBottom: '1px solid var(--hairline, #e2e8f0)',
              alignItems: 'center',
            }}
          >
            {weeks.map(w => (
              <div
                key={w.index}
                style={{
                  borderRight: '1px solid var(--hairline, #cbd5e1)',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--ink-title, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>{w.label}</span>
                <span style={{ fontSize: '10px', color: 'var(--ink-muted, #64748b)', fontWeight: 400 }}>
                  ({w.subLabel})
                </span>
              </div>
            ))}
          </div>

          {/* Header Tier 2: Days (T2, T3, T4... CN) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${TOTAL_DAYS}, ${DAY_WIDTH}px)`,
              height: '28px',
              background: 'var(--surface-ground, #f1f5f9)',
              borderBottom: '1px solid var(--hairline, #cbd5e1)',
              alignItems: 'center',
            }}
          >
            {timelineDays.map(d => {
              const dateStr = vietnamDateTimeParts(d).date;
              const isToday = dateStr === todayStr;
              const dayOfWeek = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div
                  key={dateStr}
                  style={{
                    borderRight: '1px solid var(--hairline, #e2e8f0)',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: isToday ? 800 : isWeekend ? 600 : 500,
                    color: isToday ? 'var(--accent, #2563eb)' : isWeekend ? 'var(--ink-muted, #94a3b8)' : 'var(--ink-body, #475569)',
                    background: isToday ? 'rgba(37, 99, 235, 0.12)' : isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent',
                    lineHeight: '28px',
                  }}
                >
                  {d.toLocaleDateString('vi-VN', { weekday: 'narrow', timeZone: VIETNAM_TIME_ZONE })} {Number(dateStr.slice(8))}
                </div>
              );
            })}
          </div>

          {/* Background Grid Columns */}
          <div
            style={{
              position: 'absolute',
              top: '56px',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${TOTAL_DAYS}, ${DAY_WIDTH}px)`,
              pointerEvents: 'none',
            }}
          >
            {timelineDays.map(d => {
              const dateStr = vietnamDateTimeParts(d).date;
              const isToday = dateStr === todayStr;
              const dayOfWeek = new Date(`${dateStr}T12:00:00Z`).getUTCDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              return (
                <div
                  key={dateStr}
                  style={{
                    borderRight: '1px solid var(--hairline, #f1f5f9)',
                    background: isToday ? 'rgba(37, 99, 235, 0.04)' : isWeekend ? 'rgba(0, 0, 0, 0.015)' : 'transparent',
                    position: 'relative',
                  }}
                >
                  {/* Today Vertical Red Indicator Line */}
                  {isToday && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '50%',
                        width: '2px',
                        background: '#ef4444',
                        zIndex: 5,
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Gantt Bars Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 6 }}>
            {enrichedTasks.map(task => {
              const isSelected = task.id === selectedTaskId;

              // Calculate start and end offset in days relative to timeline start
              const taskStartMs = task.startDate.getTime();
              const taskEndMs = task.dueDate ? task.dueDate.getTime() : taskStartMs + 86400000;

              // Clamp to visible timeline
              const visibleStartMs = Math.max(taskStartMs, timelineStartMs);
              const visibleEndMs = Math.min(taskEndMs, timelineEndMs);

              const isVisible = taskEndMs >= timelineStartMs && taskStartMs <= timelineEndMs;

              const startDayOffset = Math.max(0, (taskStartMs - timelineStartMs) / 86400000);
              const spanDays = Math.max(1, (taskEndMs - taskStartMs) / 86400000);

              const leftPx = startDayOffset * DAY_WIDTH;
              const widthPx = Math.max(DAY_WIDTH, spanDays * DAY_WIDTH);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  style={{
                    height: '48px',
                    position: 'relative',
                    borderBottom: '1px solid var(--hairline, #f1f5f9)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {isVisible && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: `${leftPx}px`,
                        width: `${widthPx}px`,
                        height: '28px',
                        borderRadius: '6px',
                        background: task.priorityMeta.barBg,
                        border: `1px solid ${task.priorityMeta.barBorder}`,
                        boxShadow: isSelected
                          ? '0 0 0 2px #ffffff, 0 0 0 4px var(--accent, #2563eb)'
                          : '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 650,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        zIndex: isSelected ? 8 : 7,
                        transition: 'transform 120ms ease, box-shadow 120ms ease',
                      }}
                      title={`${task.title} • ${task.durationDays} ngày • Tiến độ: ${task.progress}%`}
                    >
                      {/* Internal Progress Fill Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${task.progress}%`,
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '5px 0 0 5px',
                        }}
                      />

                      {/* Text content inside Gantt Bar */}
                      <span
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                        }}
                      >
                        {task.isDone ? <CheckCircle2 size={13} /> : null}
                        <span>{task.title}</span>
                        {widthPx > 110 && (
                          <span style={{ opacity: 0.85, fontSize: '10px', fontWeight: 500 }}>
                            ({task.durationDays}d • {task.progress}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Overdue / Today Floating Badge near right edge of the bar */}
                  {isVisible && task.isOverdue && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: `${leftPx + widthPx + 8}px`,
                        zIndex: 9,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#ef4444',
                        color: '#ffffff',
                        boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Quá hạn!
                    </div>
                  )}

                  {isVisible && !task.isOverdue && task.isDueToday && !task.isDone && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: `${leftPx + widthPx + 8}px`,
                        zIndex: 9,
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f59e0b',
                        color: '#ffffff',
                        boxShadow: '0 1px 3px rgba(245, 158, 11, 0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Hôm nay
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
