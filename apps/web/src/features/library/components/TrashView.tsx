import React, { useState } from 'react';
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
        // QA-06: Quota check on restore
        setErrorMessage(
          'Không thể khôi phục: Dung lượng workspace đã đầy (1 GB). Theo quy tắc QA-06, mục trong Thùng rác không chiếm hạn mức, nhưng khôi phục cần đủ chỗ trống. Vui lòng dọn bớt tệp hoạt động trước!',
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
      <div className="p-8 text-center text-gray-500 text-sm animate-pulse">
        Đang tải danh sách Thùng rác...
      </div>
    );
  }

  return (
    <section className="trash-view flex flex-col gap-4" aria-label="Thùng rác Thư viện">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center justify-between">
        <div>
          <span className="font-semibold">Chính sách lưu trữ 30 ngày (LIB-14):</span> Mục bị xóa sẽ được giữ lại trong Thùng rác 30 ngày trước khi bị dọn vĩnh viễn. Trong thời gian này, bạn có thể khôi phục bất cứ lúc nào nếu workspace còn đủ dung lượng.
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs bg-red-100 border border-red-300 text-red-800 rounded-lg" role="alert">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 text-xs bg-green-100 border border-green-300 text-green-800 rounded-lg" role="status">
          {successMessage}
        </div>
      )}

      {trashItems.length === 0 ? (
        <div className="p-12 text-center text-gray-400 border border-dashed rounded-lg bg-gray-50">
          <p className="text-base font-medium">Thùng rác trống</p>
          <p className="text-xs mt-1">Không có tài liệu nào bị xóa trong 30 ngày qua.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 uppercase text-[11px] text-gray-500 border-b">
              <tr>
                <th className="p-3">Loại</th>
                <th className="p-3">Tên tài liệu</th>
                <th className="p-3">Thời gian lưu giữ</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trashItems.map((item) => {
                const daysRemaining = 30; // 30 days retention policy (LIB-14)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {item.type === 'file' ? '📁 Tệp' : item.type === 'link' ? '🔗 Đường dẫn' : '📝 Văn bản'}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {item.title || item.id}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                        ⏳ Còn {daysRemaining} ngày
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs shadow-sm disabled:opacity-50"
                        disabled={restoringId === item.id}
                        onClick={() => handleRestoreClick(item)}
                      >
                        {restoringId === item.id ? 'Đang khôi phục...' : 'Khôi phục ↺'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
