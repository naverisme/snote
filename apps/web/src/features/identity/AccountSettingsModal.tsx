import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  LogOut,
  GraduationCap,
  User,
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
  Mail,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { changeProfile, changeUsages, logout, getMe, requestPasswordChangeOtp, changePasswordWithOtp } from '../../shared/api';
import type { Account } from '../../shared/types';
import { toggleClassroomUsage } from './usage-selection';
import './account-settings.css';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  onUpdated: (updated: Account) => void;
  onLoggedOut: () => void;
}

type SettingsTab = 'persona' | 'appearance' | 'account';

const CLASSROOM_OPTIONS: {
  id: 'student' | 'teacher';
  title: string;
  desc: string;
  icon: React.ComponentType<{ size: number }>;
}[] = [
  {
    id: 'student',
    title: 'Tôi tham gia lớp học',
    desc: 'Xem bài giao và nội dung trong các lớp mình tham gia',
    icon: User,
  },
  {
    id: 'teacher',
    title: 'Tôi tạo và quản lý lớp học',
    desc: 'Tạo lớp, giao bài và theo dõi tiến độ của lớp mình',
    icon: GraduationCap,
  },
];

export function AccountSettingsModal({
  isOpen,
  onClose,
  account,
  onUpdated,
  onLoggedOut,
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
  const [userAlias, setUserAlias] = useState(account.displayName || '');
  const [copiedId, setCopiedId] = useState(false);

  // Password change by email code
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formShaking, setFormShaking] = useState(false);
  const [inlinePasswordError, setInlinePasswordError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsages(account.usages);
    setCurrentVersion(account.version);
    setUserAlias(account.displayName || '');
    setError(null);
    setSuccess(null);
    setInlinePasswordError(null);
    setFormShaking(false);
    setPasswordChangeSuccess(false);
  }, [account, isOpen]);

  useEffect(() => {
    if (!isOpen || resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [isOpen, resendSeconds]);

  useEffect(() => {
    if (otpSent && !passwordChangeSuccess && isOpen) {
      const timer = window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [otpSent, passwordChangeSuccess, isOpen]);

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

  const handleSaveAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await changeProfile(userAlias.trim(), currentVersion);
      setCurrentVersion(result.data.version);
      onUpdated(result.data);
      setSuccess('Đã lưu tên hiển thị.');
    } catch (cause: any) {
      setError(cause?.body?.error?.message || 'Không thể lưu tên hiển thị. Hãy tải lại và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(account.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleToggleUsage = async (usage: 'student' | 'teacher') => {
    const next = toggleClassroomUsage(usages, usage);

    setUsages(next);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await changeUsages(next, currentVersion);
      setCurrentVersion(res.data.version);
      onUpdated({ ...account, usages: res.data.usages, version: res.data.version });
      setSuccess('Đã cập nhật cách dùng SNOTE.');
    } catch (err: any) {
      try {
        const freshRes = await getMe();
        setCurrentVersion(freshRes.data.version);
        const retryRes = await changeUsages(next, freshRes.data.version);
        setCurrentVersion(retryRes.data.version);
        onUpdated({ ...freshRes.data, usages: retryRes.data.usages, version: retryRes.data.version });
        setSuccess('Đã cập nhật cách dùng SNOTE.');
      } catch (retryErr: any) {
        setError(retryErr?.body?.error?.message || err?.body?.error?.message || 'Không thể cập nhật cách dùng SNOTE');
        setUsages(account.usages);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = (msg: string) => {
    setInlinePasswordError(msg);
    setFormShaking(true);
    window.setTimeout(() => setFormShaking(false), 450);
  };

  const handleOtpChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setOtpCode(clean);
    if (inlinePasswordError) setInlinePasswordError(null);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      setOtpCode(pasted);
      if (inlinePasswordError) setInlinePasswordError(null);
      if (pasted.length === 6) {
        document.getElementById('new-password-input')?.focus();
      }
    }
  };

  const handleRequestOtp = async () => {
    if (otpRequestLoading || resendSeconds > 0) return;
    setOtpRequestLoading(true);
    setError(null);
    setInlinePasswordError(null);
    setSuccess(null);
    try {
      const result = await requestPasswordChangeOtp();
      setOtpSent(true);
      setOtpEmail(result.data.emailMasked);
      setOtpCode('');
      setResendSeconds(result.data.resendAfterSeconds);
      setSuccess('Mã 6 chữ số đã được gửi qua email. Vui lòng kiểm tra hộp thư (kể cả mục thư rác).');
    } catch (cause: any) {
      const code = cause?.body?.error?.code;
      const retrySec = cause?.body?.error?.details?.retryAfterSeconds;
      if (retrySec && typeof retrySec === 'number') {
        setResendSeconds(retrySec);
      }
      const msg = code === 'EMAIL_NOT_CONFIGURED' ? 'Chưa cấu hình dịch vụ email. Vui lòng liên hệ quản trị viên.'
        : code === 'EMAIL_DELIVERY_FAILED' ? 'Không thể gửi email đến hộp thư của bạn. Vui lòng thử lại sau.'
        : code === 'OTP_RATE_LIMITED' ? (retrySec ? `Đã yêu cầu mã quá nhanh. Vui lòng chờ ${retrySec} giây rồi thử lại.` : 'Bạn đã yêu cầu mã quá nhiều lần. Vui lòng chờ rồi thử lại.')
        : 'Không thể gửi mã. Kiểm tra kết nối và thử lại.';
      setError(msg);
      triggerShake(msg);
    } finally {
      setOtpRequestLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlinePasswordError(null);
    if (!/^\d{6}$/.test(otpCode)) {
      triggerShake('Vui lòng nhập đủ 6 chữ số trong email.');
      otpInputRef.current?.focus();
      return;
    }
    if (newPassword.length < 12) {
      triggerShake('Mật khẩu mới cần tối thiểu 12 ký tự.');
      document.getElementById('new-password-input')?.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerShake('Mật khẩu nhập lại chưa trùng khớp.');
      document.getElementById('confirm-password-input')?.focus();
      return;
    }
    setPasswordLoading(true);
    setError(null);
    try {
      await changePasswordWithOtp(otpCode, newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setPasswordChangeSuccess(true);
      setSuccess('Mật khẩu đã đổi thành công. Toàn bộ phiên cũ đã được thu hồi an toàn.');
      window.setTimeout(() => {
        onLoggedOut();
        onClose();
      }, 1600);
    } catch (cause: any) {
      const code = cause?.body?.error?.code;
      const retrySec = cause?.body?.error?.details?.retryAfterSeconds;
      if (retrySec && typeof retrySec === 'number') {
        setResendSeconds(retrySec);
      }
      const msg = code === 'OTP_RATE_LIMITED'
        ? (retrySec ? `Đã nhập sai quá 5 lần. Tài khoản tạm khóa bảo mật trong ${Math.ceil(retrySec / 60)} phút.` : 'Bạn đã nhập sai quá nhiều lần. Yêu cầu mã mới sau 15 phút.')
        : code === 'INVALID_OTP'
        ? 'Mã xác nhận không đúng hoặc đã hết hạn (10 phút). Vui lòng kiểm tra email mới nhất hoặc gửi lại mã.'
        : 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      setError(msg);
      triggerShake(msg);
      if (code === 'INVALID_OTP') {
        otpInputRef.current?.focus();
      }
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
      <div className="modal-content" onClick={e => e.stopPropagation()}
        style={{ width: 'min(640px, calc(100vw - 24px))', maxWidth: '640px', minWidth: 0 }}>
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
            <span>Cách dùng SNOTE</span>
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

        {/* TAB 1: ACCOUNT USAGES */}
        {activeTab === 'persona' && (
          <div>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="form-label">Bạn có dùng SNOTE trong lớp học không?</legend>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 10, lineHeight: 1.45 }}>
                Có thể chọn cả hai. Không chọn mục nào nếu bạn chỉ dùng SNOTE cho công việc cá nhân.
              </p>

              <div className="role-cards-container">
                {CLASSROOM_OPTIONS.map(role => {
                  const isSelected = usages.includes(role.id);
                  const Icon = role.icon;
                  return (
                    <label
                      key={role.id}
                      className={`role-card ${isSelected ? 'active' : ''}`}
                      style={{ opacity: loading ? 0.7 : 1 }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={loading}
                        onChange={() => void handleToggleUsage(role.id)}
                        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
                      />
                      <div className="role-card-body">
                        <div className="role-card-icon-box">
                          <Icon size={18} />
                        </div>
                        <div className="role-card-info">
                          <span className="role-card-title">{role.title}</span>
                          <span className="role-card-desc">{role.desc}</span>
                        </div>
                      </div>
                      <div className="role-check-indicator" aria-hidden="true">
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </label>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 10, lineHeight: 1.45 }}>
                Mọi tài khoản đều có không gian cá nhân. Bật Giáo viên để tạo lớp mới; tắt mục này không làm mất quyền chủ của lớp đã tạo.
              </p>
            </fieldset>
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
                    maxLength={120}
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    Lưu tên
                  </button>
                </div>
              </div>
            </form>

            <section style={{ paddingTop: 16, borderTop: '1px solid var(--border-light)' }} aria-labelledby="password-change-title">
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-title)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <KeyRound size={15} />
                <span id="password-change-title">Đổi mật khẩu qua email</span>
              </span>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.82rem', marginBottom: 12 }}>
                Gửi mã 6 chữ số đến email tài khoản. Mã dùng một lần trong 10 phút. Đổi thành công sẽ đăng xuất toàn bộ các thiết bị.
              </p>

              {passwordChangeSuccess ? (
                <div className="password-success-card animate-slide-down">
                  <div className="animate-success-pop" style={{ color: 'var(--success-dark)' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="password-success-card-title">Đổi mật khẩu thành công</div>
                  <div className="password-success-card-desc">
                    Mật khẩu mới đã được kích hoạt. Toàn bộ phiên làm việc cũ đã được thu hồi an toàn. Đang chuyển hướng về trang đăng nhập...
                  </div>
                  <div style={{ width: '100%', height: 3, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                    <div style={{ width: '100%', height: '100%', background: 'var(--success)', animation: 'slideDownFade 1.5s linear forwards' }} />
                  </div>
                </div>
              ) : !otpSent ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRequestOtp}
                  disabled={otpRequestLoading}
                  style={{ minWidth: 150 }}
                >
                  {otpRequestLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Đang gửi mã…</span>
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      <span>Gửi mã qua email</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="animate-slide-down">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                    <span>Mã đã gửi tới:</span>
                    <strong style={{ color: 'var(--ink-title)' }}>{otpEmail}</strong>
                  </div>

                  {inlinePasswordError && (
                    <div className="inline-form-error animate-shake" role="alert">
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{inlinePasswordError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate} className={formShaking ? 'animate-shake' : ''}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="password-otp-input">Mã xác nhận (6 chữ số)</label>
                      <div className="otp-input-container">
                        <input
                          id="password-otp-input"
                          ref={otpInputRef}
                          className={`otp-digit-input ${inlinePasswordError && !/^\d{6}$/.test(otpCode) ? 'has-error' : ''}`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={event => handleOtpChange(event.target.value)}
                          onPaste={handleOtpPaste}
                          placeholder="••••••"
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                          {otpCode.length}/6 số
                        </span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="new-password-input">Mật khẩu mới</label>
                      <div className="password-input-wrapper">
                        <input
                          id="new-password-input"
                          className="form-input"
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Tối thiểu 12 ký tự"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          minLength={12}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword(v => !v)}
                          title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      {/* Live Password Strength & Criteria Checklist */}
                      <div className="password-criteria-list">
                        <div className={`password-criterion ${newPassword.length >= 12 ? 'valid' : ''}`}>
                          <span className="password-criterion-icon">
                            {newPassword.length >= 12 ? <Check size={12} /> : '•'}
                          </span>
                          <span>Độ dài từ 12 ký tự trở lên ({newPassword.length}/12)</span>
                        </div>
                        {confirmPassword.length > 0 && (
                          <div className={`password-criterion ${newPassword === confirmPassword ? 'valid' : ''}`}>
                            <span className="password-criterion-icon">
                              {newPassword === confirmPassword ? <Check size={12} /> : '•'}
                            </span>
                            <span>{newPassword === confirmPassword ? 'Mật khẩu xác nhận đã trùng khớp' : 'Mật khẩu xác nhận chưa khớp'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="confirm-password-input">Nhập lại mật khẩu mới</label>
                      <div className="password-input-wrapper">
                        <input
                          id="confirm-password-input"
                          className="form-input"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Nhập lại mật khẩu mới"
                          minLength={12}
                          required
                          value={confirmPassword}
                          onChange={event => setConfirmPassword(event.target.value)}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={passwordLoading || newPassword.length < 12 || newPassword !== confirmPassword || otpCode.length !== 6}
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Đang xác nhận…</span>
                          </>
                        ) : (
                          'Xác nhận đổi mật khẩu'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm resend-btn"
                        onClick={handleRequestOtp}
                        disabled={otpRequestLoading || resendSeconds > 0}
                      >
                        {otpRequestLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Đang gửi mã…</span>
                          </>
                        ) : resendSeconds > 0 ? (
                          <>
                            <RefreshCw size={14} className="animate-pulse-subtle" />
                            <span>Gửi lại sau {resendSeconds}s</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={14} />
                            <span>Gửi lại mã</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
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
