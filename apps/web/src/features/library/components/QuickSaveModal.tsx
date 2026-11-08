import React, { useState } from 'react';
import { FileText, Link, X, Download, AlertCircle } from 'lucide-react';
import { calculateListEnter } from '../markdown-helper';

export interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickSave: (type: 'text' | 'link', title: string, contentOrUrl: string) => Promise<void>;
}

export const QuickSaveModal: React.FC<QuickSaveModalProps> = ({ isOpen, onClose, onQuickSave }) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'text' | 'link'>('text');
  const [title, setTitle] = useState('');
  const [contentOrUrl, setContentOrUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const pos = textarea.selectionStart;
      const res = calculateListEnter(textarea.value, pos);
      if (res.handled) {
        e.preventDefault();
        setContentOrUrl(res.newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = res.newCursorPos;
        }, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentOrUrl.trim()) {
      setErrorMessage('Vui lòng nhập nội dung hoặc đường dẫn liên kết');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onQuickSave(type, title.trim(), contentOrUrl.trim());
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể lưu nhanh');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inbox-title"
    >
      <div className="bg-[var(--surface-overlay)] border border-[var(--hairline)] rounded-xl shadow-[var(--shadow-overlay)] max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3">
          <div>
            <h2 id="inbox-title" className="text-base font-bold text-[var(--ink-title)] flex items-center gap-1.5">
              <Download size={16} className="text-emerald-600" />
              <span>Lưu nhanh vào Hộp thu (LIB-02)</span>
            </h2>
            <p className="text-xs text-[var(--ink-subtle)] mt-0.5">
              Mục chưa phân loại sẽ được đưa vào Hộp thu cá nhân riêng tư của bạn
            </p>
          </div>
          <button
            type="button"
            className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1 rounded-md transition-colors"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex border-b border-[var(--hairline)]">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold border-b-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                type === 'text'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
              }`}
              onClick={() => setType('text')}
            >
              <FileText size={14} />
              <span>Ghi chú nhanh (CUXB-07)</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-semibold border-b-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                type === 'link'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
              }`}
              onClick={() => setType('link')}
            >
              <Link size={14} />
              <span>Lưu đường dẫn</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
              Tiêu đề (Tùy chọn theo LIB-05)
            </label>
            <input
              type="text"
              className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs bg-white text-[var(--ink-body)] focus:border-blue-500 focus:outline-none"
              placeholder="Tiêu đề gợi nhớ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {type === 'text' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[var(--ink-title)]">
                  Nội dung ghi chú
                </label>
                <span className="text-[11px] text-[var(--ink-muted)]">
                  Gõ &quot;- &quot; hoặc &quot;1. &quot; đầu dòng để tự tạo danh sách
                </span>
              </div>
              <textarea
                className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs h-28 focus:border-blue-500 focus:outline-none font-sans leading-relaxed"
                placeholder="Ý tưởng hoặc nội dung cần lưu nhanh..."
                value={contentOrUrl}
                onChange={(e) => setContentOrUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
                Đường dẫn URL
              </label>
              <input
                type="text"
                className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                placeholder="example.com hoặc https://..."
                value={contentOrUrl}
                onChange={(e) => setContentOrUrl(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--hairline)]">
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
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu vào Hộp thu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
