import React, { useState } from 'react';
import { FileText, Folder, Link, ExternalLink, Download, History, Copy, FolderInput, Trash2, ChevronRight } from 'lucide-react';
import type { Folder as FolderType, ItemDetail } from '../types';

export interface ItemCardProps {
  item: ItemDetail;
  folders: FolderType[];
  isSelected?: boolean;
  onSelect?: (item: ItemDetail) => void;
  onOpenRevisions: (item: ItemDetail) => void;
  onOpenCopy: (item: ItemDetail) => void;
  onMoveFolder: (item: ItemDetail, folderId: string | null) => Promise<void>;
  onTrash: (item: ItemDetail) => Promise<void>;
  onDownload?: (item: ItemDetail) => Promise<void>;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  folders,
  isSelected = false,
  onSelect,
  onOpenRevisions,
  onOpenCopy,
  onMoveFolder,
  onTrash,
  onDownload,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>(item.folderId ?? '');

  const formatTextWithLists = (text: string) => {
    const lines = text.split('\n').slice(0, 3); // Preview first 3 lines
    return (
      <div className="space-y-1 text-xs text-[var(--ink-body)]">
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
            <p key={idx} className="truncate min-h-[1rem]">
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
      className={`item-card rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-50/40 border-[var(--accent)] ring-1 ring-[var(--accent)] shadow-sm'
          : 'bg-[var(--surface-raised)] border-[var(--hairline)] hover:border-gray-300 hover:shadow-[var(--shadow-raised)]'
      }`}
      role="listitem"
      aria-label={`Mục thư viện: ${item.title || item.type}`}
      onClick={() => onSelect?.(item)}
    >
      <div>
        {/* Header: Type and Version badges */}
        <div className="flex justify-between items-center mb-1.5">
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 ${
              item.type === 'file'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : item.type === 'link'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
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
          <span className="text-xs text-[var(--ink-muted)] font-mono">v{item.version}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[var(--ink-title)] text-sm mb-1 truncate" title={item.title || ''}>
          {item.title || (item.type === 'file' ? 'Tệp đính kèm' : item.type === 'link' ? 'Liên kết' : 'Ghi chú')}
        </h3>

        {/* Folder tag */}
        {currentFolder && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-[var(--surface-ground)] text-[var(--ink-subtle)] px-2 py-0.5 rounded-md mb-1.5 border border-[var(--hairline)]">
            <Folder size={11} className="text-amber-500" />
            <span className="truncate max-w-[140px]">{currentFolder.name}</span>
          </span>
        )}

        {/* Content Preview */}
        <div className="content-preview mt-1">
          {item.type === 'text' && item.revision?.text && (
            <div className="max-h-20 overflow-hidden mb-1">
              {formatTextWithLists(item.revision.text)}
            </div>
          )}

          {item.type === 'link' && item.revision?.url && (
            <p className="text-xs text-blue-600 truncate font-medium">
              {item.revision.url}
            </p>
          )}

          {item.type === 'file' && (
            <div className="flex items-center justify-between text-xs text-[var(--ink-subtle)] bg-[var(--surface-ground)] p-1.5 rounded-lg border border-[var(--hairline)]">
              <span className="truncate">Tệp đã xác minh</span>
              {onDownload && (
                <button
                  type="button"
                  className="text-xs text-purple-700 hover:text-purple-900 font-medium inline-flex items-center gap-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(item);
                  }}
                >
                  <Download size={11} />
                  <span>Tải</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <footer
        className="border-t border-[var(--hairline)] pt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-[var(--ink-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded-md inline-flex items-center gap-1 transition-colors"
            title="Lịch sử phiên bản"
            onClick={() => onOpenRevisions(item)}
          >
            <History size={12} />
            <span>v{item.version}</span>
          </button>
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded-md inline-flex items-center gap-1 transition-colors"
            title="Sao chép sang workspace khác (LIB-04, LIB-12)"
            onClick={() => onOpenCopy(item)}
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            className="hover:text-blue-600 p-1 rounded-md inline-flex items-center gap-1 transition-colors"
            title="Chuyển thư mục trong cùng workspace (LIB-06)"
            onClick={() => setIsMoving(!isMoving)}
          >
            <FolderInput size={12} />
          </button>
        </div>

        <button
          type="button"
          className="text-[var(--ink-muted)] hover:text-red-600 p-1 rounded-md inline-flex items-center gap-1 transition-colors"
          title="Chuyển vào Thùng rác (LIB-14)"
          onClick={() => onTrash(item)}
        >
          <Trash2 size={12} />
        </button>
      </footer>

      {/* Move folder selector */}
      {isMoving && (
        <div
          className="p-2 bg-[var(--surface-ground)] border border-[var(--hairline)] rounded-lg text-xs flex gap-1 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            className="p-1 border border-[var(--hairline)] rounded text-xs flex-grow bg-white text-[var(--ink-body)]"
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
          >
            <option value="">(Thư mục gốc)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-2 py-1 bg-[var(--accent)] text-white rounded font-medium"
            onClick={async () => {
              await onMoveFolder(item, targetFolderId ? targetFolderId : null);
              setIsMoving(false);
            }}
          >
            Lưu
          </button>
          <button
            type="button"
            className="px-1.5 py-1 text-[var(--ink-muted)] hover:bg-gray-200 rounded"
            onClick={() => setIsMoving(false)}
          >
            Hủy
          </button>
        </div>
      )}
    </article>
  );
};
