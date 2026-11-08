import React, { useState } from 'react';
import { History, X, AlertCircle, FileEdit, Check } from 'lucide-react';
import type { ItemDetail, LibraryItem } from '../types';

export interface RevisionHistoryModalProps {
  isOpen: boolean;
  item: ItemDetail | null;
  onClose: () => void;
  onOverwriteRevision: (itemId: string, etag: string, input: LibraryItem) => Promise<void>;
  onOverwriteUploadFile?: (file: File, itemId: string, etag: string) => Promise<void>;
}

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  item,
  onClose,
  onOverwriteRevision,
  onOverwriteUploadFile,
}) => {
  if (!isOpen || !item) return null;

  const [isOverwriting, setIsOverwriting] = useState(false);
  const [newContent, setNewContent] = useState(item.revision?.text || '');
  const [newUrl, setNewUrl] = useState(item.revision?.url || '');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOverwriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const etag = `"${item.version}"`;

    try {
      if (item.type === 'text') {
        await onOverwriteRevision(item.id, etag, {
          type: 'text',
          content: newContent,
          title: item.title,
        });
      } else if (item.type === 'link') {
        await onOverwriteRevision(item.id, etag, {
          type: 'link',
          url: newUrl,
          title: item.title,
        });
      } else if (item.type === 'file' && onOverwriteUploadFile && newFile) {
        await onOverwriteUploadFile(newFile, item.id, etag);
      }
      setIsOverwriting(false);
      onClose();
    } catch (err: any) {
      if (err.status === 412 || err.code === 'VERSION_CONFLICT') {
        setErrorMessage('Xung đột phiên bản (QA-05): Mục đã bị người khác cập nhật trước đó. Vui lòng tải lại trang để xem phiên bản mới nhất!');
      } else {
        setErrorMessage(err.message || 'Không thể tạo phiên bản mới');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rev-title"
    >
      <div className="bg-[var(--surface-overlay)] border border-[var(--hairline)] rounded-xl shadow-[var(--shadow-overlay)] max-w-lg w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3">
          <div>
            <h2 id="rev-title" className="text-base font-bold text-[var(--ink-title)] flex items-center gap-1.5">
              <History size={16} className="text-blue-600" />
              <span>Quản lý phiên bản & Ghi đè</span>
            </h2>
            <p className="text-xs text-[var(--ink-subtle)] truncate max-w-sm mt-0.5">
              {item.title || item.id}
            </p>
          </div>
          <button
            type="button"
            className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1 rounded-md transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-1.5" role="alert">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current revision info */}
        <div className="bg-[var(--surface-ground)] p-3.5 rounded-xl border border-[var(--hairline)] text-xs flex justify-between items-center">
          <div>
            <span className="font-semibold text-[var(--ink-title)]">Phiên bản hiện tại: v{item.version}</span>
            <p className="text-[var(--ink-subtle)] font-mono mt-0.5">
              Mã sửa đổi: {item.currentRevisionId ? item.currentRevisionId.substring(0, 12) + '...' : 'Chưa có'}
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium text-[11px] inline-flex items-center gap-1">
            <Check size={11} />
            <span>Hoạt động</span>
          </span>
        </div>

        {/* Overwrite toggle button */}
        {!isOverwriting ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[var(--ink-subtle)] leading-relaxed">
              Theo quy tắc <strong>CUXB-08 (LIB-13)</strong>, khi cập nhật nội dung hoặc tải tệp mới, bạn có thể chọn <strong>Ghi đè mục này</strong> để lưu phiên bản mới mà vẫn giữ nguyên lịch sử và ID của mục.
            </p>
            <button
              type="button"
              className="mt-2 w-full py-2.5 bg-[var(--accent)] hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
              onClick={() => setIsOverwriting(true)}
            >
              <FileEdit size={13} />
              <span>Ghi đè phiên bản mới (v{item.version + 1})</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleOverwriteSubmit} className="flex flex-col gap-3 p-3.5 bg-blue-50/40 border border-blue-200 rounded-xl">
            <h3 className="text-xs font-bold text-blue-900 uppercase">
              Cập nhật phiên bản mới (v{item.version + 1})
            </h3>

            {item.type === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                  Nội dung văn bản mới
                </label>
                <textarea
                  className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs h-28 focus:outline-none focus:border-blue-500 bg-white leading-relaxed"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
            )}

            {item.type === 'link' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                  URL liên kết mới
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-[var(--hairline)] rounded-lg text-xs focus:outline-none focus:border-blue-500 bg-white"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {item.type === 'file' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                  Chọn tệp ghi đè mới
                </label>
                <input
                  type="file"
                  className="w-full text-xs p-2 border border-dashed border-[var(--hairline)] rounded-lg bg-white cursor-pointer"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                className="px-3 py-1.5 text-xs text-[var(--ink-subtle)] hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => setIsOverwriting(false)}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs bg-[var(--accent)] hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận ghi đè'}
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t border-[var(--hairline)]">
          <button
            type="button"
            className="px-4 py-1.5 text-xs text-[var(--ink-subtle)] hover:bg-[var(--surface-ground)] rounded-lg transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
