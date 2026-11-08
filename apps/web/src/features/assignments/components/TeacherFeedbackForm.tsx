import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export interface TeacherFeedbackFormProps {
  submissionId: string;
  onSubmitFeedback: (submissionId: string, text: string) => Promise<void>;
}

export const TeacherFeedbackForm: React.FC<TeacherFeedbackFormProps> = ({
  submissionId,
  onSubmitFeedback,
}) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitFeedback(submissionId, text.trim());
      setText('');
    } catch (err: any) {
      setError(err?.message || 'Có lỗi khi gửi nhận xét.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px', borderTop: '1px solid var(--hairline)', paddingTop: '12px' }}>
      <label
        htmlFor={`fb-${submissionId}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '6px',
          color: 'var(--ink-title)',
        }}
      >
        <MessageSquare size={13} style={{ color: 'var(--ink-muted)' }} />
        <span>Thêm nhận xét của giáo viên cho phiên bản này (ASG-09)</span>
      </label>
      {error && (
        <div style={{ fontSize: '12px', color: 'var(--danger)', marginBottom: '6px' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          id={`fb-${submissionId}`}
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Nhập nhận xét đánh giá, góp ý chỉnh sửa cho học sinh..."
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            color: 'var(--ink-body)',
            backgroundColor: 'var(--surface-raised)',
            boxSizing: 'border-box',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
          }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{
            padding: '0 16px',
            backgroundColor: submitting || !text.trim() ? 'var(--ink-faint)' : 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'stretch',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-raised)',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <Send size={14} />
          <span>{submitting ? '...' : 'Gửi'}</span>
        </button>
      </div>
    </form>
  );
};
