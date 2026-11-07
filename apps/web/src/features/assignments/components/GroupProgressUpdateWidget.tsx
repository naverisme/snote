import React, { useState } from 'react';

export interface GroupProgressUpdateWidgetProps {
  recipientId: string;
  currentProgressText?: string;
  currentVersion: number;
  onUpdateProgress: (recipientId: string, text: string, currentVersion: number) => Promise<void>;
}

export const GroupProgressUpdateWidget: React.FC<GroupProgressUpdateWidgetProps> = ({
  recipientId,
  currentProgressText = '',
  currentVersion,
  onUpdateProgress,
}) => {
  const [text, setText] = useState(currentProgressText);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);
      await onUpdateProgress(recipientId, text.trim(), currentVersion);
      setIsEditing(false);
      setMessage('Đã cập nhật tiến độ nhóm!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err?.message || 'Lỗi khi cập nhật tiến độ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
          Cập nhật tiến độ của nhóm (ASG-11)
        </span>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {message && (
        <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '6px' }}>{message}</div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave}>
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="VD: Đã hoàn thành 80% phần backend, đang test API..."
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
              resize: 'vertical',
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setText(currentProgressText);
                setIsEditing(false);
              }}
              style={{
                padding: '4px 10px',
                border: '1px solid #d1d5db',
                background: '#fff',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              style={{
                padding: '4px 12px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Đang lưu...' : 'Lưu tiến độ'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ fontSize: '13px', color: currentProgressText ? '#1f2937' : '#9ca3af', fontStyle: currentProgressText ? 'normal' : 'italic' }}>
          {currentProgressText || 'Chưa có thông tin cập nhật tiến độ bằng văn bản từ nhóm.'}
        </div>
      )}
    </div>
  );
};
