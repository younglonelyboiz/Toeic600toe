import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onNeedMigrationCheck }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isConfigured = authService.isConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!isConfigured) {
        throw new Error('Chưa cấu hình Supabase. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env');
      }

      if (mode === 'signup') {
        if (!email || !password) throw new Error('Vui lòng điền đầy đủ email và mật khẩu');
        if (password.length < 6) throw new Error('Mật khẩu cần tối thiểu 6 ký tự');
        if (!confirmPassword) throw new Error('Vui lòng nhập lại mật khẩu để xác nhận');
        if (password !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
        
        const res = await authService.signUp({ email, password, displayName });
        if (res.user && !res.session) {
          setSuccessMsg('Đăng ký thành công! Hãy kiểm tra hòm thư Email để xác nhận tài khoản.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Đăng ký thành công!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onNeedMigrationCheck(res.user.id);
          onClose();
        }, 800);
      } else {
        if (!email || !password) throw new Error('Vui lòng điền email và mật khẩu');
        const res = await authService.signIn({ email, password });
        setSuccessMsg('Đăng nhập thành công!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onNeedMigrationCheck(res.user.id);
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi xác thực');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="completion-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '32px 28px',
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-glow)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: 'white',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
            {mode === 'signin' ? 'Đăng nhập TOEIC Mastery' : 'Tạo tài khoản học viên'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Đồng bộ tiến độ 600 từ vựng và chuỗi ngày học trên mọi thiết bị
          </p>
        </div>

        {!isConfigured && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Chưa điền khóa Supabase:</strong> Thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> vào file <code>.env</code> để kích hoạt đám mây. Hiện tại app đang lưu cục bộ trên máy.
            </div>
          </div>
        )}


        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Tên hiển thị / Biệt danh
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Đức"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Địa chỉ Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Xác nhận mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${confirmPassword && confirmPassword !== password ? '#ef4444' : 'var(--border-subtle)'}`,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-muted)'
                  }}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                  ⚠️ Mật khẩu xác nhận chưa khớp
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div style={{ color: 'var(--danger)', fontSize: '0.82rem', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: 'var(--success)', fontSize: '0.82rem', background: 'var(--success-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              ✅ {successMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '6px', justifyContent: 'center' }}
          >
            <span>{loading ? 'Đang xử lý...' : (mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'signin' ? (
            <span>
              Chưa có tài khoản?{' '}
              <button 
                type="button"
                onClick={() => { 
                  setMode('signup'); 
                  setErrorMsg(''); 
                  setSuccessMsg('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'underline' }}
              >
                Đăng ký ngay
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <button 
                type="button"
                onClick={() => { 
                  setMode('signin'); 
                  setErrorMsg(''); 
                  setSuccessMsg('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={{ color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'underline' }}
              >
                Đăng nhập
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
