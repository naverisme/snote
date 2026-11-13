import { useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, GraduationCap, User, X, Loader2, RefreshCw } from 'lucide-react';
import { googleSignIn, login, passwordReset, passwordResetRequest, register, requestPasswordResetOtp, passwordResetWithOtp } from '../../shared/api';
import type { Account } from '../../shared/types';
import { VIETNAM_TIME_ZONE } from '../../shared/time-zone';
import { GoogleSignInButton } from './GoogleSignInButton';
import { toAccountUsages } from './usage-selection';
import './auth.css';

interface AuthModalProps {
  isOpen: boolean;
  presentation?: 'modal' | 'page';
  onClose?: () => void;
  onAuthenticated: (account: Account) => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';
type ClassroomUsage = 'student' | 'teacher';

const CLASSROOM_OPTIONS: { id: ClassroomUsage; title: string; desc: string; icon: ComponentType<{ size: number }> }[] = [
  { id: 'student', title: 'Tham gia lớp học', desc: 'Theo dõi bài giao và làm việc cùng nhóm.', icon: User },
  { id: 'teacher', title: 'Tạo và quản lý lớp', desc: 'Giao bài và theo dõi tiến độ của lớp.', icon: GraduationCap },
];

function readResetToken(): string {
  return typeof window === 'undefined'
    ? ''
    : /^#reset=([A-Za-z0-9_-]{20,})$/.exec(window.location.hash)?.[1] ?? '';
}

function authErrorMessage(error: unknown, view: AuthView): string {
  const response = error as { body?: { error?: { code?: string; message?: string } }; message?: string };
  const code = response?.body?.error?.code;
  if (code === 'UNAUTHENTICATED') return 'Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra và thử lại.';
  if (code === 'CONFLICT' && view === 'register') return 'Email này đã có tài khoản. Hãy chuyển sang đăng nhập.';
  if (code === 'ACCOUNT_LINK_REQUIRED') return 'Email này đã có tài khoản SNOTE. Hãy đăng nhập bằng mật khẩu trước.';
  if (code === 'INVALID_GOOGLE_CREDENTIAL') return 'Không thể xác minh tài khoản Google. Vui lòng thử lại.';
  if (code === 'EMAIL_NOT_CONFIGURED') return 'Chưa cấu hình dịch vụ gửi email. Hãy liên hệ người quản trị.';
  if (code === 'OTP_RATE_LIMITED') return 'Bạn đã yêu cầu hoặc nhập sai mã quá nhiều lần. Vui lòng chờ rồi thử lại.';
  if (code === 'INVALID_OTP') return 'Mã xác nhận không đúng hoặc đã hết hạn (10 phút). Vui lòng thử lại hoặc gửi lại mã.';
  if (code === 'INVALID_INPUT' && view === 'reset') return 'Thông tin đặt lại không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.';
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
    title: 'Lấy lại mật khẩu qua OTP',
    description: 'Nhập email tài khoản. Chúng tôi sẽ gửi mã xác nhận 6 số đến email của bạn.',
    action: 'Gửi mã xác nhận',
  },
  reset: {
    title: 'Đặt lại mật khẩu mới',
    description: 'Nhập mã xác nhận 6 số từ email và thiết lập mật khẩu mới (tối thiểu 12 ký tự).',
    action: 'Lưu mật khẩu mới',
  },
};

export function AuthModal({ isOpen, presentation = 'modal', onClose, onAuthenticated }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(() => readResetToken() ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetToken, setResetToken] = useState(readResetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [classroomUsages, setClassroomUsages] = useState<ClassroomUsage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = window.setTimeout(() => setOtpCountdown(sec => Math.max(0, sec - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCountdown]);

  useEffect(() => {
    if (!resetToken || typeof window === 'undefined') return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [resetToken]);

  useEffect(() => {
    if (!isOpen || presentation !== 'page') return;
    const handleResetLink = () => {
      const token = readResetToken();
      if (!token) return;
      setResetToken(token);
      setView('reset');
      setError(null);
      setInfo(null);
    };
    window.addEventListener('hashchange', handleResetLink);
    return () => window.removeEventListener('hashchange', handleResetLink);
  }, [isOpen, presentation]);

  useEffect(() => {
    if (!isOpen || presentation !== 'modal') return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
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
  }, [isOpen, presentation]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      if (view === 'reset') {
        if (!resetToken && resetOtpCode.length < 6) {
          dialogRef.current?.querySelector<HTMLElement>('#auth-reset-otp')?.focus();
        } else {
          dialogRef.current?.querySelector<HTMLElement>('#auth-new-password')?.focus();
        }
      } else {
        dialogRef.current?.querySelector<HTMLElement>('#auth-email')?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, view, resetToken]);

  if (!isOpen) return null;

  const changeView = (next: AuthView) => {
    setView(next);
    setError(null);
    setInfo(null);
    setPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetOtpCode('');
    setShowPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleOtpInput = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setResetOtpCode(clean);
    if (error) setError(null);
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      setResetOtpCode(pasted);
      if (error) setError(null);
    }
  };

  const handleResendOtp = async () => {
    if (loading || otpCountdown > 0 || !email.trim()) return;
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const result = await requestPasswordResetOtp(email.trim());
      setMaskedEmail(result.data.emailMasked || email.trim());
      setOtpCountdown(result.data.resendAfterSeconds || 60);
      setInfo(`Đã gửi lại mã xác nhận tới ${result.data.emailMasked || email.trim()}.`);
    } catch (caught) {
      setError(authErrorMessage(caught, 'forgot'));
    } finally {
      setLoading(false);
    }
  };

  const finishAuthentication = (account: Account) => {
    onAuthenticated(account);
    onClose?.();
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
        const result = await register({ email: email.trim(), password, usages: toAccountUsages(classroomUsages), timeZone: VIETNAM_TIME_ZONE });
        finishAuthentication(result.data);
      } else if (view === 'forgot') {
        if (!email.trim()) {
          setError('Vui lòng nhập địa chỉ email.');
          return;
        }
        const result = await requestPasswordResetOtp(email.trim());
        setMaskedEmail(result.data.emailMasked || email.trim());
        setOtpCountdown(result.data.resendAfterSeconds || 60);
        setView('reset');
        setInfo(`Mã xác nhận 6 số đã được gửi tới ${result.data.emailMasked || email.trim()}. Vui lòng kiểm tra hộp thư.`);
      } else {
        if (resetToken && !resetOtpCode) {
          if (newPassword.length < 12) { setError('Mật khẩu mới cần ít nhất 12 ký tự.'); return; }
          await passwordReset(resetToken, newPassword);
          changeView('login');
          setInfo('Mật khẩu đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới.');
          return;
        }

        const cleanOtp = resetOtpCode.trim();
        if (!/^\d{6}$/.test(cleanOtp)) {
          setError('Vui lòng nhập đủ 6 chữ số mã xác nhận.');
          return;
        }
        if (newPassword.length < 12) {
          setError('Mật khẩu mới cần ít nhất 12 ký tự.');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Mật khẩu xác nhận không khớp.');
          return;
        }
        await passwordResetWithOtp(email.trim(), cleanOtp, newPassword);
        changeView('login');
        setInfo('Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
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
      const result = await googleSignIn({ credential, usages, timeZone: VIETNAM_TIME_ZONE });
      finishAuthentication(result.data);
    } catch (caught) {
      setError(authErrorMessage(caught, view));
    } finally { setLoading(false); }
  };

  const copy = VIEW_COPY[view];
  const passwordValue = view === 'reset' ? newPassword : password;
  const passwordSetter = view === 'reset' ? setNewPassword : setPassword;

  const isPage = presentation === 'page';
  const Container = isPage ? 'main' : 'div';

  return (
    <Container className={isPage ? 'auth-page' : 'modal-overlay auth-overlay'} onMouseDown={event => { if (!isPage && event.target === event.currentTarget) onClose?.(); }}>
      <section className={isPage ? 'auth-dialog auth-page-dialog' : 'modal-content auth-dialog'} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
        <header className="auth-header">
          <div className="auth-brand"><span className="auth-brand-mark" aria-hidden="true">S</span><span>SNOTE</span></div>
          {!isPage && <button type="button" className="auth-close" onClick={onClose} aria-label="Đóng"><X size={19} /></button>}
        </header>

        <div className="auth-intro">
          {isPage ? <h1 id="auth-title">{copy.title}</h1> : <h2 id="auth-title">{copy.title}</h2>}
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

          {(view === 'login' || view === 'register') && (
            <div className="form-group">
              <div className="auth-label-row">
                <label className="form-label" htmlFor="auth-password">Mật khẩu</label>
                {view === 'login' && <button type="button" className="auth-text-button" onClick={() => changeView('forgot')} disabled={loading}>Quên mật khẩu?</button>}
              </div>
              <div className="auth-password-field">
                <input id="auth-password" className="form-input" type={showPassword ? 'text' : 'password'} autoComplete={view === 'login' ? 'current-password' : 'new-password'} minLength={view === 'login' ? undefined : 12} required value={password} onChange={event => setPassword(event.target.value)} placeholder="Nhập mật khẩu" aria-describedby={view === 'register' ? 'auth-password-hint' : undefined} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {view === 'register' && <p className="auth-field-hint" id="auth-password-hint">Ít nhất 12 ký tự.</p>}
            </div>
          )}

          {view === 'reset' && (
            <div className="auth-reset-container animate-slide-down">
              {maskedEmail && (
                <div className="auth-email-badge">
                  <span>Mã gửi tới: <strong>{maskedEmail}</strong></span>
                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() => changeView('forgot')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    Đổi email
                  </button>
                </div>
              )}

              {!maskedEmail && !email && (
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-email">Địa chỉ email</label>
                  <input
                    id="auth-email"
                    className="form-input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="ten@vidu.com"
                  />
                </div>
              )}

              {!resetToken && (
                <div className="form-group">
                  <div className="auth-label-row">
                    <label className="form-label" htmlFor="auth-reset-otp">Mã xác nhận (6 số)</label>
                    <button
                      type="button"
                      className="auth-text-button auth-resend-inline"
                      onClick={handleResendOtp}
                      disabled={loading || otpCountdown > 0 || !email.trim()}
                    >
                      {otpCountdown > 0 ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Gửi lại ({otpCountdown}s)</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={13} />
                          <span>Gửi lại mã</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="auth-otp-field-row">
                    <input
                      id="auth-reset-otp"
                      className="form-input auth-otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={resetOtpCode}
                      onChange={event => handleOtpInput(event.target.value)}
                      onPaste={handleOtpPaste}
                      placeholder="••••••"
                    />
                    <span className="auth-otp-count">{resetOtpCode.length}/6 số</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="auth-new-password">Mật khẩu mới</label>
                <div className="auth-password-field">
                  <input
                    id="auth-new-password"
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={newPassword}
                    onChange={event => setNewPassword(event.target.value)}
                    placeholder="Tối thiểu 12 ký tự"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(current => !current)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={`auth-field-hint ${newPassword.length >= 12 ? 'auth-hint-valid' : ''}`}>
                  {newPassword.length >= 12 ? '✓ Đạt độ dài tối thiểu' : `Cần tối thiểu 12 ký tự (${newPassword.length}/12)`}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">Nhập lại mật khẩu mới</label>
                <div className="auth-password-field">
                  <input
                    id="auth-confirm-password"
                    className="form-input"
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={12}
                    required
                    value={confirmNewPassword}
                    onChange={event => setConfirmNewPassword(event.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmNewPassword(current => !current)}
                    aria-label={showConfirmNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-pressed={showConfirmNewPassword}
                  >
                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmNewPassword.length > 0 && (
                  <p className={`auth-field-hint ${newPassword === confirmNewPassword ? 'auth-hint-valid' : 'auth-hint-invalid'}`}>
                    {newPassword === confirmNewPassword ? '✓ Mật khẩu xác nhận trùng khớp' : '✗ Mật khẩu xác nhận chưa khớp'}
                  </p>
                )}
              </div>
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
            </>
          )}

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={
              loading ||
              (view === 'reset' && (
                resetToken
                  ? newPassword.length < 12
                  : (resetOtpCode.length !== 6 || newPassword.length < 12 || newPassword !== confirmNewPassword)
              ))
            }
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý…</span>
              </span>
            ) : copy.action}
          </button>
        </form>

        <footer className="auth-footer">
          {view === 'login' && <p>Chưa có tài khoản? <button type="button" className="auth-text-button" onClick={() => changeView('register')} disabled={loading}>Tạo tài khoản</button></p>}
          {view === 'register' && <p>Đã có tài khoản? <button type="button" className="auth-text-button" onClick={() => changeView('login')} disabled={loading}>Đăng nhập</button></p>}
          {(view === 'forgot' || view === 'reset') && <button type="button" className="auth-text-button auth-back" onClick={() => changeView('login')} disabled={loading}><ArrowLeft size={16} /> Quay lại đăng nhập</button>}
          {view === 'reset' && !resetToken && <button type="button" className="auth-text-button" onClick={() => changeView('forgot')} disabled={loading}>Gửi lại tới email khác</button>}
        </footer>
      </section>
    </Container>
  );
}
