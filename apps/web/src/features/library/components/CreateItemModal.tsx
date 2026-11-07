import React, { useState } from 'react';
import type { Folder, LibraryItemType } from '../types';

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (LIB-11)

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.docx', '.xlsx', '.pptx', '.zip'];

export interface CreateItemModalProps {
  isOpen: boolean;
  folders: Folder[];
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

  // Markdown bullet list shortcut helper on textarea keydown (LIB-09)
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const pos = textarea.selectionStart;
      const value = textarea.value;
      const currentLine = value.substring(0, pos).split('\n').pop() || '';

      if (currentLine.startsWith('- ')) {
        e.preventDefault();
        if (currentLine.trim() === '-') {
          // Empty bullet line ends the list
          const newValue = value.substring(0, pos - 2) + '\n' + value.substring(pos);
          setContent(newValue);
        } else {
          // Continue bullet list
          const newValue = value.substring(0, pos) + '\n- ' + value.substring(pos);
          setContent(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = pos + 3;
          }, 0);
        }
      } else if (/^\d+\.\s/.test(currentLine)) {
        e.preventDefault();
        const match = currentLine.match(/^(\d+)\.\s/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (currentLine.trim() === `${num}.`) {
            // Empty numbered line ends list
            const newValue = value.substring(0, pos - (match[0].length)) + '\n' + value.substring(pos);
            setContent(newValue);
          } else {
            // Next number
            const prefix = `\n${num + 1}. `;
            const newValue = value.substring(0, pos) + prefix + value.substring(pos);
            setContent(newValue);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = pos + prefix.length;
            }, 0);
          }
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (LIB-11, QA-06)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Tệp vượt quá kích thước cho phép 25 MB (Dung lượng: ${(file.size / (1024 * 1024)).toFixed(1)} MB). Vui lòng chọn tệp nhỏ hơn!`);
      e.target.value = '';
      return;
    }

    // Check extension
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 id="modal-title" className="text-lg font-bold text-gray-800">
            Thêm mới vào Thư viện
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            ×
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-gray-200" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            className={`flex-1 py-2 text-sm font-medium border-b-2 text-center transition-colors ${
              activeTab === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('text')}
          >
            📝 Văn bản
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'link'}
            className={`flex-1 py-2 text-sm font-medium border-b-2 text-center transition-colors ${
              activeTab === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('link')}
          >
            🔗 Đường dẫn
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            className={`flex-1 py-2 text-sm font-medium border-b-2 text-center transition-colors ${
              activeTab === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('file')}
          >
            📁 Tệp
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề (Tùy chọn)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tiêu đề mục..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Thư mục lưu trữ</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
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
                <label className="text-xs font-semibold text-gray-700">Nội dung văn bản</label>
                <span className="text-[11px] text-gray-400">Gõ &quot;- &quot; hoặc &quot;1. &quot; đầu dòng để tạo danh sách</span>
              </div>
              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm h-32 focus:border-blue-500 focus:outline-none font-sans"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ URL</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                placeholder="example.com hoặc https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Tự động thêm https:// nếu thiếu giao thức (LIB-10)</span>
            </div>
          )}

          {activeTab === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn tệp tải lên (Tối đa 25 MB)</label>
              <input
                type="file"
                className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.docx,.xlsx,.pptx,.zip"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Hỗ trợ PDF, JPEG, PNG, WebP, TXT, DOCX, XLSX, PPTX, ZIP (LIB-11).
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t mt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1"
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
