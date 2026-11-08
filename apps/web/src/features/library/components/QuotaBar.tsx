import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { QuotaInfo } from '../types';
import { formatBytes } from '../utils';

export interface QuotaBarProps {
  quota: QuotaInfo | null;
  loading?: boolean;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({ quota, loading }) => {
  if (loading || !quota) {
    return (
      <div className="quota-bar-skeleton p-3 bg-gray-50 rounded-lg border border-gray-200 animate-pulse" aria-busy="true">
        <div className="h-3.5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-[6px] bg-gray-200 rounded-full w-full" />
      </div>
    );
  }

  const percent = Math.min(100, Math.round((quota.usedBytes / quota.totalBytes) * 100));

  return (
    <div
      className={`quota-bar-container p-3 rounded-lg border transition-colors ${
        quota.warning
          ? 'bg-amber-50/60 border-amber-300 text-amber-900'
          : 'bg-white border-gray-200 text-gray-800'
      }`}
      role="region"
      aria-label="Dung lượng lưu trữ workspace"
    >
      <div className="flex justify-between items-center text-xs font-medium mb-1.5">
        <span className="text-gray-900">
          Dung lượng: <strong className="font-semibold">{formatBytes(quota.usedBytes)}</strong> / {formatBytes(quota.totalBytes)} ({percent}%)
        </span>
        <span className="text-gray-500 font-normal">
          Còn lại: {formatBytes(quota.remainingBytes)} ({quota.itemCount} tệp)
        </span>
      </div>

      <div
        className="w-full bg-gray-200 rounded-full h-[6px] overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-[6px] rounded-full transition-all duration-300 ${
            percent >= 90 ? 'bg-red-600' : quota.warning ? 'bg-amber-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {quota.warning && (
        <div className="mt-2 text-xs flex items-center gap-1.5 font-medium text-amber-800" role="alert">
          <AlertTriangle size={13} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
          <span>Cảnh báo: Dung lượng lưu trữ của workspace đã đạt trên 80%. Hãy dọn dẹp hoặc tối ưu tệp.</span>
        </div>
      )}
    </div>
  );
};
