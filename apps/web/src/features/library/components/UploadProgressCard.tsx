import React from 'react';
import { CheckCircle2, AlertCircle, File, RotateCcw, X } from 'lucide-react';
import { formatBytes } from '../utils';

export type UploadState = 'uploading' | 'saving' | 'completed' | 'error';

export interface UploadProgressData {
  loadedBytes: number;
  totalBytes: number;
  percent: number;
}

export interface UploadProgressCardProps {
  fileName: string;
  fileSize: number;
  state: UploadState;
  progress: UploadProgressData;
  errorMessage?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

/**
 * CUXB-09 / LIB-15 Real-time Upload Progress card with:
 * - Exact byte progress: loadedBytes / totalBytes (percent%)
 * - Centered green checkmark on full completion (file + metadata saved)
 * - Error state with Retry button (never shows checkmark on error)
 * - 5-tier ink and Stageshow geometry (insets >= 12px, nested radius)
 */
export const UploadProgressCard: React.FC<UploadProgressCardProps> = ({
  fileName,
  fileSize,
  state,
  progress,
  errorMessage,
  onRetry,
  onCancel,
}) => {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-all duration-200 ${
        state === 'completed'
          ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
          : state === 'error'
            ? 'bg-red-50/80 border-red-300'
            : 'bg-[var(--surface-raised)] border-[var(--hairline)] shadow-[var(--shadow-raised)]'
      }`}
      role="region"
      aria-label={`Tiến độ tải lên tệp ${fileName}`}
    >
      {/* State: Completed (CUXB-09: Centered green checkmark) */}
      {state === 'completed' ? (
        <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <CheckCircle2 size={24} className="text-emerald-600 stroke-[2.5]" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-emerald-900">
            Tải lên và lưu thành công
          </span>
          <p className="text-xs text-emerald-700 font-mono mt-0.5 truncate max-w-xs">
            {fileName} ({formatBytes(fileSize)})
          </p>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <File size={15} className="text-blue-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--ink-title)] truncate">
                  {fileName}
                </p>
                <p className="text-[11px] text-[var(--ink-subtle)]">
                  {formatBytes(fileSize)}
                </p>
              </div>
            </div>

            {onCancel && state !== 'saving' && (
              <button
                type="button"
                onClick={onCancel}
                className="text-[var(--ink-muted)] hover:text-[var(--ink-title)] p-1 rounded-md transition-colors"
                title="Hủy tải lên"
                aria-label="Hủy tải lên"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Progress / Status display */}
          {state === 'uploading' && (
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--ink-body)] font-medium">
                  Đang tải lên dữ liệu...
                </span>
                <span className="font-mono text-[var(--ink-title)] font-semibold">
                  {formatBytes(progress.loadedBytes)} / {formatBytes(progress.totalBytes)} ({progress.percent}%)
                </span>
              </div>
              <div
                className="w-full bg-[var(--surface-ground)] rounded-full h-2 overflow-hidden border border-[var(--hairline)]"
                role="progressbar"
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="bg-[var(--accent)] h-full rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {state === 'saving' && (
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--ink-body)] font-medium">
                  Đang lưu thông tin mục vào Thư viện...
                </span>
                <span className="font-mono text-[var(--ink-subtle)]">100%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[var(--accent)] h-full rounded-full w-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Error State with Retry Button (CUXB-09) */}
          {state === 'error' && (
            <div className="mt-2 space-y-2">
              <div className="flex items-start gap-1.5 text-xs text-red-800">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium">
                  {errorMessage || 'Tải lên không thành công. Dữ liệu dở dang đã được dọn sạch.'}
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-2.5 py-1 text-xs text-[var(--ink-subtle)] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                )}
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors active:scale-95"
                  >
                    <RotateCcw size={12} />
                    <span>Thử lại</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
