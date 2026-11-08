import React, { useState } from 'react';
import { FileText, Link, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="inbox-title">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 id="inbox-title" className="text-base font-bold text-gray-800">
              Lưu nhanh vào Hộp thu (LIB-02)
            </h2>
            <p className="text-xs text-gray-500">Mục chưa phân loại sẽ được đưa vào Hộp thu cá nhân riêng tư của bạn</p>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold border-b-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                type === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('text')}
            >
              <FileText size={14} />
              <span>Ghi chú nhanh</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-semibold border-b-2 inline-flex items-center justify-center gap-1.5 transition-colors ${
                type === 'link' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('link')}
            >
              <Link size={14} />
              <span>Lưu đường dẫn</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tiêu đề (Tùy chọn theo LIB-05)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Tiêu đề gợi nhớ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {type === 'text' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung ghi chú</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded text-sm h-28 focus:border-blue-500 focus:outline-none"
                placeholder="Ý tưởng hoặc nội dung cần lưu nhanh..."
                value={contentOrUrl}
                onChange={(e) => setContentOrUrl(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Đường dẫn URL</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                placeholder="example.com hoặc https://..."
                value={contentOrUrl}
                onChange={(e) => setContentOrUrl(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm disabled:opacity-50"
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
