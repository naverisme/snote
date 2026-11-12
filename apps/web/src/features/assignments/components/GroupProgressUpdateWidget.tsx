import React, { useState } from 'react';
import { MessageSquare, Edit3, Check, X } from 'lucide-react';

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
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px', // Inset >= 12px
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MessageSquare size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-title)' }}>
            Cập nhật tiến độ của nhóm
          </span>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
            }}
          >
            <Edit3 size={12} />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--success)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Check size={13} />
          <span>{message}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave}>
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="VD: Đã hoàn thành 80% phần thiết kế, đang kiểm thử giao diện và zero CLS..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--ink-body)',
              backgroundColor: 'var(--surface-raised)',
              boxSizing: 'border-box',
              resize: 'vertical',
              marginBottom: '10px',
              outline: 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
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
                padding: '6px 12px',
                border: '1px solid var(--border-light)',
                background: 'var(--surface-ground)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--ink-subtle)',
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={13} />
              <span>{submitting ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div
          style={{
            fontSize: '13px',
            color: text ? 'var(--ink-body)' : 'var(--ink-muted)',
            fontStyle: text ? 'normal' : 'italic',
            backgroundColor: 'var(--surface-ground)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--hairline)',
            lineHeight: 1.4,
          }}
        >
          {text ? `"${text}"` : 'Chưa có cập nhật văn bản nào từ nhóm.'}
        </div>
      )}
    </div>
  );
};
