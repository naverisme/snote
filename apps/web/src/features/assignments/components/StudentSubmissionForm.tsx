import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import type { Submission, SubmissionInput } from '../types';
import { libraryApi } from '../../library';
import { getCsrfToken } from '../../../shared/api';

export interface StudentSubmissionFormProps {
  recipientId: string;
  workspaceId: string;
  currentVersion?: number;
  onSubmitted: (submission: Submission) => void;
  onSubmitApi: (
    recipientId: string,
    input: SubmissionInput,
    options: { idempotencyKey: string; etag?: string }
  ) => Promise<Submission>;
  onRefreshLatest?: () => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
}

export const StudentSubmissionForm: React.FC<StudentSubmissionFormProps> = ({
  recipientId,
  workspaceId,
  currentVersion = 0,
  onSubmitted,
  onSubmitApi,
  onRefreshLatest,
}) => {
  const [text, setText] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'conflict' | 'pending' | 'unknown'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

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

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadFailed(false);
    let failedCount = 0;
    let uploadedCount = 0;
    for (const file of Array.from(files)) {
      if (file.size > 25 * 1024 * 1024) {
        setUploadFailed(true);
        failedCount += 1;
        continue;
      }
      setUploadingFiles(prev => [...prev, file.name]);
      try {
        const requestOptions = { csrfToken: getCsrfToken() };
        const staged = await libraryApi.startUpload({
          fileName: file.name,
          size: file.size,
          declaredType: file.type || 'application/octet-stream',
          scopeType: 'workspace',
          scopeId: workspaceId,
        }, requestOptions);
        const verified = await libraryApi.uploadContent(staged.id, file, requestOptions);
        if (verified.status !== 'verified') throw new Error('Tệp chưa được xác nhận.');
        setAttachedFiles(prev => [...prev, { id: staged.id, name: file.name, size: file.size }]);
        setUploadIds(prev => [...prev, staged.id]);
        uploadedCount += 1;
      } catch {
        setUploadFailed(true);
        failedCount += 1;
      } finally {
        setUploadingFiles(prev => {
          const index = prev.indexOf(file.name);
          return index < 0 ? prev : prev.filter((_, i) => i !== index);
        });
      }
    }
    setStatusMessage(failedCount > 0
      ? { type: 'error', message: `${failedCount} tệp chưa tải được hoặc vượt quá 25 MB. Chọn lại tệp trước khi nộp.` }
      : { type: 'success', message: `${uploadedCount} tệp đã tải xong. Xác nhận nộp bài để lưu phiên bản.` });
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
    setUploadIds(prev => prev.filter(uid => uid !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || uploadingFiles.length > 0) return;
    if (uploadFailed) {
      setStatusMessage({ type: 'error', message: 'Có tệp tải lên chưa thành công. Chọn lại tệp trước khi nộp.' });
      return;
    }

    const validLinks = links.map(l => l.trim()).filter(l => l.length > 0);
    const validText = text.trim();
    const validUploads = uploadIds.filter(u => u.trim().length > 0);

    // ASG-14: At least one content type must be provided
    if (!validText && validLinks.length === 0 && validUploads.length === 0) {
      setStatusMessage({
        type: 'error',
        message: 'Bản nộp cần ít nhất một nội dung (văn bản, đường dẫn hoặc tệp đính kèm).',
      });
      return;
    }

    const input: SubmissionInput = {
      text: validText || undefined,
      links: validLinks.length > 0 ? validLinks : undefined,
      uploadIds: validUploads.length > 0 ? validUploads : undefined,
    };

    const fingerprint = JSON.stringify({ recipientId, currentVersion, input });
    const idempotencyKey = pendingIntentRef.current?.fingerprint === fingerprint
      ? pendingIntentRef.current.key
      : generateIdempotencyKey();
    pendingIntentRef.current = { fingerprint, key: idempotencyKey };
    const etag = currentVersion > 0 ? `"${currentVersion}"` : undefined;

    try {
      setSubmitting(true);
      setStatusMessage({ type: 'pending', message: 'Đang xác nhận bản nộp...' });

      const result = await onSubmitApi(recipientId, input, {
        idempotencyKey,
        etag,
      });

      setStatusMessage({
        type: 'success',
        message: `Đã nộp thành công! Phiên bản ${result.version} (${result.timeliness === 'on_time' ? 'Đúng hạn' : 'Nộp muộn'}) lúc ${new Date(result.acceptedAt).toLocaleTimeString('vi-VN')}.`,
      });

      onSubmitted(result);
      pendingIntentRef.current = null;
      setText('');
      setLinks(['']);
      setUploadIds([]);
      setAttachedFiles([]);
    } catch (err: any) {
      if (err?.code === 'VERSION_CONFLICT' || err?.status === 412) {
        setStatusMessage({
          type: 'conflict',
          message: 'Bản nộp đã có phiên bản mới. Tải lại lịch sử và xem nội dung trước khi gửi tiếp.',
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
          type: 'unknown',
          message: 'Chưa rõ máy chủ đã nhận bản nộp hay chưa. Tải lại lịch sử hoặc thử lại với đúng nội dung hiện tại.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRevision = currentVersion > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#0f172a' }}>
            {isRevision ? `Gửi phiên bản sửa đổi (hiện tại: v${currentVersion})` : 'Nộp bài lần đầu'}
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'block' }}>
            Nộp báo cáo, đường dẫn tài liệu hoặc đính kèm tệp sản phẩm
          </span>
        </div>
        {isRevision && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            Đang ở v{currentVersion}
          </span>
        )}
      </div>

      {statusMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            backgroundColor:
              statusMessage.type === 'success'
                ? '#f0fdf4'
                : statusMessage.type === 'conflict' || statusMessage.type === 'unknown'
                ? '#fffbeb'
                : statusMessage.type === 'pending'
                ? '#eff6ff'
                : '#fef2f2',
            color:
              statusMessage.type === 'success'
                ? '#166534'
                : statusMessage.type === 'conflict' || statusMessage.type === 'unknown'
                ? '#92400e'
                : statusMessage.type === 'pending'
                ? '#1d4ed8'
                : '#991b1b',
            border: `1px solid ${
              statusMessage.type === 'success'
                ? '#bbf7d0'
                : statusMessage.type === 'conflict' || statusMessage.type === 'unknown'
                ? '#fde68a'
                : statusMessage.type === 'pending'
                ? '#bfdbfe'
                : '#fecaca'
            }`,
          }}
        >
          <div>{statusMessage.message}</div>
          {(statusMessage.type === 'conflict' || statusMessage.type === 'unknown') && onRefreshLatest && (
            <button
              type="button"
              onClick={onRefreshLatest}
              style={{
                marginTop: '8px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#92400e',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Tải lại bản mới nhất
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Text Area */}
        <div>
          <label
            htmlFor="submission-text"
            style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}
          >
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
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              boxSizing: 'border-box',
              resize: 'vertical',
              outline: 'none',
              color: '#0f172a',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        {/* Links input */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
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
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  aria-label="Xóa đường dẫn"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
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
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>+</span> Thêm đường dẫn
          </button>
        </div>

        {/* Dropzone with 1px fine dashed border */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#334155' }}>
            Tệp đính kèm sản phẩm
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => { void handleFilesSelected(e.target.files); e.target.value = ''; }}
          />

          <div
            role="button"
            tabIndex={0}
            aria-label="Chọn tệp đính kèm để tải lên"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            style={{
              border: isDragging ? '1px dashed #2563eb' : '1px dashed #cbd5e1',
              backgroundColor: isDragging ? '#f0f7ff' : '#f8fafc',
              borderRadius: '6px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 150ms ease, background-color 150ms ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#64748b' }}>
              <UploadCloud size={24} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>
              Kéo và thả tệp vào đây, hoặc <span style={{ color: '#2563eb', textDecoration: 'underline' }}>nhấn để chọn tệp</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Hỗ trợ tài liệu, mã nguồn nén hoặc bản vẽ (tối đa 25MB/tệp)
            </div>
          </div>
          {uploadingFiles.length > 0 && (
            <p role="status" style={{ marginTop: 8, color: '#475569', fontSize: 12 }}>
              Đang tải {uploadingFiles.length} tệp. Chờ xác nhận trước khi nộp.
            </p>
          )}

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {attachedFiles.map(file => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileText size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                    <span style={{ color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    {file.size > 0 && (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                        ({formatFileSize(file.size)})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Xóa tệp"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={submitting || uploadingFiles.length > 0 || uploadFailed}
            style={{
              padding: '8px 20px',
              backgroundColor: submitting ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: submitting || uploadingFiles.length > 0 || uploadFailed ? 'not-allowed' : 'pointer',
              transition: 'background-color 150ms ease',
            }}
          >
            {submitting ? 'Đang xác nhận...' : uploadingFiles.length > 0 ? 'Đang tải tệp...' : isRevision ? 'Gửi phiên bản mới' : 'Xác nhận nộp bài'}
          </button>
        </div>
      </form>
    </div>
  );
};
