import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { QuotaInfo } from '../types';
import { formatBytes } from '../utils';

export interface QuotaBarProps {
  quota: QuotaInfo | null;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

/**
 * CUXB-01 / LIB-11 / LIB-16 Quota Bar component:
 * - Requirement 1: Eliminates any 1 GiB assumption on error.
 * - Displays "Chưa tải được dung lượng lưu trữ." and "Thử lại" button on error or missing quota.
 * - Adheres strictly to 5-tier ink, insets >= 12px, nested radius, and zero emoji.
 */
export const QuotaBar: React.FC<QuotaBarProps> = ({ quota, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div
        className="quota-bar-skeleton p-3.5 bg-[var(--surface-raised)] rounded-xl border border-[var(--hairline)] animate-pulse"
        aria-busy="true"
        aria-label="Đang tải thông tin dung lượng"
      >
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2.5" />
        <div className="h-2 bg-gray-200 rounded-full w-full" />
      </div>
    );
  }

  // Requirement 1: Never assume 1 GiB or calculate fallback quota on error.
  if (error || !quota) {
    return (
      <div
        role="status"
        className="p-3.5 bg-[var(--surface-raised)] rounded-xl border border-[var(--hairline)] text-xs text-[var(--ink-body)] flex items-center justify-between gap-3 shadow-sm"
        aria-label="Trạng thái dung lượng lưu trữ"
      >
        <span className="font-medium text-[var(--ink-title)]">
          Chưa tải được dung lượng lưu trữ.
        </span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 border border-[var(--hairline)] hover:bg-[var(--surface-ground)] text-[var(--ink-title)] rounded-lg px-3 py-1.5 font-medium text-xs transition-colors active:scale-95 shadow-sm"
          >
            <RotateCcw size={12} className="text-[var(--ink-muted)]" />
            <span>Thử lại</span>
          </button>
        )}
      </div>
    );
  }

  const percent =
    quota.totalBytes > 0
      ? Math.min(100, Math.round((quota.usedBytes / quota.totalBytes) * 100))
      : 0;

  return (
    <div
      className={`quota-bar-container p-3.5 rounded-xl border transition-colors ${
        quota.warning
          ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-sm'
          : 'bg-[var(--surface-raised)] border-[var(--hairline)] text-[var(--ink-body)] shadow-sm'
      }`}
      role="region"
      aria-label="Dung lượng lưu trữ workspace"
    >
      <div className="flex justify-between items-center text-xs font-medium mb-1.5">
        <span className="text-[var(--ink-title)]">
          Dung lượng: <strong className="font-semibold">{formatBytes(quota.usedBytes)}</strong> / {formatBytes(quota.totalBytes)} ({percent}%)
        </span>
        <span className="text-[var(--ink-subtle)] font-normal">
          Còn lại: {formatBytes(quota.remainingBytes)} ({quota.itemCount} tệp)
        </span>
      </div>

      <div
        className="w-full bg-[var(--surface-ground)] rounded-full h-2 overflow-hidden border border-[var(--hairline)]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percent >= 90 ? 'bg-red-600' : quota.warning ? 'bg-amber-500' : 'bg-[var(--accent)]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {quota.warning && (
        <div
          className="mt-2.5 text-xs flex items-center gap-1.5 font-medium text-amber-900"
          role="alert"
        >
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
          <span>Cảnh báo: Dung lượng lưu trữ của workspace đã đạt trên 80%. Hãy dọn dẹp hoặc tối ưu tệp.</span>
        </div>
      )}
    </div>
  );
};
