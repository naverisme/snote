import React, { useState } from 'react';
import type { ItemDetail } from '../types';

export interface CopyItemModalProps {
  isOpen: boolean;
  item: ItemDetail | null;
  onClose: () => void;
  onCopy: (itemId: string, targetWorkspaceId: string, folderId?: string) => Promise<void>;
}

export const CopyItemModal: React.FC<CopyItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onCopy,
}) => {
  if (!isOpen || !item) return null;

  const [targetWorkspaceId, setTargetWorkspaceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId.trim()) {
      setErrorMessage('Vui lòng nhập mã Workspace đích');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onCopy(item.id, targetWorkspaceId.trim());
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể sao chép mục sang workspace đích');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="copy-title">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 id="copy-title" className="text-base font-bold text-gray-800">
            Sao chép sang Workspace khác (LIB-04, LIB-12)
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="text-xs text-gray-600">
          Mục sao chép sẽ tạo một bản độc lập trong workspace đích. Mọi chỉnh sửa hoặc xóa sau này trên bản gốc sẽ không ảnh hưởng đến bản sao và ngược lại.
        </p>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-300 text-red-800 rounded-lg" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mã Workspace đích (UUID)</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Nhập workspaceId đích..."
              value={targetWorkspaceId}
              onChange={(e) => setTargetWorkspaceId(e.target.value)}
              required
              autoFocus
            />
          </div>

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
              {isSubmitting ? 'Đang sao chép...' : 'Xác nhận sao chép'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
