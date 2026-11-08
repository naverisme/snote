import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Link2,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Receipt,
  Plus,
} from 'lucide-react';
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

  // Status and submission receipt state
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'conflict' | 'pending' | 'unknown';
    message: string;
  } | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    submission: Submission;
    idempotencyKey: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  // Generate unique client idempotency key per intent (STR-16 / EC-05)
  const generateIdempotencyKey = () => {
    return 'sub-key-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now();
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
      // ASG-16: Maximum 25 MB/file
      if (file.size > 25 * 1024 * 1024) {
        setUploadFailed(true);
        failedCount += 1;
        continue;
      }
      setUploadingFiles(prev => [...prev, file.name]);
      try {
        const requestOptions = { csrfToken: getCsrfToken() };
        const staged = await libraryApi.startUpload(
          {
            fileName: file.name,
            size: file.size,
            declaredType: file.type || 'application/octet-stream',
            scopeType: 'workspace',
            scopeId: workspaceId,
          },
          requestOptions
        );
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

    if (failedCount > 0) {
      setStatusMessage({
        type: 'error',
        message: `${failedCount} tệp chưa tải được hoặc vượt quá 25 MB (ASG-16). Chọn lại tệp trước khi nộp.`,
      });
    } else if (uploadedCount > 0) {
      setStatusMessage({
        type: 'success',
        message: `${uploadedCount} tệp đã tải lên sẵn sàng. Hãy bấm Nộp bài để lưu phiên bản chính thức.`,
      });
    }
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
      setStatusMessage({
        type: 'error',
        message: 'Có tệp đính kèm tải lên chưa thành công (ASG-17). Vui lòng thử lại trước khi nộp.',
      });
      return;
    }

    const validLinks = links.map(l => l.trim()).filter(l => l.length > 0);
    const validText = text.trim();
    const validUploads = uploadIds.filter(u => u.trim().length > 0);

    // ASG-14 / CUXD-04: At least one content type must be provided
    if (!validText && validLinks.length === 0 && validUploads.length === 0) {
      setStatusMessage({
        type: 'error',
        message: 'Bản nộp cần ít nhất một nội dung có giá trị (văn bản, đường dẫn hoặc tệp đính kèm) theo ASG-14.',
      });
      return;
    }

    const input: SubmissionInput = {
      text: validText || undefined,
      links: validLinks.length > 0 ? validLinks : undefined,
      uploadIds: validUploads.length > 0 ? validUploads : undefined,
    };

    // STR-16: Re-use idempotency key for identical intent retry, prevent duplicate submissions
    const fingerprint = JSON.stringify({ recipientId, currentVersion, input });
    const idempotencyKey =
      pendingIntentRef.current?.fingerprint === fingerprint
        ? pendingIntentRef.current.key
        : generateIdempotencyKey();
    pendingIntentRef.current = { fingerprint, key: idempotencyKey };
    const etag = currentVersion > 0 ? `"${currentVersion}"` : undefined;

    try {
      setSubmitting(true);
      setStatusMessage({ type: 'pending', message: 'Đang xác nhận bản nộp và tạo phiên bản...' });

      const result = await onSubmitApi(recipientId, input, {
        idempotencyKey,
        etag,
      });

      // Show official submission receipt (STR-16)
      setLastReceipt({
        submission: result,
        idempotencyKey,
      });

      setStatusMessage({
        type: 'success',
        message: `Đã nộp thành công! Phiên bản v${result.version} (${result.timeliness === 'on_time' ? 'Đúng hạn' : 'Nộp muộn'}) lúc ${new Date(result.acceptedAt).toLocaleTimeString('vi-VN')}.`,
      });

      onSubmitted(result);
      pendingIntentRef.current = null;
      setText('');
      setLinks(['']);
      setUploadIds([]);
      setAttachedFiles([]);
    } catch (err: any) {
      if (err?.code === 'VERSION_CONFLICT' || err?.status === 412) {
        // CUXD-06: Version conflict while submitting — preserve form draft, prompt user to review latest
        setStatusMessage({
          type: 'conflict',
          message: 'Bản nộp đã có phiên bản mới do thành viên khác gửi trong lúc thao tác! Bản nháp của bạn vẫn được giữ nguyên. Vui lòng xem bản hiện hành trước khi quyết định gửi tiếp (CUXD-06 / ASG-12).',
        });
      } else if (
        err?.code === 'LATE_SUBMISSION_LOCKED' ||
        err?.code === 'LATE_REVISION_LOCKED' ||
        err?.status === 403
      ) {
        setStatusMessage({
          type: 'error',
          message: 'Bài giao đã quá thời hạn và bị khóa theo chính sách của lớp/bài giao (ASG-05/15).',
        });
      } else if (err?.code === 'IDEMPOTENCY_CONFLICT' || err?.status === 409) {
        setStatusMessage({
          type: 'error',
          message: 'Mã thao tác nộp bài bị xung đột. Vui lòng thử lại sau giây lát.',
        });
      } else {
        setStatusMessage({
          type: 'unknown',
          message: 'Chưa rõ máy chủ đã nhận bản nộp hay chưa (STR-16). Hãy kiểm tra lại lịch sử hoặc thử lại với đúng nội dung hiện tại.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRevision = currentVersion > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '20px', // Inset >= 12px
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      {/* Form Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--ink-title)' }}>
            {isRevision ? `Gửi phiên bản sửa đổi (hiện tại: v${currentVersion})` : 'Nộp bài lần đầu'}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--ink-subtle)', marginTop: '2px', display: 'block' }}>
            Nộp báo cáo văn bản, đường dẫn dự án hoặc đính kèm tệp sản phẩm (CUXD-04)
          </span>
        </div>
        {isRevision && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: 'var(--surface-ground)',
              color: 'var(--ink-subtle)',
              border: '1px solid var(--hairline)',
            }}
          >
            Đang ở v{currentVersion}
          </span>
        )}
      </div>

      {/* STR-16 Official Submission Receipt Box */}
      {lastReceipt && (
        <div
          role="region"
          aria-label="Biên nhận phiên bản nộp bài"
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px' }}>
              <Receipt size={16} />
              <span>Biên nhận nộp bài chính thức (STR-16)</span>
            </div>
            <button
              type="button"
              onClick={() => setLastReceipt(null)}
              aria-label="Đóng biên nhận"
              style={{
                background: 'none',
                border: 'none',
                color: '#166534',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#15803d' }}>Mã thao tác (Idempotency):</span>{' '}
              <strong style={{ fontFamily: 'monospace' }}>{lastReceipt.idempotencyKey.slice(0, 20)}...</strong>
            </div>
            <div>
              <span style={{ color: '#15803d' }}>Phiên bản ghi nhận:</span>{' '}
              <strong>v{lastReceipt.submission.version}</strong>
            </div>
            <div>
              <span style={{ color: '#15803d' }}>Thời điểm máy chủ nhận:</span>{' '}
              <strong>{new Date(lastReceipt.submission.acceptedAt).toLocaleString('vi-VN')}</strong>
            </div>
            <div>
              <span style={{ color: '#15803d' }}>Trạng thái hạn nộp:</span>{' '}
              <strong>
                {lastReceipt.submission.timeliness === 'on_time' ? 'Đúng hạn' : 'Nộp muộn'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Status & Conflict Alerts (CUXD-06) */}
      {statusMessage && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            {statusMessage.type === 'success' && <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {(statusMessage.type === 'conflict' || statusMessage.type === 'unknown') && (
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            {statusMessage.type === 'error' && <X size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            {statusMessage.type === 'pending' && <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <div style={{ flex: 1, lineHeight: 1.4 }}>{statusMessage.message}</div>
          </div>

          {/* CUXD-06: Button to review latest version when conflict occurs */}
          {(statusMessage.type === 'conflict' || statusMessage.type === 'unknown') && onRefreshLatest && (
            <div style={{ marginTop: '4px' }}>
              <button
                type="button"
                onClick={onRefreshLatest}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#b45309',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>Xem bản hiện hành (CUXD-06)</span>
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Nội dung báo cáo văn bản */}
        <div>
          <label
            htmlFor="submission-text"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--ink-title)',
            }}
          >
            Nội dung báo cáo / ghi chú văn bản
          </label>
          <textarea
            id="submission-text"
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Nhập nội dung giải trình, báo cáo kết quả hoặc mô tả sản phẩm..."
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
              outline: 'none',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
          />
        </div>

        {/* Đường dẫn đính kèm */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--ink-title)',
            }}
          >
            Đường dẫn đính kèm (Repository / Báo cáo online)
          </label>
          {links.map((link, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Link2
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    color: 'var(--ink-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="url"
                  value={link}
                  onChange={e => handleLinkChange(idx, e.target.value)}
                  placeholder="https://github.com/..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--ink-body)',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }}
                />
              </div>

              {links.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  aria-label="Xóa đường dẫn"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--surface-ground)',
                    color: 'var(--ink-subtle)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-sm)',
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
              background: 'var(--surface-ground)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              color: 'var(--ink-subtle)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={13} />
            <span>Thêm đường dẫn</span>
          </button>
        </div>

        {/* Dropzone tệp đính kèm (ASG-16: 25MB/tệp) */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--ink-title)',
            }}
          >
            Tệp đính kèm sản phẩm (Tối đa 25 MB/tệp — ASG-16)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => {
              void handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          <div
            role="button"
            tabIndex={0}
            aria-label="Chọn tệp đính kèm để tải lên"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            style={{
              border: isDragging ? '1px dashed var(--accent)' : '1px dashed var(--border-light)',
              backgroundColor: isDragging ? '#eff6ff' : 'var(--surface-ground)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px 16px', // Inset >= 12px
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--ink-muted)' }}>
              <UploadCloud size={24} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-title)', marginBottom: '4px' }}>
              Kéo và thả tệp vào đây, hoặc <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>nhấn để chọn tệp</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>
              Hỗ trợ PDF, ZIP, tài liệu Word/Excel, ảnh PNG/JPEG (thử nghiệm 25 MB/tệp)
            </div>
          </div>

          {/* Uploading progress list */}
          {uploadingFiles.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {uploadingFiles.map((name, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '12px',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Clock size={12} />
                  <span>Đang tải lên: {name}...</span>
                </div>
              ))}
            </div>
          )}

          {/* Attached files list */}
          {attachedFiles.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {attachedFiles.map(file => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--surface-ground)',
                    border: '1px solid var(--hairline)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--ink-title)' }}>{file.name}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    aria-label={`Xóa tệp ${file.name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--danger)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--ink-muted)';
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={submitting || uploadingFiles.length > 0}
            style={{
              padding: '10px 22px',
              backgroundColor: submitting || uploadingFiles.length > 0 ? 'var(--ink-faint)' : 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: submitting || uploadingFiles.length > 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-raised)',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? 'Đang gửi bản nộp...' : isRevision ? 'Gửi phiên bản sửa đổi' : 'Xác nhận nộp bài'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
