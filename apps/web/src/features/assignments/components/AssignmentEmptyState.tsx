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
    <div className="miniature-showcase-container" style={{ textAlign: 'center', padding: '48px 16px' }}>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--surface-ground, #f4f4f5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--ink-muted)',
        }}
      >
        <ClipboardCheck size={22} />
      </div>

      {/* Narrative & Call-to-Action */}
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ink-title)',
          marginBottom: '6px',
        }}
      >
        Chưa có bài giao nào trong lớp này
      </h2>
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
          className="btn btn-primary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
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
