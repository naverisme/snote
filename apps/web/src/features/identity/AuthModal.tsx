import React, { useState } from 'react';
import { X } from 'lucide-react';
import { register, login, passwordResetRequest, passwordReset } from '../../shared/api';
import type { Account } from '../../shared/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (account: Account) => void;
}

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
      }
    } else {
      setUsages([...usages, usage]);
    }
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

        <form onSubmit={handleSubmit}>
          {tab !== 'reset' && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
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
              <label className="form-label">Mật khẩu {tab === 'register' && '(tối thiểu 12 ký tự)'}</label>
              <input
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
                <label className="form-label">Vai trò sử dụng (chọn ít nhất 1)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usages.includes('student')}
                      onChange={() => handleToggleUsage('student')}
                    />
                    <span>Người học (Student)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usages.includes('teacher')}
                      onChange={() => handleToggleUsage('teacher')}
                    />
                    <span>Giáo viên (Teacher - có quyền tạo lớp)</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={usages.includes('personal')}
                      onChange={() => handleToggleUsage('personal')}
                    />
                    <span>Cá nhân (Personal)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Múi giờ</label>
                <input
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
                <label className="form-label">Mã Token đặt lại</label>
                <input
                  className="form-input"
                  type="text"
                  required
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  placeholder="Nhập mã token..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới (tối thiểu 12 ký tự)</label>
                <input
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
