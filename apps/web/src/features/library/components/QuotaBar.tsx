import React from 'react';
import type { QuotaInfo } from '../types';

export interface QuotaBarProps {
  quota: QuotaInfo | null;
  loading?: boolean;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({ quota, loading }) => {
  if (loading || !quota) {
    return (
      <div className="quota-bar-skeleton p-3 bg-gray-50 rounded-lg animate-pulse" aria-busy="true">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-2 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  const percent = Math.min(100, Math.round((quota.usedBytes / quota.totalBytes) * 100));

  return (
    <div
      className={`quota-bar-container p-4 rounded-lg border ${
        quota.warning
          ? 'bg-amber-50 border-amber-300 text-amber-900'
          : 'bg-white border-gray-200 text-gray-800'
      }`}
      role="region"
      aria-label="Dung lượng lưu trữ workspace"
    >
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-medium">
          Dung lượng: {formatBytes(quota.usedBytes)} / {formatBytes(quota.totalBytes)} ({percent}%)
        </span>
        <span className="text-xs text-gray-500">
          Còn lại: {formatBytes(quota.remainingBytes)} ({quota.itemCount} tệp)
        </span>
      </div>

      <div
        className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            percent >= 90 ? 'bg-red-600' : quota.warning ? 'bg-amber-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {quota.warning && (
        <div className="mt-2 text-xs flex items-center gap-1 font-semibold text-amber-800" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>Cảnh báo: Dung lượng lưu trữ của workspace đã đạt trên 80%. Hãy dọn dẹp hoặc tối ưu tệp.</span>
        </div>
      )}
    </div>
  );
};
