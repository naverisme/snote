import React from 'react';
import { FolderPlus, FileText, ArrowRight } from 'lucide-react';

export interface LibraryEmptyStateProps {
  onAction: () => void;
  folderName?: string | null;
}

/**
 * Empty State for Library following Recipe 2: Stageshow Miniature Pattern
 * (docs/ux/skill-driven-ui-guide.md).
 */
export const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({ onAction, folderName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-11 h-11 rounded-full bg-[var(--surface-ground)] flex items-center justify-center mb-4 text-[var(--ink-muted)]">
        <FolderPlus size={22} />
      </div>

      {/* Lời dẫn & Nút bấm hành động */}
      <h2 className="text-base font-semibold text-[var(--ink-title)] mb-1">
        {folderName ? `Thư mục "${folderName}" hiện đang trống` : 'Thư viện hiện chưa có tài liệu nào'}
      </h2>
      <p className="text-sm text-[var(--ink-subtle)] max-w-sm mb-5">
        Bắt đầu chia sẻ tài liệu, bài giảng hoặc ghi chú học tập cho cả nhóm của bạn.
      </p>

      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <FolderPlus size={16} />
        <span>Tải tài liệu đầu tiên</span>
        <ArrowRight size={14} className="opacity-70" />
      </button>
    </div>
  );
};
