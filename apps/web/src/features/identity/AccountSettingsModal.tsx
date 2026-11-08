import React, { useState } from 'react';
import { X, LogOut } from 'lucide-react';
import { changeUsages, logout } from '../../shared/api';
import type { Account } from '../../shared/types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onUpdated: (updated: Account) => void;
  onLoggedOut: () => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  account,
  onUpdated,
  onLoggedOut,
}: AccountSettingsModalProps) {
  const [usages, setUsages] = useState<Account['usages']>(account.usages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleUsage = async (usage: 'student' | 'teacher' | 'personal') => {
    let next: Account['usages'];
    if (usages.includes(usage)) {
      if (usages.length <= 1) return; // At least one
      next = usages.filter(u => u !== usage);
    } else {
      next = [...usages, usage];
    }
    setUsages(next);
    setLoading(true);
    setError(null);
    try {
      const res = await changeUsages(next, account.version);
      onUpdated(res.data);
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi cập nhật vai trò');
      setUsages(account.usages); // Revert
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      onLoggedOut();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Cài đặt tài khoản</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}

        <div className="section-box" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mã tài khoản (ID)</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{account.id}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>Múi giờ</div>
          <div style={{ fontWeight: 500 }}>{account.timeZone}</div>
        </div>

        <div className="section-box" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Vai trò & Cách dùng (QA-01)</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Bật tính năng "Giáo viên" để tạo lớp học mới. Khi tắt, các lớp học cũ vẫn được bảo lưu quyền quản trị.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={usages.includes('student')}
                disabled={loading}
                onChange={() => handleToggleUsage('student')}
              />
              <span>Người học (Student)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={usages.includes('teacher')}
                disabled={loading}
                onChange={() => handleToggleUsage('teacher')}
              />
              <span>Giáo viên (Teacher - tạo lớp học)</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={usages.includes('personal')}
                disabled={loading}
                onChange={() => handleToggleUsage('personal')}
              />
              <span>Cá nhân (Personal)</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button type="button" className="btn btn-danger" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
