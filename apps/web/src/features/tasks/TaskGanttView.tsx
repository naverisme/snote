import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import type { Task, WorkSessionViewModel } from './types';

interface TaskGanttViewProps {
  tasks: Task[];
  workSessions: WorkSessionViewModel[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  now?: Date;
  onCreateTaskClick?: () => void;
}

export const TaskGanttView: React.FC<TaskGanttViewProps> = ({
  tasks,
  workSessions,
  onSelectTask,
  selectedTaskId,
  now = new Date(),
  onCreateTaskClick,
}) => {
  const [zoomMode, setZoomMode] = useState<'day' | 'week'>('day');
  const [timelineOffsetDays, setTimelineOffsetDays] = useState<number>(0);

  // Timeline base date (starts from today + offset)
  const baseDate = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + timelineOffsetDays);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now, timelineOffsetDays]);

  // Generate 7 days for the timeline header
  const timelineDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [baseDate]);

  const dateRangeLabel = useMemo(() => {
    const first = timelineDays[0];
    const last = timelineDays[timelineDays.length - 1];
    return `${first.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${last.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  }, [timelineDays]);

  // Tasks partitioned into scheduled vs unscheduled (UXR-12, TASK-17)
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled: Task[] = [];
    const unscheduled: Task[] = [];

    for (const t of tasks) {
      const hasSession = workSessions.some(s => s.taskId === t.id);
      if (t.dueAt || hasSession) {
        scheduled.push(t);
      } else {
        unscheduled.push(t);
      }
    }
    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasks, workSessions]);

  const isToday = (d: Date) => d.toDateString() === now.toDateString();

  if (tasks.length === 0) {
    return (
      <div
        style={{
          border: '1px solid var(--hairline)',
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
        {/* Miniature Showcase Demo Card (Recipe 2 Stageshow) */}
        <div
          style={{
            width: '280px',
            padding: '16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md, 10px)',
            border: '1px solid var(--hairline)',
            background: 'var(--surface-ground, #f4f4f5)',
            boxShadow: 'var(--shadow-sm)',
            opacity: 0.95,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: '1px solid var(--hairline)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.75)',
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.75)',
                }}
              />
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.75)',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--ink-muted)',
                fontFamily: 'monospace',
              }}
            >
              tasks/gantt
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--surface-raised, #ffffff)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
              }}
            >
              <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--ink-title)',
                  }}
                >
                  Chuẩn bị báo cáo đồ án
                </span>
                <span style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>
                  Hạn chót: 17:00 hôm nay
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--surface-raised, #ffffff)',
                opacity: 0.5,
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  background: 'var(--ink-faint)',
                }}
              />
              <div
                style={{
                  width: '110px',
                  height: '10px',
                  borderRadius: '3px',
                  background: 'var(--ink-faint)',
                }}
              />
            </div>
          </div>
        </div>

        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--ink-title)',
            marginBottom: '4px',
          }}
        >
          Chưa có công việc trong tiến độ Gantt
        </h3>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--ink-subtle)',
            maxWidth: '380px',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Tạo công việc và thiết lập thời hạn hoặc buổi làm việc để theo dõi trực quan theo dòng thời gian.
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
              color: '#ffffff',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Timeline Controls (UXR-10) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--surface-ground, #f4f4f5)',
          borderRadius: 'var(--radius-sm, 6px)',
          border: '1px solid var(--hairline)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() =>
              setTimelineOffsetDays(prev => prev - (zoomMode === 'day' ? 3 : 7))
            }
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ChevronLeft size={13} />
            <span>Trước</span>
          </button>
          <button
            type="button"
            onClick={() => setTimelineOffsetDays(0)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-title)',
              cursor: 'pointer',
            }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() =>
              setTimelineOffsetDays(prev => prev + (zoomMode === 'day' ? 3 : 7))
            }
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--hairline)',
              background: 'var(--surface-raised, #ffffff)',
              color: 'var(--ink-body)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Sau</span>
            <ChevronRight size={13} />
          </button>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-title)',
              marginLeft: '8px',
            }}
          >
            {dateRangeLabel}
          </span>
        </div>

        {/* Day / Week Switcher */}
        <div
          style={{
            display: 'inline-flex',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid var(--hairline)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setZoomMode('day')}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              border: 'none',
              background:
                zoomMode === 'day'
                  ? 'var(--accent)'
                  : 'var(--surface-raised, #ffffff)',
              color: zoomMode === 'day' ? '#ffffff' : 'var(--ink-body)',
              cursor: 'pointer',
              fontWeight: zoomMode === 'day' ? 600 : 400,
            }}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('week')}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              border: 'none',
              borderLeft: '1px solid var(--hairline)',
              background:
                zoomMode === 'week'
                  ? 'var(--accent)'
                  : 'var(--surface-raised, #ffffff)',
              color: zoomMode === 'week' ? '#ffffff' : 'var(--ink-body)',
              cursor: 'pointer',
              fontWeight: zoomMode === 'week' ? 600 : 400,
            }}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Main Gantt Grid (UXR-11) */}
      <div
        style={{
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-md, 8px)',
          overflowX: 'auto',
          background: 'var(--surface-raised, #ffffff)',
          boxShadow: 'var(--shadow-raised)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '700px',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'var(--surface-ground, #f4f4f5)',
                borderBottom: '1px solid var(--hairline)',
              }}
            >
              <th
                style={{
                  width: '280px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--ink-muted)',
                }}
              >
                Tên công việc
              </th>
              {timelineDays.map(d => (
                <th
                  key={d.toISOString()}
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderLeft: '1px solid var(--hairline)',
                    background: isToday(d)
                      ? 'rgba(37, 99, 235, 0.04)'
                      : 'transparent',
                    color: isToday(d) ? 'var(--accent)' : 'var(--ink-muted)',
                    fontWeight: isToday(d) ? 700 : 500,
                  }}
                >
                  <div>
                    {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: isToday(d)
                        ? 'var(--accent)'
                        : 'var(--ink-subtle)',
                    }}
                  >
                    {d.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduledTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--ink-muted)',
                    fontSize: '12px',
                  }}
                >
                  Không có công việc nào có lịch trong khoảng thời gian này.
                </td>
              </tr>
            ) : (
              scheduledTasks.map(task => {
                const isSelected = task.id === selectedTaskId;
                const sessionsForTask = workSessions.filter(
                  s => s.taskId === task.id,
                );

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{
                      borderBottom: '1px solid var(--hairline)',
                      background: isSelected
                        ? 'rgba(37, 99, 235, 0.05)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition:
                        'background var(--transition-fast, 0.16s ease)',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        borderRight: '1px solid var(--hairline)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background:
                              task.importance === 'high'
                                ? 'var(--danger)'
                                : task.importance === 'medium'
                                ? 'var(--warning)'
                                : 'var(--success)',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color:
                              task.status === 'done'
                                ? 'var(--ink-muted)'
                                : 'var(--ink-title)',
                            textDecoration:
                              task.status === 'done'
                                ? 'line-through'
                                : 'none',
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {timelineDays.map(d => {
                      const dayStr = d.toISOString().slice(0, 10);
                      const isDueOnDay = task.dueAt?.slice(0, 10) === dayStr;
                      const sessionOnDay = sessionsForTask.find(
                        s => s.startAt.slice(0, 10) === dayStr,
                      );

                      return (
                        <td
                          key={dayStr}
                          style={{
                            padding: '6px',
                            borderLeft: '1px solid var(--hairline)',
                            verticalAlign: 'middle',
                            background: isToday(d)
                              ? 'rgba(37, 99, 235, 0.02)'
                              : 'transparent',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              alignItems: 'center',
                            }}
                          >
                            {isDueOnDay && (
                              <div
                                style={{
                                  background:
                                    task.status === 'done'
                                      ? 'var(--success)'
                                      : 'var(--danger)',
                                  color: '#fff',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  width: '90%',
                                  textAlign: 'center',
                                  boxShadow: 'var(--shadow-sm)',
                                }}
                                title={`Hạn chót: ${task.dueAt}`}
                              >
                                Hạn: {task.dueAt?.slice(11, 16)}
                              </div>
                            )}

                            {sessionOnDay && (
                              <div
                                style={{
                                  background: 'var(--surface-raised, #ffffff)',
                                  color: sessionOnDay.isLate
                                    ? 'var(--danger)'
                                    : 'var(--accent)',
                                  border: sessionOnDay.isLate
                                    ? '1px dashed var(--danger)'
                                    : '1px dashed var(--accent)',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  width: '90%',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '3px',
                                }}
                                title={`Buổi làm riêng${sessionOnDay.isLate ? ' (Làm muộn)' : ''}`}
                              >
                                <Clock size={10} />
                                <span>
                                  {sessionOnDay.isLate
                                    ? 'Làm muộn'
                                    : 'Buổi làm'}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Unscheduled Tasks Section (UXR-12, TASK-17) */}
      {unscheduledTasks.length > 0 && (
        <div
          style={{
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'var(--surface-raised, #ffffff)',
            padding: '14px',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink-muted)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ClipboardList size={14} />
              <span>Chưa có mốc thời gian ({unscheduledTasks.length})</span>
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 400,
                color: 'var(--ink-faint)',
              }}
            >
              (Bấm vào công việc để xem chi tiết hoặc đặt hạn)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '8px',
            }}
          >
            {unscheduledTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border:
                    task.id === selectedTaskId
                      ? '1px solid var(--accent)'
                      : '1px solid var(--hairline)',
                  background:
                    task.id === selectedTaskId
                      ? 'rgba(37, 99, 235, 0.05)'
                      : 'var(--surface-ground, #f4f4f5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'border 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background:
                        task.importance === 'high'
                          ? 'var(--danger)'
                          : task.importance === 'medium'
                          ? 'var(--warning)'
                          : 'var(--success)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--ink-title)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--ink-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {task.importance === 'high'
                    ? 'Cao'
                    : task.importance === 'medium'
                    ? 'Vừa'
                    : 'Thấp'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
