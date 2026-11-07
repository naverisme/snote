import React, { useState } from 'react';

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
    <form onSubmit={handleSubmit} style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
      <label htmlFor={`fb-${submissionId}`} style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
        Nhận xét của giáo viên cho phiên bản này (ASG-09)
      </label>
      {error && <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          id={`fb-${submissionId}`}
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Nhập nhận xét đánh giá..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{
            padding: '0 16px',
            backgroundColor: submitting || !text.trim() ? '#93c5fd' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
            alignSelf: 'stretch',
          }}
        >
          {submitting ? '...' : 'Gửi'}
        </button>
      </div>
    </form>
  );
};
