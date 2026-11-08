import React, { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { Task, WorkSessionViewModel } from './types';

interface TaskGanttViewProps {
  tasks: Task[];
  workSessions: WorkSessionViewModel[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  now?: Date;
}

export const TaskGanttView: React.FC<TaskGanttViewProps> = ({
  tasks,
  workSessions,
  onSelectTask,
  selectedTaskId,
  now = new Date(),
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Timeline Controls (UXR-10) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f6f8fa', borderRadius: '6px', border: '1px solid #d0d7de' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setTimelineOffsetDays(prev => prev - (zoomMode === 'day' ? 3 : 7))}
            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            ← Trước
          </button>
          <button
            type="button"
            onClick={() => setTimelineOffsetDays(0)}
            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setTimelineOffsetDays(prev => prev + (zoomMode === 'day' ? 3 : 7))}
            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d0d7de', background: '#fff', cursor: 'pointer' }}
          >
            Sau →
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#24292f', marginLeft: '8px' }}>
            {dateRangeLabel}
          </span>
        </div>

        {/* Day / Week Switcher */}
        <div style={{ display: 'inline-flex', borderRadius: '6px', border: '1px solid #d0d7de', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => setZoomMode('day')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: 'none',
              background: zoomMode === 'day' ? '#0969da' : '#fff',
              color: zoomMode === 'day' ? '#fff' : '#24292f',
              cursor: 'pointer',
            }}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => setZoomMode('week')}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              border: 'none',
              borderLeft: '1px solid #d0d7de',
              background: zoomMode === 'week' ? '#0969da' : '#fff',
              color: zoomMode === 'week' ? '#fff' : '#24292f',
              cursor: 'pointer',
            }}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Main Gantt Grid (UXR-11) */}
      <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', overflowX: 'auto', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#f6f8fa', borderBottom: '1px solid #d0d7de' }}>
              <th style={{ width: '280px', padding: '10px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#57606a' }}>
                Tên công việc
              </th>
              {timelineDays.map(d => (
                <th
                  key={d.toISOString()}
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    borderLeft: '1px solid #e1e4e8',
                    background: isToday(d) ? '#ddf4ff' : 'transparent',
                    color: isToday(d) ? '#0969da' : '#57606a',
                    fontWeight: isToday(d) ? 700 : 500,
                  }}
                >
                  <div>{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                  <div>{d.toLocaleDateString('vi-VN', { day: '2-digit' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduledTasks.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#57606a', fontSize: '13px' }}>
                  Không có công việc có mốc thời gian trong khoảng này.
                </td>
              </tr>
            ) : (
              scheduledTasks.map(task => {
                const isSelected = task.id === selectedTaskId;
                const isPastDue = Boolean(task.dueAt && new Date(task.dueAt).getTime() < now.getTime() && task.status !== 'done');
                const taskSessions = workSessions.filter(s => s.taskId === task.id);

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{
                      borderBottom: '1px solid #eaeef2',
                      background: isSelected ? '#f1f8ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#24292f' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: task.importance === 'high' ? '#cf222e' : task.importance === 'medium' ? '#d4a72c' : '#1a7f37',
                          }}
                          title={`Mức: ${task.importance}`}
                        />
                        <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#57606a' : '#24292f' }}>
                          {task.title}
                        </span>
                        {isPastDue && (
                          <span style={{ fontSize: '10px', background: '#ffebe9', color: '#cf222e', border: '1px solid #ff8182', padding: '1px 5px', borderRadius: '10px', fontWeight: 600 }}>
                            Quá hạn
                          </span>
                        )}
                        {task.status === 'done' && (
                          <span style={{ fontSize: '10px', background: '#dafbe1', color: '#1a7f37', border: '1px solid #8ce8a2', padding: '1px 5px', borderRadius: '10px', fontWeight: 600 }}>
                            Xong
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Timeline Day Columns */}
                    {timelineDays.map(day => {
                      const dayStr = day.toISOString().slice(0, 10);
                      const isDueOnDay = task.dueAt && task.dueAt.slice(0, 10) === dayStr;
                      const sessionOnDay = taskSessions.find(s => s.startAt.slice(0, 10) === dayStr);

                      return (
                        <td
                          key={dayStr}
                          style={{
                            padding: '6px',
                            borderLeft: '1px solid #f0f2f5',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            background: isToday(day) ? 'rgba(221, 244, 255, 0.3)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                            {isDueOnDay && (
                              <div
                                style={{
                                  background: isPastDue ? '#cf222e' : '#0969da',
                                  color: '#fff',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  width: '90%',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={`Hạn chót: ${task.dueAt}`}
                              >
                                Hạn: {task.dueAt?.slice(11, 16)}
                              </div>
                            )}

                            {sessionOnDay && (
                              <div
                                style={{
                                  background: '#fff',
                                  color: sessionOnDay.isLate ? '#cf222e' : '#6f42c1',
                                  border: sessionOnDay.isLate ? '1px dashed #cf222e' : '1px dashed #6f42c1',
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  width: '90%',
                                }}
                                title={`Buổi làm riêng${sessionOnDay.isLate ? ' (Làm muộn)' : ''}`}
                              >
                                ⌛ {sessionOnDay.isLate ? 'Làm muộn' : 'Buổi làm'}
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
        <div style={{ border: '1px solid #d0d7de', borderRadius: '6px', background: '#fff', padding: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#57606a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={14} />
              <span>Chưa có mốc thời gian ({unscheduledTasks.length})</span>
            </span>
            <span style={{ fontSize: '11px', fontWeight: 400, color: '#8c959f' }}>
              (Bấm vào công việc để xem chi tiết hoặc đặt hạn)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
            {unscheduledTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: task.id === selectedTaskId ? '1px solid #0969da' : '1px solid #e1e4e8',
                  background: task.id === selectedTaskId ? '#f1f8ff' : '#f6f8fa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: task.importance === 'high' ? '#cf222e' : task.importance === 'medium' ? '#d4a72c' : '#1a7f37',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#24292f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: '#57606a', textTransform: 'capitalize' }}>
                  {task.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
