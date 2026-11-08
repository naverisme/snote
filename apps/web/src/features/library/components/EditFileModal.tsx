import React, { useState } from 'react';
import { File, X, Replace, Copy, AlertCircle } from 'lucide-react';
import type { Folder, ItemDetail } from '../types';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatBytes } from '../utils';

export interface EditFileModalProps {
  isOpen: boolean;
  item: ItemDetail | null;
  folders: Folder[];
  onClose: () => void;
  onOverwrite: (file: File) => Promise<void>;
  onCopyAsNew: (file: File, folderId: string | null) => Promise<void>;
}

/**
 * CUXB-08 / LIB-13 Modal when updating an uploaded file:
 * Presents two distinct choices:
 * 1. "Ghi đè mục này": replaces file content under the same item with a new version (v{n+1}), keeping version history.
 * 2. "Tạo bản sao": generates a new item with the new file, allowing folder selection without affecting the current item.
 */
export const EditFileModal: React.FC<EditFileModalProps> = ({
  isOpen,
  item,
  folders,
  onClose,
  onOverwrite,
  onCopyAsNew,
}) => {
  if (!isOpen || !item) return null;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string>(item.folderId ?? '');
  const [actionType, setActionType] = useState<'overwrite' | 'copy'>('overwrite');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `Tệp vượt quá kích thước cho phép 25 MB (${formatBytes(file.size)}). Vui lòng chọn tệp nhỏ hơn!`,
      );
      e.target.value = '';
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Loại tệp không được hỗ trợ (${ext}). Chỉ chấp nhận PDF, ảnh (JPEG, PNG, WebP), TXT, tài liệu văn phòng (DOCX, XLSX, PPTX) và ZIP (LIB-11).`,
      );
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleExecute = async (mode: 'overwrite' | 'copy') => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn tệp mới trước khi thực hiện.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (mode === 'overwrite') {
        await onOverwrite(selectedFile);
      } else {
        await onCopyAsNew(selectedFile, targetFolderId ? targetFolderId : null);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể cập nhật tệp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-file-title"
    >
      <div className="bg-[var(--surface-overlay)] border border-[var(--hairline)] rounded-xl shadow-[var(--shadow-overlay)] max-w-lg w-full p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3">
          <div>
            <h2 id="edit-file-title" className="text-base font-bold text-[var(--ink-title)]">
              Cập nhật tệp đính kèm (CUXB-08)
            </h2>
            <p className="text-xs text-[var(--ink-subtle)] truncate max-w-sm mt-0.5">
              Mục: {item.title || item.id} (Phiên bản hiện tại: v{item.version})
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
          <div
            className="p-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2"
            role="alert"
          >
            <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* File Picker */}
        <div>
          <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1.5">
            Chọn tệp mới để cập nhật
          </label>
          <input
            type="file"
            className="w-full p-2.5 border border-dashed border-[var(--hairline)] rounded-lg text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx,.xlsx,.pptx,.zip"
          />
          <span className="text-[11px] text-[var(--ink-muted)] mt-1 block">
            Hỗ trợ PDF, PNG, JPEG, WebP, TXT, DOCX, XLSX, PPTX, ZIP (tối đa 25 MB).
          </span>
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div className="p-3 bg-[var(--surface-ground)] rounded-lg border border-[var(--hairline)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <File size={16} className="text-[var(--accent)] flex-shrink-0" />
              <span className="font-medium text-[var(--ink-title)] truncate">
                {selectedFile.name}
              </span>
            </div>
            <span className="text-[var(--ink-subtle)] font-mono flex-shrink-0 ml-2">
              {formatBytes(selectedFile.size)}
            </span>
          </div>
        )}

        {/* Action Choice Explanations & Target Folder (for copy) */}
        <div className="space-y-3 pt-1">
          <p className="text-xs text-[var(--ink-subtle)]">
            Theo quy tắc <strong>CUXB-08 (LIB-13)</strong>, bạn hãy chọn một trong hai phương thức cập nhật:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Overwrite */}
            <div
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                actionType === 'overwrite'
                  ? 'border-[var(--accent)] bg-blue-50/50 shadow-sm'
                  : 'border-[var(--hairline)] hover:border-gray-300'
              }`}
              onClick={() => setActionType('overwrite')}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Replace size={16} className="text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--ink-title)]">Ghi đè mục này</span>
              </div>
              <p className="text-[11px] text-[var(--ink-subtle)] leading-relaxed">
                Thay nội dung tệp bằng bản mới, tăng phiên bản lên v{item.version + 1} và lưu lịch sử phiên bản để đối chiếu.
              </p>
            </div>

            {/* Option 2: Copy */}
            <div
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                actionType === 'copy'
                  ? 'border-[var(--accent)] bg-blue-50/50 shadow-sm'
                  : 'border-[var(--hairline)] hover:border-gray-300'
              }`}
              onClick={() => setActionType('copy')}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Copy size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-[var(--ink-title)]">Tạo bản sao</span>
              </div>
              <p className="text-[11px] text-[var(--ink-subtle)] leading-relaxed">
                Tạo một mục tài liệu mới độc lập với tệp mới, giữ nguyên mục hiện tại không thay đổi.
              </p>
            </div>
          </div>

          {actionType === 'copy' && (
            <div className="pt-2 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                Thư mục lưu trữ cho bản sao mới
              </label>
              <select
                className="w-full p-2 border border-[var(--hairline)] rounded-lg text-xs bg-white text-[var(--ink-body)] focus:border-blue-500 focus:outline-none"
                value={targetFolderId}
                onChange={(e) => setTargetFolderId(e.target.value)}
              >
                <option value="">(Thư mục gốc)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action buttons (The two explicit buttons required by CUXB-08) */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--hairline)]">
          <button
            type="button"
            className="px-3.5 py-2 text-xs text-[var(--ink-subtle)] hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>

          <button
            type="button"
            className="px-4 py-2 text-xs font-medium border border-[var(--hairline)] text-[var(--ink-title)] hover:bg-gray-50 active:scale-95 rounded-lg shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            onClick={() => handleExecute('copy')}
            disabled={isSubmitting || !selectedFile}
          >
            <Copy size={13} className="text-emerald-600" />
            <span>Tạo bản sao</span>
          </button>

          <button
            type="button"
            className="px-4 py-2 text-xs font-medium bg-[var(--accent)] hover:bg-blue-700 text-white active:scale-95 rounded-lg shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
            onClick={() => handleExecute('overwrite')}
            disabled={isSubmitting || !selectedFile}
          >
            <Replace size={13} />
            <span>Ghi đè mục này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
