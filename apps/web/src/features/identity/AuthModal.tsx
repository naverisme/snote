import { useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, GraduationCap, User, X } from 'lucide-react';
import { googleSignIn, login, passwordReset, passwordResetRequest, register } from '../../shared/api';
import type { Account } from '../../shared/types';
import { GoogleSignInButton } from './GoogleSignInButton';
import { toAccountUsages } from './usage-selection';
import './auth.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (account: Account) => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';
type ClassroomUsage = 'student' | 'teacher';

const CLASSROOM_OPTIONS: { id: ClassroomUsage; title: string; desc: string; icon: ComponentType<{ size: number }> }[] = [
  { id: 'student', title: 'Tham gia lớp học', desc: 'Theo dõi bài giao và làm việc cùng nhóm.', icon: User },
  { id: 'teacher', title: 'Tạo và quản lý lớp', desc: 'Giao bài và theo dõi tiến độ của lớp.', icon: GraduationCap },
];

const initialResetToken = typeof window === 'undefined'
  ? ''
  : /^#reset=([A-Za-z0-9_-]{20,})$/.exec(window.location.hash)?.[1] ?? '';

function authErrorMessage(error: unknown, view: AuthView): string {
  const response = error as { body?: { error?: { code?: string; message?: string } }; message?: string };
  const code = response?.body?.error?.code;
  if (code === 'UNAUTHENTICATED') return 'Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra và thử lại.';
  if (code === 'CONFLICT' && view === 'register') return 'Email này đã có tài khoản. Hãy chuyển sang đăng nhập.';
  if (code === 'ACCOUNT_LINK_REQUIRED') return 'Email này đã có tài khoản SNOTE. Hãy đăng nhập bằng mật khẩu trước.';
  if (code === 'INVALID_GOOGLE_CREDENTIAL') return 'Không thể xác minh tài khoản Google. Vui lòng thử lại.';
  if (code === 'EMAIL_NOT_CONFIGURED') return 'Chưa cấu hình dịch vụ gửi email. Hãy liên hệ người quản trị.';
  if (code === 'INVALID_INPUT' && view === 'reset') return 'Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.';
  if (error instanceof TypeError) return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  return response?.body?.error?.message || response?.message || 'Không thể hoàn tất thao tác. Vui lòng thử lại.';
}

const VIEW_COPY: Record<AuthView, { title: string; description: string; action: string }> = {
  login: {
    title: 'Chào mừng trở lại',
    description: 'Đăng nhập để tiếp tục công việc, lớp học và tài liệu của bạn.',
    action: 'Đăng nhập',
  },
  register: {
    title: 'Tạo tài khoản SNOTE',
    description: 'Bắt đầu với không gian cá nhân, rồi tham gia hoặc quản lý lớp học khi cần.',
    action: 'Tạo tài khoản',
  },
  forgot: {
    title: 'Lấy lại mật khẩu',
    description: 'Nhập email tài khoản. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu email đã được đăng ký.',
    action: 'Gửi liên kết',
  },
  reset: {
    title: 'Tạo mật khẩu mới',
    description: 'Chọn mật khẩu có ít nhất 12 ký tự. Các phiên đăng nhập cũ sẽ kết thúc sau khi đặt lại.',
    action: 'Lưu mật khẩu mới',
  },
};

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialResetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken] = useState(initialResetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [classroomUsages, setClassroomUsages] = useState<ClassroomUsage[]>([]);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!initialResetToken || typeof window === 'undefined') return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter(element => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>(view === 'reset' ? '#auth-new-password' : '#auth-email')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, view]);

  if (!isOpen) return null;

  const changeView = (next: AuthView) => {
    setView(next);
    setError(null);
    setInfo(null);
    setPassword('');
    setNewPassword('');
    setShowPassword(false);
  };

  const finishAuthentication = (account: Account) => {
    onAuthenticated(account);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (view === 'login') {
        const result = await login({ email: email.trim(), password });
        finishAuthentication(result.data);
      } else if (view === 'register') {
        if (password.length < 12) { setError('Mật khẩu cần ít nhất 12 ký tự.'); return; }
        const result = await register({ email: email.trim(), password, usages: toAccountUsages(classroomUsages), timeZone });
        finishAuthentication(result.data);
      } else if (view === 'forgot') {
        await passwordResetRequest(email.trim());
        setInfo('Nếu email đã được đăng ký, liên kết đặt lại mật khẩu đã được gửi. Hãy kiểm tra cả thư mục thư rác.');
      } else {
        if (newPassword.length < 12) { setError('Mật khẩu mới cần ít nhất 12 ký tự.'); return; }
        await passwordReset(resetToken, newPassword);
        changeView('login');
        setInfo('Mật khẩu đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới.');
      }
    } catch (caught) {
      setError(authErrorMessage(caught, view));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    if (loading || !demoEmail) return;
    setError(null);
    setLoading(true);
    try {
      const result = await login({ email: demoEmail, password: import.meta.env.VITE_DEMO_PASSWORD });
      finishAuthentication(result.data);
    } catch (caught) {
      setError(authErrorMessage(caught, 'login'));
    } finally { setLoading(false); }
  };

  const handleGoogleCredential = async (credential: string) => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const usages = view === 'register' ? toAccountUsages(classroomUsages) : ['personal'] as Account['usages'];
      const result = await googleSignIn({ credential, usages, timeZone });
      finishAuthentication(result.data);
    } catch (caught) {
      setError(authErrorMessage(caught, view));
    } finally { setLoading(false); }
  };

  const copy = VIEW_COPY[view];
  const passwordValue = view === 'reset' ? newPassword : password;
  const passwordSetter = view === 'reset' ? setNewPassword : setPassword;

  return (
    <div className="modal-overlay auth-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-content auth-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
        <header className="auth-header">
          <div className="auth-brand"><span className="auth-brand-mark" aria-hidden="true">S</span><span>SNOTE</span></div>
          <button type="button" className="auth-close" onClick={onClose} aria-label="Đóng cửa sổ tài khoản"><X size={19} /></button>
        </header>

        <div className="auth-intro">
          <h2 id="auth-title">{copy.title}</h2>
          <p id="auth-description">{copy.description}</p>
        </div>

        {error && <div className="auth-message auth-message-error" role="alert">{error}</div>}
        {info && <div className="auth-message auth-message-success" role="status">{info}</div>}

        {import.meta.env.DEV && view === 'login' && import.meta.env.VITE_DEMO_PASSWORD && (
          <div className="auth-demo">
            <p>Tài khoản thử nghiệm</p>
            <div className="auth-demo-actions">
              <button type="button" className="btn btn-secondary" disabled={loading || !import.meta.env.VITE_DEMO_STUDENT_EMAIL} onClick={() => handleQuickLogin(import.meta.env.VITE_DEMO_STUDENT_EMAIL || '')}><User size={16} /> Người học</button>
              <button type="button" className="btn btn-secondary" disabled={loading || !import.meta.env.VITE_DEMO_TEACHER_EMAIL} onClick={() => handleQuickLogin(import.meta.env.VITE_DEMO_TEACHER_EMAIL || '')}><GraduationCap size={16} /> Giáo viên</button>
            </div>
          </div>
        )}

        {(view === 'login' || view === 'register') && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="auth-google">
            <GoogleSignInButton clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} mode={view} onCredential={handleGoogleCredential} onError={setError} />
            <div className="auth-divider"><span>hoặc tiếp tục bằng email</span></div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {view !== 'reset' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Địa chỉ email</label>
              <input id="auth-email" className="form-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required value={email} onChange={event => setEmail(event.target.value)} placeholder="ten@vidu.com" />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'reset') && (
            <div className="form-group">
              <div className="auth-label-row">
                <label className="form-label" htmlFor={view === 'reset' ? 'auth-new-password' : 'auth-password'}>{view === 'reset' ? 'Mật khẩu mới' : 'Mật khẩu'}</label>
                {view === 'login' && <button type="button" className="auth-text-button" onClick={() => changeView('forgot')} disabled={loading}>Quên mật khẩu?</button>}
              </div>
              <div className="auth-password-field">
                <input id={view === 'reset' ? 'auth-new-password' : 'auth-password'} className="form-input" type={showPassword ? 'text' : 'password'} autoComplete={view === 'login' ? 'current-password' : 'new-password'} minLength={view === 'login' ? undefined : 12} required value={passwordValue} onChange={event => passwordSetter(event.target.value)} placeholder="Nhập mật khẩu" aria-describedby={view === 'register' || view === 'reset' ? 'auth-password-hint' : undefined} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {(view === 'register' || view === 'reset') && <p className="auth-field-hint" id="auth-password-hint">Ít nhất 12 ký tự.</p>}
            </div>
          )}

          {view === 'register' && (
            <>
              <fieldset className="auth-usage-fieldset">
                <legend className="form-label">Bạn sẽ dùng SNOTE cho lớp học?</legend>
                <p className="auth-field-hint">Chọn các cách dùng phù hợp. Bỏ qua nếu bạn chỉ cần không gian cá nhân.</p>
                <div className="role-cards-container">
                  {CLASSROOM_OPTIONS.map(option => {
                    const selected = classroomUsages.includes(option.id);
                    const Icon = option.icon;
                    return (
                      <label className={`role-card ${selected ? 'active' : ''}`} key={option.id}>
                        <input type="checkbox" className="auth-visually-hidden" checked={selected} onChange={() => setClassroomUsages(current => selected ? current.filter(value => value !== option.id) : [...current, option.id])} />
                        <span className="role-card-body"><span className="role-card-icon-box"><Icon size={18} /></span><span className="role-card-info"><span className="role-card-title">{option.title}</span><span className="role-card-desc">{option.desc}</span></span></span>
                        <span className="role-check-indicator" aria-hidden="true">{selected && <Check size={12} strokeWidth={3} />}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="auth-field-hint">Mọi tài khoản đều có không gian cá nhân.</p>
              </fieldset>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-timezone">Múi giờ</label>
                <input id="auth-timezone" className="form-input" type="text" autoComplete="off" required value={timeZone} onChange={event => setTimeZone(event.target.value)} />
              </div>
            </>
          )}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading || (view === 'reset' && !resetToken)}>{loading ? 'Đang xử lý…' : copy.action}</button>
        </form>

        <footer className="auth-footer">
          {view === 'login' && <p>Chưa có tài khoản? <button type="button" className="auth-text-button" onClick={() => changeView('register')} disabled={loading}>Tạo tài khoản</button></p>}
          {view === 'register' && <p>Đã có tài khoản? <button type="button" className="auth-text-button" onClick={() => changeView('login')} disabled={loading}>Đăng nhập</button></p>}
          {(view === 'forgot' || view === 'reset') && <button type="button" className="auth-text-button auth-back" onClick={() => changeView('login')} disabled={loading}><ArrowLeft size={16} /> Quay lại đăng nhập</button>}
          {view === 'reset' && <button type="button" className="auth-text-button" onClick={() => changeView('forgot')} disabled={loading}>Yêu cầu liên kết mới</button>}
        </footer>
      </div>
    </div>
  );
}
