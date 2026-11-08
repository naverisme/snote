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
      {/* Khung minh họa thu nhỏ (Miniature Showcase) */}
      <div className="w-64 p-4 mb-6 rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] shadow-[var(--shadow-raised)] opacity-90 select-none pointer-events-none">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--hairline)]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[10px] text-[var(--ink-muted)] font-mono">
            {folderName ? `docs/${folderName}` : 'docs/thu-vien'}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-ground)]">
            <FileText size={14} className="text-[var(--accent)] flex-shrink-0" />
            <span className="text-xs font-medium text-[var(--ink-title)] truncate">
              De_cuong_mon_hoc.pdf
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 opacity-40">
            <div className="w-3.5 h-3.5 rounded bg-[var(--ink-faint)] flex-shrink-0" />
            <div className="w-24 h-2.5 rounded bg-[var(--ink-faint)]" />
          </div>
        </div>
      </div>

      {/* Lời dẫn & Nút bấm hành động */}
      <h3 className="text-base font-semibold text-[var(--ink-title)] mb-1">
        Thư mục hiện đang trống
      </h3>
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
