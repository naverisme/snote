import React, { useState } from 'react';
import { Award, Users, CheckCircle2, Clock, AlertCircle, FileText, Send, Check } from 'lucide-react';

interface GroupProgress {
  id: string;
  name: string;
  tasksDone: number;
  tasksTotal: number;
  checklistDone: number;
  checklistTotal: number;
  submissionStatus: 'submitted_on_time' | 'submitted_late' | 'not_submitted';
  version: number;
  grade?: string;
}

const GROUPS_PROGRESS: GroupProgress[] = [
  { id: 'g-1', name: 'Nhóm 01 - AI & Data Platform', tasksDone: 5, tasksTotal: 5, checklistDone: 14, checklistTotal: 15, submissionStatus: 'submitted_on_time', version: 2, grade: '9.5 / 10' },
  { id: 'g-2', name: 'Nhóm 02 - Web Collaboration Engine', tasksDone: 4, tasksTotal: 5, checklistDone: 12, checklistTotal: 15, submissionStatus: 'submitted_on_time', version: 1, grade: 'Chưa chấm' },
  { id: 'g-3', name: 'Nhóm 03 - Cloud Microservices', tasksDone: 2, tasksTotal: 5, checklistDone: 8, checklistTotal: 15, submissionStatus: 'submitted_late', version: 1, grade: 'Chưa chấm' },
  { id: 'g-4', name: 'Nhóm 04 - Mobile Native Client', tasksDone: 1, tasksTotal: 5, checklistDone: 4, checklistTotal: 15, submissionStatus: 'not_submitted', version: 0, grade: 'Chưa nộp' },
];

export const Tab12AssignmentsTeacher: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupProgress>(GROUPS_PROGRESS[0]);
  const [feedbackText, setFeedbackText] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Assignment Header */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--text-primary)', color: 'var(--bg-app)', fontWeight: 700 }}>
            Giáo viên đánh giá (CUXD-03)
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hạn chót: 23:59, 15/11/2026</span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Đồ án Chuyên ngành: Xây dựng Hệ thống SNOTE v2
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Yêu cầu: Hoàn thành thiết kế hệ thống, hợp đồng OpenAPI, kiểm thử tự động đạt 100% test suites và cấu hình Docker Compose cho production.
        </p>
      </div>

      {/* 3-Axis Progress Tracking Matrix (CUXD-03) */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Ma trận theo dõi tiến độ 3 trục các nhóm nhận bài (ASG-02)
          </h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 20px', fontWeight: 500 }}>Nhóm học tập</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Trục 1: Công việc</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Trục 2: Checklist</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Trục 3: Tình trạng nộp</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Điểm số</th>
              <th style={{ padding: '12px 20px', fontWeight: 500, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS_PROGRESS.map(g => (
              <tr
                key={g.id}
                onClick={() => setSelectedGroup(g)}
                style={{
                  borderBottom: '1px solid var(--border-divider)',
                  background: selectedGroup.id === g.id ? 'var(--surface-hover)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {g.name}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {g.tasksDone}/{g.tasksTotal} việc ({Math.round((g.tasksDone / g.tasksTotal) * 100)}%)
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {g.checklistDone}/{g.checklistTotal} mục ({Math.round((g.checklistDone / g.checklistTotal) * 100)}%)
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {g.submissionStatus === 'submitted_on_time' ? (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Đúng hạn (v{g.version})
                    </span>
                  ) : g.submissionStatus === 'submitted_late' ? (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', fontWeight: 600, color: 'rgba(248, 113, 113, 0.9)' }}>
                      Nộp muộn (v{g.version})
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chưa nộp</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {g.grade}
                </td>
                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                  <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '11px', padding: '3px 10px' }}>
                    Chấm điểm
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Group Evaluation Panel */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
          Đánh giá & Nhận xét cho: {selectedGroup.name}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nhập điểm số (0 - 10)</label>
            <input
              type="text"
              placeholder="vd: 9.5"
              value={gradeInput}
              onChange={e => setGradeInput(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nhận xét phiên bản nộp</label>
            <input
              type="text"
              placeholder="vd: Cần bổ sung thêm tài liệu API và test coverage..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', color: 'var(--text-primary)', fontSize: '13px' }}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            showNotice(`Đã lưu điểm và nhận xét cho ${selectedGroup.name}`);
            setGradeInput('');
            setFeedbackText('');
          }}
        >
          Lưu đánh giá
        </button>
      </div>
    </div>
  );
};
