import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, UserCircle2, Eye, EyeOff, LogIn } from 'lucide-react';
import { login as storageLogin } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('admin');
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = storageLogin(form.username.trim(), form.password.trim());
    if (!user) { setError('Invalid username or password.'); return; }
    if (tab === 'admin' && user.role !== 'admin') { setError('This account is not an admin.'); return; }
    if (tab === 'student' && user.role !== 'student') { setError('This account is not a student.'); return; }
    login(user);
    navigate(user.role === 'admin' ? '/admin' : '/student');
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <GraduationCap size={38} color="white" strokeWidth={2} />
          </div>
          <h1>EduApp</h1>
          <p>Student Management Portal</p>
        </div>

        {/* Role tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => { setTab('admin'); setError(''); setForm({ username: '', password: '' }); }}
          >
            <ShieldCheck size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Admin
          </button>
          <button
            className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => { setTab('student'); setError(''); setForm({ username: '', password: '' }); }}
          >
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
            <label className="form-label">Password</label>
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
    </div>
  );
}