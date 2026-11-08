import React, { useState } from 'react';
import { FileText, Folder, Link, X, AlertCircle } from 'lucide-react';
import type { Folder as FolderType, LibraryItemType } from '../types';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatBytes } from '../utils';
import { calculateListEnter } from '../markdown-helper';

export interface CreateItemModalProps {
  isOpen: boolean;
  folders: FolderType[];
  initialFolderId?: string | null;
  onClose: () => void;
  onCreateText: (title: string, content: string, folderId: string | null) => Promise<void>;
  onCreateLink: (title: string, url: string, folderId: string | null) => Promise<void>;
  onUploadFile: (file: File, title: string, folderId: string | null) => Promise<void>;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  folders,
  initialFolderId,
  onClose,
  onCreateText,
  onCreateLink,
  onUploadFile,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<LibraryItemType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CUXB-07 / LIB-09: Markdown list auto-continuation and termination helper
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const pos = textarea.selectionStart;
      const res = calculateListEnter(textarea.value, pos);
      if (res.handled) {
        e.preventDefault();
        setContent(res.newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = res.newCursorPos;
        }, 0);
      }
    }
  };

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
    if (!title) {
      setTitle(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const targetFolder = selectedFolderId ? selectedFolderId : null;

    try {
      if (activeTab === 'text') {
        if (!content.trim()) throw new Error('Vui lòng nhập nội dung văn bản');
        await onCreateText(title.trim(), content, targetFolder);
      } else if (activeTab === 'link') {
        if (!url.trim()) throw new Error('Vui lòng nhập đường dẫn liên kết');
        await onCreateLink(title.trim(), url.trim(), targetFolder);
      } else if (activeTab === 'file') {
        if (!selectedFile) throw new Error('Vui lòng chọn tệp để tải lên');
        await onUploadFile(selectedFile, title.trim() || selectedFile.name, targetFolder);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Thao tác không thành công');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[var(--surface-overlay)] border border-[var(--hairline)] rounded-xl shadow-[var(--shadow-overlay)] max-w-lg w-full p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3">
          <h2 id="modal-title" className="text-base font-bold text-[var(--ink-title)]">
            Thêm mới vào Thư viện
          </h2>
          <button
            type="button"
            className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1 rounded-md transition-colors"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-[var(--hairline)]" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-colors inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'text'
                ? 'border-[var(--accent)] text-blue-600'
                : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
            }`}
            onClick={() => setActiveTab('text')}
          >
            <FileText size={14} />
            <span>Văn bản (CUXB-07)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'link'}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-colors inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-[var(--accent)] text-blue-600'
                : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
            }`}
            onClick={() => setActiveTab('link')}
          >
            <Link size={14} />
            <span>Đường dẫn</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 text-center transition-colors inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'border-[var(--accent)] text-blue-600'
                : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
            }`}
            onClick={() => setActiveTab('file')}
          >
            <Folder size={14} />
            <span>Tệp (CUXB-09)</span>
          </button>
        </div>

        {errorMessage && (
          <div
            className="p-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-1.5"
            role="alert"
          >
            <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
              Tiêu đề (Tùy chọn)
            </label>
            <input
              type="text"
              className="w-full p-2 border border-[var(--hairline)] rounded-lg text-xs focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tiêu đề mục..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
              Thư mục lưu trữ
            </label>
            <select
              className="w-full p-2 border border-[var(--hairline)] rounded-lg text-xs bg-white text-[var(--ink-body)] focus:border-blue-500 focus:outline-none"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
            >
              <option value="">(Thư mục gốc)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'text' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[var(--ink-title)]">
                  Nội dung văn bản
                </label>
                <span className="text-[11px] text-[var(--ink-muted)]">
                  Gõ &quot;- &quot; hoặc &quot;1. &quot; đầu dòng để tự tạo danh sách
                </span>
              </div>
              <textarea
                className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs h-32 focus:border-blue-500 focus:outline-none font-sans leading-relaxed"
                placeholder="Nhập nội dung ghi chú... (Tự động nhận diện URL và tạo xem trước)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleContentKeyDown}
                required
              />
            </div>
          )}

          {activeTab === 'link' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                Địa chỉ URL
              </label>
              <input
                type="text"
                className="w-full p-2 border border-[var(--hairline)] rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                placeholder="example.com hoặc https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <span className="text-[11px] text-[var(--ink-muted)] mt-1 block">
                Tự động thêm https:// nếu thiếu giao thức (LIB-10)
              </span>
            </div>
          )}

          {activeTab === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                Chọn tệp tải lên (Tối đa 25 MB)
              </label>
              <input
                type="file"
                className="w-full p-2.5 border border-dashed border-[var(--hairline)] rounded-lg text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx,.xlsx,.pptx,.zip"
                required
              />
              <span className="text-[11px] text-[var(--ink-muted)] mt-1 block">
                Hỗ trợ PDF, JPEG, PNG, WebP, TXT, DOCX, XLSX, PPTX, ZIP (LIB-11).
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--hairline)] mt-1">
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs text-[var(--ink-subtle)] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-[var(--accent)] hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Lưu vào Thư viện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
