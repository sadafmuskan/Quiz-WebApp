import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, UserCircle2, Eye, EyeOff,
  LogIn, KeyRound, X, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { login as storageLogin, getUserByUsername, resetUserPassword } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import FloatingBackground from '../shared/FloatingBackground';

/* ── Forgot Password Modal ────────────────────────────────────── */
function ForgotPasswordModal({ onClose }) {
  const [step, setStep]         = useState(1);       // 1 = find user, 2 = set password
  const [username, setUsername] = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [confirmPw,setConfirmPw]= useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  const handleFind = (e) => {
    e.preventDefault();
    setError('');
    const user = getUserByUsername(username.trim());
    if (!user) { setError('No account found with this username.'); return; }
    setStep(2);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    if (newPw.length < 6)      { setError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw)   { setError('Passwords do not match.'); return; }
    resetUserPassword(username.trim(), newPw);
    setDone(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fp-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">
            <KeyRound size={17} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {done ? 'Password Reset!' : 'Forgot Password'}
          </span>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        {done ? (
          <div className="fp-success">
            <div className="fp-success-icon"><CheckCircle2 size={44} strokeWidth={1.5} /></div>
            <p>Your password has been updated successfully.</p>
            <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>
              You can now log in with your new password.
            </p>
            <button className="login-btn" style={{ marginTop: 20 }} onClick={onClose}>
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="fp-steps">
              <div className={`fp-step ${step >= 1 ? 'active' : ''}`}>
                <span className="fp-step-dot">1</span>
                <span>Find Account</span>
              </div>
              <div className="fp-step-line" />
              <div className={`fp-step ${step >= 2 ? 'active' : ''}`}>
                <span className="fp-step-dot">2</span>
                <span>New Password</span>
              </div>
            </div>

            {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}

            {step === 1 && (
              <form onSubmit={handleFind} style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label className="form-label">Enter your Username</label>
                  <div className="input-icon-wrap">
                    <UserCircle2 size={15} className="input-icon" strokeWidth={2} />
                    <input
                      className="form-control with-icon"
                      placeholder="Your username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" className="login-btn" style={{ marginTop: 8 }}>
                  Find Account
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleReset} style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginBottom: 14 }}>
                  Setting new password for <strong style={{ color: 'var(--clr-primary-dark)' }}>{username}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrap">
                    <ShieldCheck size={15} className="input-icon" strokeWidth={2} />
                    <input
                      className="form-control with-icon with-icon-right"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-icon-wrap">
                    <ShieldCheck size={15} className="input-icon" strokeWidth={2} />
                    <input
                      className="form-control with-icon"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary"
                    onClick={() => { setStep(1); setError(''); setNewPw(''); setConfirmPw(''); }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="submit" className="login-btn" style={{ flex: 1, marginTop: 0 }}>
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Login Page ───────────────────────────────────────────────── */
export default function Login() {
  const [tab,       setTab]       = useState('admin');
  const [form,      setForm]      = useState({ username: '', password: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [showForgot,setShowForgot]= useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = storageLogin(form.username.trim(), form.password.trim());
    if (!user) { setError('Invalid username or password.'); return; }
    if (tab === 'admin'   && user.role !== 'admin')   { setError('This account is not an admin.');   return; }
    if (tab === 'student' && user.role !== 'student') { setError('This account is not a student.'); return; }
    login(user);
    navigate(user.role === 'admin' ? '/admin' : '/student');
  };

  const switchTab = (t) => { setTab(t); setError(''); setForm({ username: '', password: '' }); };

  return (
    <div className="login-page">
      <FloatingBackground dark />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <GraduationCap size={38} color="white" strokeWidth={2} />
          </div>
          <h1>Learn & Grow</h1>
          <p>Student Management Portal</p>
        </div>

        {/* Role tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => switchTab('admin')}>
            <ShieldCheck size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Admin
          </button>
          <button className={`login-tab ${tab === 'student' ? 'active' : ''}`} onClick={() => switchTab('student')}>
            <UserCircle2 size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Student
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-icon-wrap">
              <UserCircle2 size={16} className="input-icon" strokeWidth={2} />
              <input
                className="form-control with-icon"
                type="text"
                placeholder={tab === 'admin' ? 'admin' : 'Your username'}
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-icon-wrap">
              <ShieldCheck size={16} className="input-icon" strokeWidth={2} />
              <input
                className="form-control with-icon with-icon-right"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">
            <LogIn size={17} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 7 }} />
            Login as {tab === 'admin' ? 'Admin' : 'Student'}
          </button>
        </form>

        {tab === 'admin' && (
          <div className="login-hint">
            <strong>Default Admin Credentials</strong><br />
            Username: <strong>admin</strong> &nbsp;&nbsp; Password: <strong>admin123</strong>
          </div>
        )}
        {tab === 'student' && (
          <div className="login-hint">
            Student credentials are created by the Admin. Contact your admin for login details.
          </div>
        )}
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
}
