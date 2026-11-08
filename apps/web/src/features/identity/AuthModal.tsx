import React, { useState } from 'react';
import { X, GraduationCap, User, Sparkles, Check } from 'lucide-react';
import { register, login, passwordResetRequest, passwordReset } from '../../shared/api';
import type { Account } from '../../shared/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (account: Account) => void;
}

const ROLE_OPTIONS: { id: 'student' | 'teacher' | 'personal'; title: string; desc: string; icon: React.ComponentType<{ size: number }> }[] = [
  {
    id: 'student',
    title: 'Người học (Student)',
    desc: 'Tham gia lớp học, làm bài tập, theo dõi lịch và thư viện',
    icon: User,
  },
  {
    id: 'teacher',
    title: 'Giáo viên (Teacher)',
    desc: 'Tạo và quản lý lớp học, giao bài tập, chấm điểm và theo dõi tiến độ',
    icon: GraduationCap,
  },
  {
    id: 'personal',
    title: 'Cá nhân (Personal)',
    desc: 'Quản lý công việc cá nhân, tài liệu và lịch trình độc lập',
    icon: Sparkles,
  },
];

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usages, setUsages] = useState<Account['usages']>(['student']);
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
  );
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleUsage = (usage: 'student' | 'teacher' | 'personal') => {
    if (usages.includes(usage)) {
      if (usages.length > 1) {
        setUsages(usages.filter(u => u !== usage));
        setError(null);
      } else {
        setError('Tài khoản cần duy trì ít nhất 1 vai trò');
      }
    } else {
      setUsages([...usages, usage]);
      setError(null);
    }
  };

  const handleSelectOnly = (e: React.MouseEvent, usage: 'student' | 'teacher' | 'personal') => {
    e.stopPropagation();
    setUsages([usage]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login({ email, password });
        onAuthenticated(res.data);
        onClose();
      } else if (tab === 'register') {
        if (password.length < 12) {
          setError('Mật khẩu tối thiểu 12 ký tự');
          setLoading(false);
          return;
        }
        const res = await register({ email, password, usages, timeZone });
        onAuthenticated(res.data);
        onClose();
      } else if (tab === 'forgot') {
        await passwordResetRequest(email);
        setInfo('Nếu email tồn tại, yêu cầu đặt lại mật khẩu đã được ghi nhận.');
        setTab('reset');
      } else if (tab === 'reset') {
        if (newPassword.length < 12) {
          setError('Mật khẩu mới tối thiểu 12 ký tự');
          setLoading(false);
          return;
        }
        await passwordReset(resetToken, newPassword);
        setInfo('Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập.');
        setTab('login');
      }
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email: demoEmail, password: demoPass });
      onAuthenticated(res.data);
      onClose();
    } catch (err: any) {
      setError(err?.body?.error?.message || err?.message || 'Không thể đăng nhập tài khoản demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {tab === 'login' && 'Đăng nhập SNOTE v2'}
            {tab === 'register' && 'Đăng ký tài khoản SNOTE v2'}
            {tab === 'forgot' && 'Quên mật khẩu'}
            {tab === 'reset' && 'Đặt lại mật khẩu'}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng"><X size={16} /></button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.875rem' }}>{error}</div>}
        {info && <div style={{ color: 'var(--success)', marginBottom: 12, fontSize: '0.875rem' }}>{info}</div>}

        {import.meta.env.DEV && tab === 'login' && import.meta.env.VITE_DEMO_PASSWORD && (
          <div style={{ marginBottom: 16, padding: '12px', background: 'var(--surface-ground)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-subtle)', display: 'block', marginBottom: '8px' }}>
              Trải nghiệm tài khoản mẫu:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => handleQuickLogin(import.meta.env.VITE_DEMO_STUDENT_EMAIL || '', import.meta.env.VITE_DEMO_PASSWORD)}
                disabled={!import.meta.env.VITE_DEMO_STUDENT_EMAIL || loading}
              >
                <User size={13} />
                <span>Học sinh Demo</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => handleQuickLogin(import.meta.env.VITE_DEMO_TEACHER_EMAIL || '', import.meta.env.VITE_DEMO_PASSWORD)}
                disabled={!import.meta.env.VITE_DEMO_TEACHER_EMAIL || loading}
              >
                <GraduationCap size={13} />
                <span>Giáo viên Demo</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab !== 'reset' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="form-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          )}

          {(tab === 'login' || tab === 'register') && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Mật khẩu {tab === 'register' && '(tối thiểu 12 ký tự)'}</label>
              <input
                id="auth-password"
                className="form-input"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>
          )}

          {tab === 'register' && (
            <>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Vai trò sử dụng</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Chọn một hoặc nhiều vai trò</span>
                </div>
                <div className="role-cards-container">
                  {ROLE_OPTIONS.map(role => {
                    const isSelected = usages.includes(role.id);
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.id}
                        className={`role-card ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleUsage(role.id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleToggleUsage(role.id);
                          }
                        }}
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
                          {isSelected && usages.length > 1 && (
                            <button
                              type="button"
                              className="btn-link"
                              style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                              onClick={e => handleSelectOnly(e, role.id)}
                              title="Chỉ chọn vai trò này"
                            >
                              Chỉ chọn
                            </button>
                          )}
                          <div className="role-check-indicator" aria-hidden="true">
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          tabIndex={-1}
                          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-timezone">Múi giờ</label>
                <input
                  id="auth-timezone"
                  className="form-input"
                  type="text"
                  required
                  value={timeZone}
                  onChange={e => setTimeZone(e.target.value)}
                />
              </div>
            </>
          )}

          {tab === 'reset' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-reset-token">Mã Token đặt lại</label>
                <input
                  id="auth-reset-token"
                  className="form-input"
                  type="text"
                  required
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  placeholder="Nhập mã token..."
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-new-password">Mật khẩu mới (tối thiểu 12 ký tự)</label>
                <input
                  id="auth-new-password"
                  className="form-input"
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : tab === 'login' ? 'Đăng nhập' : tab === 'register' ? 'Đăng ký' : tab === 'forgot' ? 'Gửi yêu cầu' : 'Đặt lại mật khẩu'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          {tab === 'login' && (
            <>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setTab('register')}>Chưa có tài khoản? Đăng ký</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setTab('forgot')}>Quên mật khẩu?</button>
            </>
          )}
          {tab === 'register' && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setTab('login')}>Đã có tài khoản? Đăng nhập</button>
          )}
          {(tab === 'forgot' || tab === 'reset') && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setTab('login')}>Quay lại Đăng nhập</button>
          )}
        </div>
      </div>
    </div>
  );
}
