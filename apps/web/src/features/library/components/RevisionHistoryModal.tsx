import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="rev-title">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 id="rev-title" className="text-lg font-bold text-gray-800">
              Quản lý phiên bản & Ghi đè
            </h2>
            <p className="text-xs text-gray-500 truncate max-w-sm">{item.title || item.id}</p>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Current revision info */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex justify-between items-center">
          <div>
            <span className="font-semibold text-gray-700">Phiên bản hiện tại: v{item.version}</span>
            <p className="text-gray-500 mt-0.5">
              Mã sửa đổi: {item.currentRevisionId ? item.currentRevisionId.substring(0, 8) + '...' : 'Chưa có'}
            </p>
          </div>
          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Hoạt động</span>
        </div>

        {/* Overwrite toggle button */}
        {!isOverwriting ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600">
              Theo quy tắc LIB-13, khi tải lên bản mới hoặc cập nhật nội dung, bạn có thể chọn <strong>Ghi đè mục này</strong> để lưu phiên bản mới mà vẫn giữ nguyên lịch sử cũ.
            </p>
            <button
              type="button"
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm"
              onClick={() => setIsOverwriting(true)}
            >
              + Ghi đè phiên bản mới (v{item.version + 1})
            </button>
          </div>
        ) : (
          <form onSubmit={handleOverwriteSubmit} className="flex flex-col gap-3 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <h3 className="text-xs font-bold text-blue-900 uppercase">Cập nhật phiên bản mới (v{item.version + 1})</h3>

            {item.type === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nội dung văn bản mới</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded text-sm h-28 focus:outline-none focus:border-blue-500"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
            )}

            {item.type === 'link' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL liên kết mới</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {item.type === 'file' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn tệp ghi đè mới</label>
                <input
                  type="file"
                  className="w-full text-xs"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded"
                onClick={() => setIsOverwriting(false)}
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận ghi đè'}
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-end pt-2 border-t">
          <button
            type="button"
            className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
