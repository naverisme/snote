import React, { useState, useEffect } from 'react';
import { X, LogOut, GraduationCap, User, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { changeUsages, logout, getMe } from '../../shared/api';
import type { Account } from '../../shared/types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onUpdated: (updated: Account) => void;
  onLoggedOut: () => void;
}

const SETTINGS_ROLES: {
  id: 'student' | 'teacher' | 'personal';
  title: string;
  desc: string;
  icon: React.ComponentType<{ size: number }>;
}[] = [
  {
    id: 'student',
    title: 'Người học (Student)',
    desc: 'Tham gia lớp học, làm bài tập, theo dõi lịch và thư viện học tập',
    icon: User,
  },
  {
    id: 'teacher',
    title: 'Giáo viên (Teacher)',
    desc: 'Tạo và quản lý lớp học, phân công bài tập và theo dõi tiến độ',
    icon: GraduationCap,
  },
  {
    id: 'personal',
    title: 'Cá nhân (Personal)',
    desc: 'Quản lý công việc cá nhân, tài liệu và lịch trình độc lập',
    icon: Sparkles,
  },
];

export function AccountSettingsModal({
  isOpen,
  onClose,
  account,
  onUpdated,
  onLoggedOut,
}: AccountSettingsModalProps) {
  const [usages, setUsages] = useState<Account['usages']>(account.usages);
  const [currentVersion, setCurrentVersion] = useState<number>(account.version);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsages(account.usages);
    setCurrentVersion(account.version);
    setError(null);
    setSuccess(null);
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleToggleUsage = async (usage: 'student' | 'teacher' | 'personal') => {
    let next: Account['usages'];
    if (usages.includes(usage)) {
      if (usages.length <= 1) {
        setError('Tài khoản cần duy trì ít nhất một vai trò');
        return;
      }
      next = usages.filter(u => u !== usage);
    } else {
      next = [...usages, usage];
    }

    setUsages(next);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await changeUsages(next, currentVersion);
      setCurrentVersion(res.data.version);
      onUpdated(res.data);
      setSuccess('Đã cập nhật vai trò thành công!');
    } catch (err: any) {
      try {
        const freshRes = await getMe();
        setCurrentVersion(freshRes.data.version);
        const retryRes = await changeUsages(next, freshRes.data.version);
        setCurrentVersion(retryRes.data.version);
        onUpdated(retryRes.data);
        setSuccess('Đã cập nhật vai trò thành công!');
      } catch (retryErr: any) {
        setError(retryErr?.body?.error?.message || err?.body?.error?.message || 'Lỗi cập nhật vai trò');
        setUsages(account.usages);
      }
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
          <h2 className="modal-title">Cài đặt tài khoản & Vai trò</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
        {success && (
          <div style={{ color: 'var(--success-dark)', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}

        {/* Account Info Bar */}
        <div style={{ background: 'var(--surface-ground)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mã tài khoản (ID)
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-subtle)', fontFamily: 'monospace' }}>
              {account.id.slice(0, 18)}...
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Múi giờ hoạt động
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink-title)' }}>
              {account.timeZone}
            </span>
          </div>
        </div>

        {/* Roles & Usages Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="section-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-title)' }}>
              Vai trò & Cách dùng (QA-01)
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
              {usages.length} vai trò đang kích hoạt
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 12, lineHeight: 1.45 }}>
            Bật tính năng "Giáo viên" để tạo lớp học mới và quản trị lớp. Khi tắt, các lớp học cũ vẫn được bảo lưu quyền quản trị (STR-03).
          </p>

          <div className="role-cards-container">
            {SETTINGS_ROLES.map(role => {
              const isSelected = usages.includes(role.id);
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  className={`role-card ${isSelected ? 'active' : ''}`}
                  onClick={() => !loading && handleToggleUsage(role.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={e => {
                    if ((e.key === ' ' || e.key === 'Enter') && !loading) {
                      e.preventDefault();
                      handleToggleUsage(role.id);
                    }
                  }}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  <div className="role-card-body">
                    <div className="role-card-icon-box">
                      <Icon size={18} />
                    </div>
                    <div className="role-card-info">
                      <span className="role-card-title">{role.title}</span>
                      <span className="role-card-desc">{role.desc}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`role-toggle-switch ${isSelected ? 'is-active' : ''}`}>
                      {isSelected ? 'Đang bật' : 'Tắt'}
                    </span>
                    <div className="role-check-indicator" aria-hidden="true">
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
