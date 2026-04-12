import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { authApi } from '../services/auth.store';
import { toast } from '../services/toast';

// Tabs: 'login' | 'register' | 'verify' | 'forgot' | 'reset'
const LoginRegister = () => {
  const navigate = useNavigate();
  const { login, register, verifyOtp } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [otp, setOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ otp: '', newPassword: '', confirm: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      if (err.message.includes('verify your email')) {
        setPendingEmail(loginForm.email);
        setTab('verify');
        toast.error('Please verify your email first.');
      } else {
        toast.error(err.message);
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) { toast.error('Passwords do not match'); return; }
    if (regForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(regForm.name, regForm.email, regForm.password);
      setPendingEmail(regForm.email);
      setTab('verify');
      toast.success('Account created! Check your email for the OTP.');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await verifyOtp(pendingEmail, otp);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    try {
      await authApi.resendOtp(pendingEmail);
      toast.success('New OTP sent to ' + pendingEmail);
    } catch (err) { toast.error(err.message); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setPendingEmail(forgotEmail);
      setTab('reset');
      toast.success('Reset OTP sent to your email!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetForm.newPassword !== resetForm.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(pendingEmail, resetForm.otp, resetForm.newPassword);
      toast.success('Password reset! You can now log in.');
      setTab('login');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel auth-card">

        {/* ===== LOGIN ===== */}
        {tab === 'login' && (
          <>
            <div className="auth-header">
              <h2>Welcome Back 👋</h2>
              <p>Sign in to your BBD account</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="you@bbd.ac.in" value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="••••••••" value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                  Show Password
                </label>
                <button type="button" className="auth-link" onClick={() => setTab('forgot')}>
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-switch">
              Don't have an account?{' '}
              <button className="auth-link" onClick={() => setTab('register')}>Create one</button>
            </p>
          </>
        )}

        {/* ===== REGISTER ===== */}
        {tab === 'register' && (
          <>
            <div className="auth-header">
              <h2>Create Account 🎓</h2>
              <p>Join the BBD Lost & Found community</p>
            </div>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" placeholder="Your Name" value={regForm.name}
                  onChange={e => setRegForm({ ...regForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="you@gmail.com" value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Min. 6 characters" value={regForm.password}
                  onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Re-enter password" value={regForm.confirm}
                  onChange={e => setRegForm({ ...regForm, confirm: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                  Show Passwords
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account & Send OTP'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account?{' '}
              <button className="auth-link" onClick={() => setTab('login')}>Sign In</button>
            </p>
          </>
        )}

        {/* ===== VERIFY OTP ===== */}
        {tab === 'verify' && (
          <>
            <div className="auth-header">
              <h2>Verify Email 📧</h2>
              <p>Enter the 6-digit OTP sent to<br /><strong>{pendingEmail}</strong></p>
            </div>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input
                  type="text"
                  className="form-control otp-input"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <p className="auth-switch">
              Didn't receive it?{' '}
              <button className="auth-link" onClick={handleResendOtp}>Resend OTP</button>
            </p>
            <p className="auth-switch">
              <button className="auth-link" onClick={() => setTab('login')}>← Back to Login</button>
            </p>
          </>
        )}

        {/* ===== FORGOT PASSWORD ===== */}
        {tab === 'forgot' && (
          <>
            <div className="auth-header">
              <h2>Forgot Password 🔑</h2>
              <p>Enter your email to receive a reset OTP</p>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" placeholder="you@gmail.com" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>
            </form>
            <p className="auth-switch">
              <button className="auth-link" onClick={() => setTab('login')}>← Back to Login</button>
            </p>
          </>
        )}

        {/* ===== RESET PASSWORD ===== */}
        {tab === 'reset' && (
          <>
            <div className="auth-header">
              <h2>Reset Password 🔒</h2>
              <p>Enter the OTP sent to <strong>{pendingEmail}</strong></p>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input type="text" className="form-control otp-input" placeholder="000000" maxLength={6}
                  value={resetForm.otp} onChange={e => setResetForm({ ...resetForm, otp: e.target.value.replace(/\D/g, '') })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Min. 6 characters"
                  value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type={showPassword ? "text" : "password"} className="form-control" placeholder="Re-enter password"
                  value={resetForm.confirm} onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                  Show Passwords
                </label>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
            <p className="auth-switch">
              <button className="auth-link" onClick={() => setTab('forgot')}>← Resend OTP</button>
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default LoginRegister;
