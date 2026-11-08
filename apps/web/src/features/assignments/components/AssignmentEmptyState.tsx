import React from 'react';
import { Plus, ArrowRight, ClipboardCheck, Clock, CheckCircle2 } from 'lucide-react';

export interface AssignmentEmptyStateProps {
  isTeacher?: boolean;
  onCreateAssignment?: () => void;
}

export const AssignmentEmptyState: React.FC<AssignmentEmptyStateProps> = ({
  isTeacher = false,
  onCreateAssignment,
}) => {
  return (
    <div className="miniature-showcase-container">
      {/* Stageshow Miniature Demo Card (CUXD-03 Showcase) */}
      <div className="miniature-demo-card">
        <div className="miniature-card-header">
          <div className="miniature-window-dots">
            <div className="miniature-dot" style={{ backgroundColor: '#f87171' }} />
            <div className="miniature-dot" style={{ backgroundColor: '#fbbf24' }} />
            <div className="miniature-dot" style={{ backgroundColor: '#34d399' }} />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--ink-muted)', fontFamily: 'monospace' }}>
            lop_hoc / bai_giao_mau
          </span>
        </div>

        <div className="miniature-title">
          Đồ án Chuyên ngành: Xây dựng Hệ thống SNOTE v2
        </div>

        <div className="miniature-meta-row">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} style={{ color: 'var(--ink-muted)' }} />
            <span>Hạn: 23:59 Thứ Sáu</span>
          </span>
          <span>•</span>
          <span style={{ color: 'var(--success)', fontWeight: 500 }}>Nhóm 01 (Đúng hạn)</span>
        </div>

        {/* 3 independent progress tracks preview (CUXD-03) */}
        <div className="miniature-metrics-grid">
          <div className="miniature-metric-box">
            <div>Công việc</div>
            <div className="miniature-metric-val">4/5 việc (80%)</div>
          </div>
          <div className="miniature-metric-box">
            <div>Checklist</div>
            <div className="miniature-metric-val">12/15 mục (80%)</div>
          </div>
        </div>

        <div className="miniature-progress-quote">
          "Đã hoàn thành kiểm thử giao diện Zero-CLS và API contracts..."
        </div>
      </div>

      {/* Narrative & Call-to-Action */}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink-title)',
          marginBottom: '6px',
        }}
      >
        Chưa có bài giao nào trong lớp này
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--ink-subtle)',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: '20px',
        }}
      >
        {isTeacher
          ? 'Bắt đầu giao bài tập, thiết lập quyền hạn độc lập, theo dõi tiến độ ba trục và quản lý các phiên bản nộp bài của từng nhóm.'
          : 'Giáo viên chưa giao bài nào cho nhóm của bạn. Khi có bài mới, danh sách bài tập và tiến độ sẽ hiển thị tại đây.'}
      </p>

      {isTeacher && onCreateAssignment && (
        <button
          type="button"
          onClick={onCreateAssignment}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-raised)',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
        >
          <Plus size={15} />
          <span>Giao bài tập đầu tiên</span>
          <ArrowRight size={13} style={{ opacity: 0.8 }} />
        </button>
      )}
    </div>
  );
};
