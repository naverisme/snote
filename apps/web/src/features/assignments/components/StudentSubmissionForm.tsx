import React, { useState } from 'react';
import type { Submission, SubmissionInput } from '../types';

export interface StudentSubmissionFormProps {
  recipientId: string;
  currentVersion?: number;
  onSubmitted: (submission: Submission) => void;
  onSubmitApi: (
    recipientId: string,
    input: SubmissionInput,
    options: { idempotencyKey: string; etag?: string }
  ) => Promise<Submission>;
  onRefreshLatest?: () => void;
}

export const StudentSubmissionForm: React.FC<StudentSubmissionFormProps> = ({
  recipientId,
  currentVersion = 0,
  onSubmitted,
  onSubmitApi,
  onRefreshLatest,
}) => {
  const [text, setText] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'conflict'; message: string } | null>(null);

  // Generate unique client idempotency key per intent (EC-05)
  const generateIdempotencyKey = () => {
    return 'sub-key-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
  };

  const handleAddLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const handleLinkChange = (index: number, value: string) => {
    setLinks(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLinks = links.map(l => l.trim()).filter(l => l.length > 0);
    const validText = text.trim();
    const validUploads = uploadIds.filter(u => u.trim().length > 0);

    // ASG-14: At least one content type must be provided
    if (!validText && validLinks.length === 0 && validUploads.length === 0) {
      setStatusMessage({
        type: 'error',
        message: 'Bản nộp cần ít nhất một nội dung (văn bản, đường dẫn hoặc tệp).',
      });
      return;
    }

    const input: SubmissionInput = {
      text: validText || undefined,
      links: validLinks.length > 0 ? validLinks : undefined,
      uploadIds: validUploads.length > 0 ? validUploads : undefined,
    };

    const idempotencyKey = generateIdempotencyKey();
    const etag = currentVersion > 0 ? `"${currentVersion}"` : undefined;

    try {
      setSubmitting(true);
      setStatusMessage({ type: 'success', message: 'Đang xác nhận bản nộp...' });

      const result = await onSubmitApi(recipientId, input, {
        idempotencyKey,
        etag,
      });

      setStatusMessage({
        type: 'success',
        message: `Đã nộp thành công! Phiên bản ${result.version} (${result.timeliness === 'on_time' ? 'Đúng hạn' : 'Nộp muộn'}) lúc ${new Date(result.acceptedAt).toLocaleTimeString()}.`,
      });

      onSubmitted(result);
      setText('');
      setLinks(['']);
      setUploadIds([]);
    } catch (err: any) {
      if (err?.code === 'VERSION_CONFLICT' || err?.status === 412) {
        setStatusMessage({
          type: 'conflict',
          message: 'Phiên bản hiện hành đã được cập nhật bởi thành viên khác. Vui lòng tải lại và xem bản mới trước khi gửi lại (ASG-12).',
        });
      } else if (err?.code === 'LATE_SUBMISSION_LOCKED' || err?.code === 'LATE_REVISION_LOCKED' || err?.status === 403) {
        setStatusMessage({
          type: 'error',
          message: 'Bài giao đã quá hạn và bị khóa nộp theo quy định.',
        });
      } else if (err?.code === 'IDEMPOTENCY_CONFLICT' || err?.status === 409) {
        setStatusMessage({
          type: 'error',
          message: 'Mã thao tác nộp bài bị xung đột. Vui lòng thử lại.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          message: err?.message || 'Có lỗi xảy ra khi nộp bài.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRevision = currentVersion > 0;

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', color: '#111827' }}>
        {isRevision ? `Gửi phiên bản sửa đổi (hiện tại: v${currentVersion})` : 'Nộp bài lần đầu'}
      </h3>

      {statusMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            backgroundColor:
              statusMessage.type === 'success'
                ? '#f0fdf4'
                : statusMessage.type === 'conflict'
                ? '#fffbeb'
                : '#fef2f2',
            color:
              statusMessage.type === 'success'
                ? '#15803d'
                : statusMessage.type === 'conflict'
                ? '#b45309'
                : '#b91c1c',
            border: `1px solid ${
              statusMessage.type === 'success'
                ? '#bbf7d0'
                : statusMessage.type === 'conflict'
                ? '#fde68a'
                : '#fecaca'
            }`,
          }}
        >
          <div>{statusMessage.message}</div>
          {statusMessage.type === 'conflict' && onRefreshLatest && (
            <button
              type="button"
              onClick={onRefreshLatest}
              style={{
                marginTop: '8px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#b45309',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Tải lại bản mới nhất
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label htmlFor="submission-text" style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
            Nội dung báo cáo / ghi chú văn bản
          </label>
          <textarea
            id="submission-text"
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Nhập nội dung giải trình hoặc mô tả sản phẩm..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
            Đường dẫn đính kèm (Repository / Báo cáo online)
          </label>
          {links.map((link, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="url"
                value={link}
                onChange={e => handleLinkChange(idx, e.target.value)}
                placeholder="https://github.com/..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  aria-label="Xóa đường dẫn"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddLink}
            style={{
              background: 'none',
              border: '1px dashed #d1d5db',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#4b5563',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            + Thêm đường dẫn
          </button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
            Mã định danh tệp tải lên (uploadIds - tối đa 25MB/tệp)
          </label>
          <input
            type="text"
            placeholder="VD: blob-uuid-1, blob-uuid-2"
            value={uploadIds.join(', ')}
            onChange={e => setUploadIds(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
            Nhập các mã blob đã tải lên từ Thư viện / Upload staging.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          {/* ASG-18: Bản đầu không có nút Thu hồi bản nộp */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 20px',
              backgroundColor: submitting ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Đang xác nhận...' : isRevision ? 'Gửi phiên bản mới' : 'Xác nhận nộp bài'}
          </button>
        </div>
      </form>
    </div>
  );
};
