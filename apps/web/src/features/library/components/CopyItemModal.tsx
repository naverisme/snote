import React, { useEffect, useState } from 'react';
import { Copy, X, AlertCircle } from 'lucide-react';
import { listWorkspaces } from '../../../shared/api';
import type { Workspace } from '../../../shared/types';
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
  const [targetWorkspaceId, setTargetWorkspaceId] = useState('');
  const [destinations, setDestinations] = useState<Workspace[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) return;
    let cancelled = false;
    setTargetWorkspaceId('');
    setDestinations([]);
    setErrorMessage(null);
    setLoadingDestinations(true);
    void listWorkspaces().then(result => {
      if (!cancelled) setDestinations(result.data.filter(workspace => workspace.status === 'active' && workspace.id !== item.workspaceId));
    }).catch(() => {
      if (!cancelled) setErrorMessage('Không tải được danh sách workspace. Hãy đóng và mở lại cửa sổ này.');
    }).finally(() => {
      if (!cancelled) setLoadingDestinations(false);
    });
    return () => { cancelled = true; };
  }, [isOpen, item?.workspaceId]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWorkspaceId.trim()) {
      setErrorMessage('Vui lòng chọn workspace đích.');
      return;
    }
    if (!item.currentRevisionId) {
      setErrorMessage('Tài liệu chưa có phiên bản để sao chép. Hãy tải lại Thư viện.');
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
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-title"
    >
      <div className="bg-[var(--surface-overlay)] border border-[var(--hairline)] rounded-xl shadow-[var(--shadow-overlay)] max-w-md w-full p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[var(--hairline)] pb-3">
          <h2 id="copy-title" className="text-base font-bold text-[var(--ink-title)] flex items-center gap-1.5">
            <Copy size={16} className="text-emerald-600" />
            <span>Sao chép sang workspace khác</span>
          </h2>
          <button
            type="button"
            className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1 rounded-md transition-colors"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-[var(--ink-subtle)] leading-relaxed">
          Mục sao chép sẽ tạo một bản độc lập trong workspace đích. Mọi chỉnh sửa hoặc xóa sau này trên bản gốc sẽ không ảnh hưởng đến bản sao và ngược lại.
        </p>

        {errorMessage && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-1.5" role="alert">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="copy-target-workspace" className="block text-xs font-semibold text-[var(--ink-title)] mb-1">
              Workspace đích
            </label>
            <select
              id="copy-target-workspace"
              className="w-full p-2.5 border border-[var(--hairline)] rounded-lg text-xs bg-[var(--surface-overlay)] text-[var(--ink-body)] focus:border-blue-500 focus:outline-none"
              value={targetWorkspaceId}
              onChange={(e) => setTargetWorkspaceId(e.target.value)}
              required disabled={loadingDestinations || destinations.length === 0}
            >
              <option value="">{loadingDestinations ? 'Đang tải workspace...' : 'Chọn workspace'}</option>
              {destinations.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
            </select>
            {!loadingDestinations && destinations.length === 0 && !errorMessage && <p className="mt-1 text-xs text-[var(--ink-subtle)]">Bạn chưa có workspace khác đang hoạt động.</p>}
          </div>

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
              className="px-4 py-1.5 text-xs bg-[var(--accent)] hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
              disabled={isSubmitting || loadingDestinations || !targetWorkspaceId}
            >
              {isSubmitting ? 'Đang sao chép...' : 'Xác nhận sao chép'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
