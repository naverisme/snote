import React, { useState } from 'react';
import { FileText, Folder, Link, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ItemDetail } from '../types';

export interface TrashViewProps {
  trashItems: ItemDetail[];
  onRestore: (item: ItemDetail) => Promise<void>;
  loading?: boolean;
}

export const TrashView: React.FC<TrashViewProps> = ({ trashItems, onRestore, loading }) => {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRestoreClick = async (item: ItemDetail) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRestoringId(item.id);
    try {
      await onRestore(item);
      setSuccessMessage(`Đã khôi phục thành công mục "${item.title || item.id}" về Thư viện!`);
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED') {
        // QA-06: Quota check on restore - do not assume fixed 1 GiB
        setErrorMessage(
          'Không thể khôi phục: Dung lượng workspace đã đầy. Theo quy tắc QA-06, mục trong Thùng rác không chiếm hạn mức, nhưng khôi phục cần đủ chỗ trống. Vui lòng dọn bớt tệp hoạt động trước!',
        );
      } else {
        setErrorMessage(err.message || 'Không thể khôi phục mục');
      }
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--ink-subtle)] text-xs animate-pulse">
        Đang tải danh sách Thùng rác...
      </div>
    );
  }

  return (
    <section className="trash-view flex flex-col gap-4" aria-label="Thùng rác Thư viện">
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
        <div>
          <span className="font-semibold">Chính sách lưu trữ 30 ngày (LIB-14):</span> Mục bị xóa sẽ được giữ lại trong Thùng rác 30 ngày trước khi bị dọn vĩnh viễn. Trong thời gian này, bạn có thể khôi phục bất cứ lúc nào nếu workspace còn đủ dung lượng.
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 text-xs bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-1.5" role="alert">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-1.5" role="status">
          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {trashItems.length === 0 ? (
        <div className="p-12 text-center text-[var(--ink-subtle)] border border-dashed border-[var(--hairline)] rounded-xl bg-[var(--surface-raised)]">
          <p className="text-sm font-medium text-[var(--ink-title)]">Thùng rác đang trống</p>
          <p className="text-xs text-[var(--ink-muted)] mt-1">Các mục bị xóa trong vòng 30 ngày sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {trashItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] shadow-sm flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-ground)] text-[var(--ink-subtle)] border border-[var(--hairline)] inline-flex items-center gap-1 font-medium">
                    {item.type === 'file' ? <Folder size={11} /> : item.type === 'link' ? <Link size={11} /> : <FileText size={11} />}
                    <span>{item.type === 'file' ? 'Tệp' : item.type === 'link' ? 'Đường dẫn' : 'Văn bản'}</span>
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)] font-mono">v{item.version}</span>
                </div>
                <h4 className="font-semibold text-xs text-[var(--ink-title)] truncate">
                  {item.title || item.id}
                </h4>
              </div>

              <div className="pt-2 border-t border-[var(--hairline)] flex justify-end">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  onClick={() => handleRestoreClick(item)}
                  disabled={restoringId === item.id}
                >
                  <RotateCcw size={12} />
                  <span>{restoringId === item.id ? 'Đang khôi phục...' : 'Khôi phục'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
