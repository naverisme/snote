import React, { useState } from 'react';
import { FileText, Folder, Link, ExternalLink, Download, History, Copy, FolderInput, Trash2 } from 'lucide-react';
import type { Folder as FolderType, ItemDetail } from '../types';

export interface ItemCardProps {
  item: ItemDetail;
  folders: FolderType[];
  onOpenRevisions: (item: ItemDetail) => void;
  onOpenCopy: (item: ItemDetail) => void;
  onMoveFolder: (item: ItemDetail, folderId: string | null) => Promise<void>;
  onTrash: (item: ItemDetail) => Promise<void>;
  onDownload?: (item: ItemDetail) => Promise<void>;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  folders,
  onOpenRevisions,
  onOpenCopy,
  onMoveFolder,
  onTrash,
  onDownload,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>(item.folderId ?? '');

  const formatTextWithLists = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-sm text-gray-700">
        {lines.map((line, idx) => {
          if (line.startsWith('- ')) {
            return (
              <li key={idx} className="ml-4 list-disc">
                {line.substring(2)}
              </li>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <li key={idx} className="ml-4 list-decimal">
                {line.replace(/^\d+\.\s/, '')}
              </li>
            );
          }
          return (
            <p key={idx} className="min-h-[1.2rem]">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const currentFolder = folders.find((f) => f.id === item.folderId);

  return (
    <article
      className="item-card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between gap-3"
      role="listitem"
      aria-label={`Mục thư viện: ${item.title || item.type}`}
    >
      <div>
        {/* Header: Type and Version badges */}
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium inline-flex items-center gap-1 ${
              item.type === 'file'
                ? 'bg-purple-100 text-purple-800'
                : item.type === 'link'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {item.type === 'file' ? (
              <>
                <Folder size={12} />
                <span>Tệp</span>
              </>
            ) : item.type === 'link' ? (
              <>
                <Link size={12} />
                <span>Đường dẫn</span>
              </>
            ) : (
              <>
                <FileText size={12} />
                <span>Văn bản</span>
              </>
            )}
          </span>
          <span className="text-xs text-gray-400">v{item.version}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate" title={item.title || ''}>
          {item.title || (item.type === 'file' ? 'Tệp đính kèm' : item.type === 'link' ? 'Liên kết' : 'Ghi chú')}
        </h3>

        {/* Folder tag */}
        {currentFolder && (
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mb-2">
            <Folder size={12} className="text-gray-500" />
            <span>{currentFolder.name}</span>
          </span>
        )}

        {/* Content Preview */}
        <div className="content-preview mt-2">
          {item.type === 'text' && item.revision?.text && (
            <div className="max-h-32 overflow-y-auto mb-2 pr-1">
              {formatTextWithLists(item.revision.text)}
            </div>
          )}

          {item.type === 'link' && item.revision?.url && (
            <div className="mb-2">
              <a
                href={item.revision.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium inline-flex items-center gap-1 break-all"
              >
                <span>{item.revision.url}</span>
                <ExternalLink size={13} className="flex-shrink-0" aria-hidden="true" />
              </a>
            </div>
          )}

          {/* URL preview card (LIB-10, LIB-18, QA-12) */}
          {item.preview && (
            <aside className="preview-card bg-gray-50 border border-gray-200 rounded p-2 flex gap-3 items-center mt-2" aria-label="Thẻ xem trước liên kết">
              {item.preview.coverImage && (
                <img
                  src={item.preview.coverImage}
                  alt="Ảnh bìa trang"
                  className="w-16 h-16 object-cover rounded bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-500 uppercase">{item.preview.domain}</span>
                {item.preview.title && (
                  <p className="text-xs text-gray-800 font-medium truncate">{item.preview.title}</p>
                )}
                <a
                  href={item.preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block"
                >
                  {item.preview.url}
                </a>
              </div>
            </aside>
          )}

          {item.type === 'file' && (
            <div className="mt-2 flex items-center justify-between bg-purple-50 p-2 rounded border border-purple-100">
              <span className="text-xs text-purple-700 font-medium">Tệp đã xác minh bảo mật</span>
              {onDownload && (
                <button
                  type="button"
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 inline-flex items-center gap-1"
                  onClick={() => onDownload(item)}
                >
                  <span>Tải xuống</span>
                  <Download size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <footer className="border-t border-gray-100 pt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded inline-flex items-center gap-1"
            title="Lịch sử phiên bản / Ghi đè"
            onClick={() => onOpenRevisions(item)}
          >
            <History size={13} />
            <span>Phiên bản</span>
          </button>
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded inline-flex items-center gap-1"
            title="Sao chép sang nhóm khác"
            onClick={() => onOpenCopy(item)}
          >
            <Copy size={13} />
            <span>Sao chép</span>
          </button>
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded inline-flex items-center gap-1"
            title="Chuyển thư mục trong cùng workspace"
            onClick={() => setIsMoving(!isMoving)}
          >
            <FolderInput size={13} />
            <span>Chuyển</span>
          </button>
        </div>

        <button
          type="button"
          className="text-red-500 hover:text-red-700 p-1 rounded inline-flex items-center gap-1"
          title="Chuyển vào Thùng rác (Lưu 30 ngày)"
          onClick={() => onTrash(item)}
        >
          <Trash2 size={13} />
          <span>Xóa</span>
        </button>
      </footer>

      {/* Move folder selector */}
      {isMoving && (
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs flex gap-1 items-center">
          <select
            className="p-1 border border-gray-300 rounded text-xs flex-grow"
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
          >
            <option value="">(Không có thư mục - Thư mục gốc)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-2 py-1 bg-blue-600 text-white rounded font-medium"
            onClick={async () => {
              await onMoveFolder(item, targetFolderId ? targetFolderId : null);
              setIsMoving(false);
            }}
          >
            Lưu
          </button>
          <button
            type="button"
            className="px-2 py-1 text-gray-500 hover:bg-gray-200 rounded"
            onClick={() => setIsMoving(false)}
          >
            Hủy
          </button>
        </div>
      )}
    </article>
  );
};
