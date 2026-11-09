import React, { useState } from 'react';
import { GanttChart, Calendar, CheckSquare, Plus, Clock, Filter, AlertCircle, Check } from 'lucide-react';

interface MockTask {
  id: string;
  title: string;
  startDay: number;
  durationDays: number;
  status: 'done' | 'in_progress' | 'pending';
  assignee: string;
  checklistTotal: number;
  checklistDone: number;
}

const GANTT_TASKS: MockTask[] = [
  { id: 't-1', title: 'Thu thập yêu cầu & Thiết kế Kiến trúc SNOTE v2', startDay: 1, durationDays: 5, status: 'done', assignee: 'Lê Hoàng Nam', checklistTotal: 5, checklistDone: 5 },
  { id: 't-2', title: 'Đặc tả OpenAPI Contracts & DTOs', startDay: 4, durationDays: 4, status: 'done', assignee: 'Trần Thị Mai', checklistTotal: 4, checklistDone: 4 },
  { id: 't-3', title: 'Triển khai Core Engine & Auth Gatekeeper', startDay: 7, durationDays: 6, status: 'in_progress', assignee: 'Nguyễn Văn Minh', checklistTotal: 6, checklistDone: 4 },
  { id: 't-4', title: 'Xây dựng UI Web Shell & 14 Viewports', startDay: 10, durationDays: 7, status: 'in_progress', assignee: 'Phạm Quỳnh Anh', checklistTotal: 8, checklistDone: 5 },
  { id: 't-5', title: 'Kiểm thử E2E & Tối ưu WCAG AA Contrast', startDay: 15, durationDays: 5, status: 'pending', assignee: 'Đỗ Quốc Bảo', checklistTotal: 4, checklistDone: 0 },
  { id: 't-6', title: 'Nghiệm thu Đồ án & Đóng gói Docker', startDay: 18, durationDays: 4, status: 'pending', assignee: 'Lê Hoàng Nam', checklistTotal: 3, checklistDone: 0 },
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 1);

export const Tab08TasksGantt: React.FC = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('t-3');
  const [notice, setNotice] = useState<string | null>(null);

  const selectedTask = GANTT_TASKS.find(t => t.id === selectedTaskId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Toolbar */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GanttChart size={18} style={{ color: 'var(--text-primary)' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Tiến độ công việc theo dòng thời gian (UXR-11)
          </h2>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
            Gantt Mode • 160ms Transition
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* Gantt Matrix Container */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflowX: 'auto', padding: '16px 20px' }}>
        {/* Timeline Header (Days 1 to 22) */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px repeat(22, 32px)', borderBottom: '1px solid var(--border-divider)', paddingBottom: '10px', minWidth: '960px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Công việc & Người nhận</div>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: d === 12 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: d === 12 ? 700 : 400 }}>
              {d === 12 ? `N${d}*` : `N${d}`}
            </div>
          ))}
        </div>

        {/* Task Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', minWidth: '960px' }}>
          {GANTT_TASKS.map(task => {
            const isSelected = selectedTaskId === task.id;
            const leftCol = task.startDay;
            const spanCols = task.durationDays;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '260px repeat(22, 32px)',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderRadius: '6px',
                  background: isSelected ? 'var(--surface-hover)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 140ms ease',
                }}
              >
                {/* Task Label Col */}
                <div style={{ paddingRight: '12px', overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {task.assignee} • {task.checklistDone}/{task.checklistTotal} mục
                  </div>
                </div>

                {/* Timeline Bar Col */}
                <div style={{ gridColumn: `${leftCol + 1} / span ${spanCols}`, height: '22px', borderRadius: '4px', background: task.status === 'done' ? 'var(--text-primary)' : task.status === 'in_progress' ? 'var(--surface-card)' : 'var(--surface-hover)', border: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', padding: '0 8px', color: task.status === 'done' ? 'var(--bg-app)' : 'var(--text-primary)', fontSize: '11px', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', boxShadow: isSelected ? '0 0 0 1px var(--text-primary)' : 'none' }}>
                  <span>{task.durationDays} ngày</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Task Details Drawer preview */}
      {selectedTask && (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Chi tiết công việc đang chọn (UXR-12)</div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0' }}>{selectedTask.title}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Phụ trách: <strong>{selectedTask.assignee}</strong> • Tiến độ checklist: <strong>{selectedTask.checklistDone}/{selectedTask.checklistTotal}</strong> • Trạng thái: {selectedTask.status === 'done' ? 'Hoàn thành' : selectedTask.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setNotice('Đã mở toàn phần ngăn kéo chi tiết')}>
            Mở toàn phần Drawer
          </button>
        </div>
      )}
    </div>
  );
};
