import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(() => {
    const notice = localStorage.getItem('snote_session_expired_notice');
    if (notice) {
      localStorage.removeItem('snote_session_expired_notice');
      return notice;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === '1') {
      return 'Phiên làm việc đã hết hạn sau thời gian dài không hoạt động. Các thay đổi và bản nháp gần nhất của bạn đã được sao lưu an toàn.';
    }
    return null;
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/notes');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công, vui lòng kiểm tra lại email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleFillStudent = () => {
    setEmail('sinhvien@snote.edu.vn');
    setPassword('Student@123456');
    setError(null);
  };

  const handleFillAdmin = () => {
    setEmail('admin@snote.edu.vn');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        padding: '24px'
      }}
    >
      <div
        className="snote-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-accent)'
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              margin: '0 0 6px 0',
              letterSpacing: '-0.03em'
            }}
          >
            Đăng nhập <span style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SNOTE</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
            Second Brain & Workspace học tập thông minh cho Sinh viên
          </p>
        </div>

        {/* Session Expired Notice */}
        {sessionNotice && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: 'var(--accent-primary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '13px',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{sessionNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'var(--color-danger-subtle)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--color-danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '13.5px',
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Email tài khoản
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="sinhvien@snote.edu.vn hoặc admin@snote.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="snote-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="snote-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: '14.5px',
              fontWeight: 700,
              marginTop: '6px'
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hoặc tiếp tục với
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton onSuccess={() => navigate('/notes')} text="Đăng nhập bằng Google" />

        {/* Demo Quick Fills */}
        <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
            TÀI KHOẢN TRẢI NGHIỆM MẪU (1-CLICK FILL):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={handleFillStudent}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', justifyContent: 'center' }}
            >
              <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
              <span>Sinh Viên</span>
            </button>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', justifyContent: 'center' }}
            >
              <ShieldCheck size={13} style={{ color: 'var(--color-danger)' }} />
              <span>Admin Hệ Thống</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Chưa có tài khoản sinh viên?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700 }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
