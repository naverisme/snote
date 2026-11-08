import React, { useState } from 'react';
import {
  FileText,
  Folder,
  Link,
  ExternalLink,
  Download,
  History,
  Copy,
  FolderInput,
  Trash2,
  X,
  FileEdit,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import type { Folder as FolderType, ItemDetail } from '../types';
import { URL_REGEX, normalizeUrl } from '../markdown-helper';

export interface ItemDetailPanelProps {
  item: ItemDetail | null;
  folders: FolderType[];
  onClose?: () => void;
  onOpenEditFile: (item: ItemDetail) => void;
  onOpenRevisions: (item: ItemDetail) => void;
  onOpenCopy: (item: ItemDetail) => void;
  onMoveFolder: (item: ItemDetail, folderId: string | null) => Promise<void>;
  onTrash: (item: ItemDetail) => Promise<void>;
  onDownload?: (item: ItemDetail) => Promise<void>;
}

/**
 * CUXB-01 Column 3: Item Detail panel displaying complete item contents,
 * markdown formatting with list handling (CUXB-07), URL preview cards,
 * file operations with CUXB-08 update flow, and version history.
 */
export const ItemDetailPanel: React.FC<ItemDetailPanelProps> = ({
  item,
  folders,
  onClose,
  onOpenEditFile,
  onOpenRevisions,
  onOpenCopy,
  onMoveFolder,
  onTrash,
  onDownload,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>(item?.folderId ?? '');

  if (!item) {
    return (
      <aside
        className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--surface-raised)] text-center select-none"
        aria-label="Chi tiết tài liệu chưa được chọn"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--surface-ground)] border border-[var(--hairline)] flex items-center justify-center mb-3">
          <FileText size={22} className="text-[var(--ink-muted)]" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--ink-title)] mb-1">
          Chưa chọn tài liệu
        </h3>
        <p className="text-xs text-[var(--ink-subtle)] max-w-xs leading-relaxed">
          Chọn một mục trong danh sách ở giữa để xem toàn bộ nội dung, siêu dữ liệu, lịch sử phiên bản và các thao tác liên quan.
        </p>
      </aside>
    );
  }

  const currentFolder = folders.find((f) => f.id === item.folderId);

  // Helper to render markdown text with bullets, numbers, and clickable links (CUXB-07, LIB-09/10)
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 text-sm text-[var(--ink-body)] leading-relaxed">
        {lines.map((line, idx) => {
          // Bullet list "- "
          if (line.startsWith('- ')) {
            const content = line.substring(2);
            return (
              <li key={idx} className="ml-5 list-disc text-sm">
                {renderLineWithLinks(content)}
              </li>
            );
          }

          // Numbered list "1. " or "N. "
          const numMatch = line.match(/^(\d+)\.\s(.*)$/);
          if (numMatch) {
            return (
              <li key={idx} className="ml-5 list-decimal text-sm">
                {renderLineWithLinks(numMatch[2])}
              </li>
            );
          }

          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          return (
            <p key={idx} className="min-h-[1.25rem]">
              {renderLineWithLinks(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderLineWithLinks = (line: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = Array.from(line.matchAll(new RegExp(URL_REGEX.source, 'gi')));

    matches.forEach((m, i) => {
      const matchText = m[0];
      const matchIndex = m.index ?? 0;
      if (matchIndex > lastIndex) {
        parts.push(line.substring(lastIndex, matchIndex));
      }
      const targetUrl = normalizeUrl(matchText);
      parts.push(
        <a
          key={i}
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium break-all inline-flex items-center gap-0.5"
        >
          <span>{matchText}</span>
          <ExternalLink size={11} className="inline flex-shrink-0 opacity-70" />
        </a>,
      );
      lastIndex = matchIndex + matchText.length;
    });

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  return (
    <aside
      className="w-full h-full flex flex-col bg-[var(--surface-raised)] overflow-y-auto"
      aria-label={`Chi tiết tài liệu ${item.title || item.id}`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--hairline)] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Type badge */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-lg font-medium inline-flex items-center gap-1 ${
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
                  <span>Tệp đính kèm</span>
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

            {/* Version badge */}
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-ground)] text-[var(--ink-subtle)] border border-[var(--hairline)] font-mono">
              v{item.version}
            </span>

            {/* Folder badge */}
            {currentFolder && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-ground)] text-[var(--ink-subtle)] border border-[var(--hairline)] inline-flex items-center gap-1 truncate max-w-[150px]">
                <Folder size={11} className="text-amber-500 flex-shrink-0" />
                <span className="truncate">{currentFolder.name}</span>
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-[var(--ink-title)] break-words">
            {item.title || (item.type === 'file' ? 'Tệp đính kèm' : item.type === 'link' ? 'Liên kết' : 'Ghi chú')}
          </h2>
        </div>

        {onClose && (
          <button
            type="button"
            className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1.5 rounded-lg hover:bg-[var(--surface-ground)] transition-colors flex-shrink-0"
            onClick={onClose}
            aria-label="Đóng chi tiết"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        {/* Text Item Content */}
        {item.type === 'text' && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-subtle)] uppercase tracking-wider mb-2">
              Nội dung văn bản
            </h4>
            <div className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-ground)]/40 min-h-[100px]">
              {item.revision?.text ? (
                renderFormattedMarkdown(item.revision.text)
              ) : (
                <p className="text-xs text-[var(--ink-muted)] italic">Nội dung trống</p>
              )}
            </div>
          </div>
        )}

        {/* Link Item Content */}
        {item.type === 'link' && item.revision?.url && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-subtle)] uppercase tracking-wider mb-2">
              Đường dẫn liên kết
            </h4>
            <div className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-ground)]/40">
              <a
                href={normalizeUrl(item.revision.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline break-all inline-flex items-center gap-1.5"
              >
                <span>{item.revision.url}</span>
                <ExternalLink size={14} className="flex-shrink-0" />
              </a>
            </div>
          </div>
        )}

        {/* URL Preview Card (CUXB-07, LIB-10, LIB-18) */}
        {item.preview && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--ink-subtle)] uppercase tracking-wider mb-2">
              Xem trước liên kết (LIB-10)
            </h4>
            <aside
              className="p-3.5 rounded-xl border border-[var(--hairline)] bg-white shadow-sm flex gap-3 items-center"
              aria-label="Thẻ xem trước liên kết"
            >
              {item.preview.coverImage && (
                <img
                  src={item.preview.coverImage}
                  alt="Ảnh bìa trang"
                  className="w-16 h-16 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider block">
                  {item.preview.domain}
                </span>
                {item.preview.title && (
                  <p className="text-xs font-semibold text-[var(--ink-title)] truncate mt-0.5">
                    {item.preview.title}
                  </p>
                )}
                <a
                  href={item.preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block mt-0.5"
                >
                  {item.preview.url}
                </a>
              </div>
            </aside>
          </div>
        )}

        {/* File Item Content */}
        {item.type === 'file' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[var(--ink-subtle)] uppercase tracking-wider">
              Tệp tài liệu
            </h4>
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-purple-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-purple-900">
                    Tệp đã xác minh bảo mật (LIB-11)
                  </span>
                </div>
                {onDownload && (
                  <button
                    type="button"
                    onClick={() => onDownload(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors active:scale-95"
                  >
                    <Download size={13} />
                    <span>Tải xuống</span>
                  </button>
                )}
              </div>

              {/* Sửa tệp button with CUXB-08 flow */}
              <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                <span className="text-xs text-purple-800">
                  Cập nhật phiên bản hoặc tạo bản sao độc lập (CUXB-08):
                </span>
                <button
                  type="button"
                  onClick={() => onOpenEditFile(item)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-purple-300 bg-white text-purple-700 hover:bg-purple-100 text-xs font-medium transition-colors"
                >
                  <FileEdit size={12} />
                  <span>Sửa tệp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Folder Sub-panel */}
        {isMoving && (
          <div className="p-3 bg-[var(--surface-ground)] border border-[var(--hairline)] rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-[var(--ink-title)]">
              Chuyển thư mục trong cùng workspace (LIB-06)
            </label>
            <div className="flex gap-2">
              <select
                className="p-2 border border-[var(--hairline)] rounded-lg text-xs flex-grow bg-white"
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
                className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-medium"
                onClick={async () => {
                  await onMoveFolder(item, targetFolderId ? targetFolderId : null);
                  setIsMoving(false);
                }}
              >
                Lưu
              </button>
              <button
                type="button"
                className="px-2.5 py-1.5 text-xs text-[var(--ink-subtle)] hover:bg-gray-200 rounded-lg"
                onClick={() => setIsMoving(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[var(--hairline)] bg-[var(--surface-ground)]/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.type === 'file' ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-white text-xs font-medium text-[var(--ink-title)] hover:bg-gray-50 active:scale-95 inline-flex items-center gap-1.5 shadow-sm transition-all"
              onClick={() => onOpenEditFile(item)}
              title="Cập nhật tệp (Ghi đè hoặc Tạo bản sao - CUXB-08)"
            >
              <FileEdit size={13} className="text-purple-600" />
              <span>Sửa tệp</span>
            </button>
          ) : null}

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-white text-xs font-medium text-[var(--ink-title)] hover:bg-gray-50 active:scale-95 inline-flex items-center gap-1.5 shadow-sm transition-all"
            onClick={() => onOpenRevisions(item)}
            title="Xem lịch sử và các phiên bản cũ"
          >
            <History size={13} className="text-blue-600" />
            <span>Lịch sử phiên bản</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-white text-xs font-medium text-[var(--ink-title)] hover:bg-gray-50 active:scale-95 inline-flex items-center gap-1.5 shadow-sm transition-all"
            onClick={() => onOpenCopy(item)}
            title="Sao chép độc lập sang workspace khác (LIB-04, LIB-12)"
          >
            <Copy size={13} className="text-emerald-600" />
            <span>Sao chép</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-white text-xs font-medium text-[var(--ink-title)] hover:bg-gray-50 active:scale-95 inline-flex items-center gap-1.5 shadow-sm transition-all"
            onClick={() => setIsMoving(!isMoving)}
            title="Chuyển mục giữa các thư mục"
          >
            <FolderInput size={13} className="text-amber-600" />
            <span>Chuyển</span>
          </button>
        </div>

        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 active:scale-95 inline-flex items-center gap-1 transition-all"
          onClick={() => onTrash(item)}
          title="Chuyển vào Thùng rác (lưu trữ 30 ngày)"
        >
          <Trash2 size={13} />
          <span>Xóa</span>
        </button>
      </div>
    </aside>
  );
};
