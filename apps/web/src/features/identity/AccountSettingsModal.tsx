import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  GraduationCap,
  User,
  Sparkles,
  Check,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Shield,
  Palette,
  UserCheck,
  KeyRound,
  Copy,
} from 'lucide-react';
import { changeUsages, logout, getMe, passwordReset } from '../../shared/api';
import type { Account } from '../../shared/types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onUpdated: (updated: Account) => void;
  onLoggedOut: () => void;
  activePersona?: 'student' | 'teacher';
  onPersonaChanged?: (persona: 'student' | 'teacher') => void;
}

type SettingsTab = 'persona' | 'appearance' | 'account';

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
  activePersona = 'student',
  onPersonaChanged,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('persona');
  const [usages, setUsages] = useState<Account['usages']>(account.usages);
  const [currentVersion, setCurrentVersion] = useState<number>(account.version);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Appearance states
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('snote_theme') as 'light' | 'dark' | 'system') || 'light';
  });
  const [userAlias, setUserAlias] = useState(() => {
    return localStorage.getItem('snote_user_alias') || '';
  });
  const [copiedId, setCopiedId] = useState(false);

  // Password reset states
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setUsages(account.usages);
    setCurrentVersion(account.version);
    setError(null);
    setSuccess(null);
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleApplyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('snote_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
    setSuccess('Đã cập nhật giao diện hiển thị');
  };

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('snote_user_alias', userAlias.trim());
    setSuccess('Đã lưu tên hiển thị thành công');
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(account.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

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
      setSuccess('Đã cập nhật quyền tài khoản thành công!');
    } catch (err: any) {
      try {
        const freshRes = await getMe();
        setCurrentVersion(freshRes.data.version);
        const retryRes = await changeUsages(next, freshRes.data.version);
        setCurrentVersion(retryRes.data.version);
        onUpdated(retryRes.data);
        setSuccess('Đã cập nhật quyền tài khoản thành công!');
      } catch (retryErr: any) {
        setError(retryErr?.body?.error?.message || err?.body?.error?.message || 'Lỗi cập nhật vai trò');
        setUsages(account.usages);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = async (persona: 'student' | 'teacher') => {
    if (onPersonaChanged) {
      onPersonaChanged(persona);
    }
    if (persona === 'teacher' && !usages.includes('teacher')) {
      // Auto-grant teacher usage
      await handleToggleUsage('teacher');
    } else {
      setSuccess(`Đã chuyển sang tư cách: ${persona === 'teacher' ? 'Giáo viên' : 'Học sinh'}`);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) {
      setError('Mật khẩu mới tối thiểu 12 ký tự');
      return;
    }
    setPasswordLoading(true);
    setError(null);
    try {
      if (resetToken.trim()) {
        await passwordReset(resetToken.trim(), newPassword);
        setSuccess('Mật khẩu đã được cập nhật thành công!');
        setNewPassword('');
        setResetToken('');
      } else {
        setError('Vui lòng nhập mã token xác thực đổi mật khẩu');
      }
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
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
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="modal-title">Cài đặt & Tùy chọn</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
        {success && (
          <div style={{ color: 'var(--success-dark)', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} />
            <span>{success}</span>
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="settings-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'persona'}
            className={`settings-nav-tab ${activeTab === 'persona' ? 'active' : ''}`}
            onClick={() => setActiveTab('persona')}
          >
            <UserCheck size={15} />
            <span>Tư cách & Vai trò</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            className={`settings-nav-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={15} />
            <span>Giao diện</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'account'}
            className={`settings-nav-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <Shield size={15} />
            <span>Tài khoản & Bảo mật</span>
          </button>
        </div>

        {/* TAB 1: PERSONA & USAGES */}
        {activeTab === 'persona' && (
          <div>
            {/* Active Working Persona Segmented Cards */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)' }}>
                  Tư cách làm việc hiện tại
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                  Đang hoạt động: {activePersona === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 10, lineHeight: 1.45 }}>
                Chọn góc nhìn làm việc chính của bạn. Tư cách Giáo viên mở quyền quản trị lớp, tạo bài giao và chấm bài; tư cách Học sinh dành cho làm bài và nộp bài.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Student Persona Option */}
                <div
                  className={`role-card ${activePersona === 'student' ? 'active' : ''}`}
                  onClick={() => handleSelectPersona('student')}
                  role="radio"
                  aria-checked={activePersona === 'student'}
                  tabIndex={0}
                >
                  <div className="role-card-body">
                    <div className="role-card-icon-box">
                      <User size={18} />
                    </div>
                    <div className="role-card-info">
                      <span className="role-card-title">Học sinh (Learner)</span>
                      <span className="role-card-desc">Làm bài tập, nộp bài, lịch học</span>
                    </div>
                  </div>
                  <div className="role-check-indicator" aria-hidden="true">
                    {activePersona === 'student' && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                {/* Teacher Persona Option */}
                <div
                  className={`role-card ${activePersona === 'teacher' ? 'active' : ''}`}
                  onClick={() => handleSelectPersona('teacher')}
                  role="radio"
                  aria-checked={activePersona === 'teacher'}
                  tabIndex={0}
                >
                  <div className="role-card-body">
                    <div className="role-card-icon-box">
                      <GraduationCap size={18} />
                    </div>
                    <div className="role-card-info">
                      <span className="role-card-title">Giáo viên (Teacher)</span>
                      <span className="role-card-desc">Tạo lớp, giao bài tập & chấm bài</span>
                    </div>
                  </div>
                  <div className="role-check-indicator" aria-hidden="true">
                    {activePersona === 'teacher' && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Usages & Capabilities */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="section-title" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)' }}>
                  Cấp quyền tính năng tài khoản (QA-01)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  {usages.length} quyền kích hoạt
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 10, lineHeight: 1.45 }}>
                Bật tính năng "Giáo viên" để kích hoạt quyền tạo lớp mới. Khi tắt, các lớp học cũ vẫn được bảo lưu quyền quản trị (STR-03).
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
          </div>
        )}

        {/* TAB 2: APPEARANCE (THEME, MOTION, LANGUAGE) */}
        {activeTab === 'appearance' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)', display: 'block', marginBottom: 4 }}>
                Chủ đề màu sắc (Theme)
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 12 }}>
                Tùy chỉnh diện mạo của Snote phù hợp với môi trường làm việc của bạn.
              </p>

              <div className="theme-options-grid">
                <div
                  className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleApplyTheme('light')}
                  role="button"
                  tabIndex={0}
                >
                  <Sun size={20} />
                  <span style={{ fontSize: '0.85rem' }}>Giao diện Sáng</span>
                </div>
                <div
                  className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleApplyTheme('dark')}
                  role="button"
                  tabIndex={0}
                >
                  <Moon size={20} />
                  <span style={{ fontSize: '0.85rem' }}>Giao diện Tối</span>
                </div>
                <div
                  className={`theme-card-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => handleApplyTheme('system')}
                  role="button"
                  tabIndex={0}
                >
                  <Monitor size={20} />
                  <span style={{ fontSize: '0.85rem' }}>Theo Hệ thống</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-light)', marginBottom: 20 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)', display: 'block', marginBottom: 4 }}>
                Ngôn ngữ hiển thị (Language)
              </span>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '8px 12px', background: 'var(--accent-light)', borderColor: 'var(--accent-border)', color: 'var(--accent-hover)', fontWeight: 600 }}
                >
                  Tiếng Việt (Mặc định)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '8px 12px' }}
                  onClick={() => setSuccess('Giao diện đang ưu tiên ngôn ngữ Tiếng Việt')}
                >
                  English (US)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNT & SECURITY */}
        {activeTab === 'account' && (
          <div>
            {/* Account ID Bar */}
            <div style={{ background: 'var(--surface-ground)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mã tài khoản (Account ID)
                </span>
                <button
                  type="button"
                  className="btn-link"
                  onClick={handleCopyId}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  <Copy size={12} />
                  <span>{copiedId ? 'Đã chép!' : 'Sao chép ID'}</span>
                </button>
              </div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--ink-title)' }}>
                {account.id}
              </div>
            </div>

            {/* Display Name / Alias Form */}
            <form onSubmit={handleSaveAlias} style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="user-alias-input">Tên hiển thị / Biệt danh đại diện</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="user-alias-input"
                    className="form-input"
                    type="text"
                    placeholder="Ví dụ: Thầy Hoàng, Cô Mai, Minh Triết..."
                    value={userAlias}
                    onChange={e => setUserAlias(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    Lưu tên
                  </button>
                </div>
              </div>
            </form>

            {/* Timezone Selector */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Múi giờ hoạt động</label>
              <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: 'var(--surface-ground)', fontSize: '0.85rem' }}>
                {account.timeZone} (Múi giờ hệ thống của bạn)
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordUpdate} style={{ paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <KeyRound size={15} />
                <span>Đổi mật khẩu bảo mật</span>
              </span>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-token-input">Mã Token đặt lại (hoặc mã xác thực)</label>
                <input
                  id="reset-token-input"
                  className="form-input"
                  type="text"
                  placeholder="Nhập mã token đặt lại..."
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-password-input">Mật khẩu mới (tối thiểu 12 ký tự)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="new-password-input"
                    className="form-input"
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={passwordLoading}>
                    {passwordLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Modal Footer with Logout & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} />
            <span>Đăng xuất thiết bị</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
