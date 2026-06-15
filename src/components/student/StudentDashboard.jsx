import { useState, useEffect } from 'react';
import { Banknote, CalendarCheck, BookOpen, Trophy, TrendingUp, User, Mail, Phone, Tag, AtSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFees, getStudentAttendance, getQuizzes, getStudentResults } from '../../utils/storage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ feeStatus: null, attendancePct: 0, availableQuizzes: 0, quizzesTaken: 0 });

  useEffect(() => {
    const now = new Date();
    const month = MONTHS[now.getMonth()];
    const year = now.getFullYear();

    const fees = getStudentFees(user.id);
    const thisMonthFee = fees.find(f => f.month === month && f.year === year);
    const attendance = getStudentAttendance(user.id);
    const present = attendance.filter(a => a.status === 'present').length;
    const pct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;
    const results = getStudentResults(user.id);

    setStats({
      feeStatus: thisMonthFee?.status || null,
      feeAmount: thisMonthFee?.amount,
      attendancePct: pct,
      totalAttendance: attendance.length,
      availableQuizzes: getQuizzes().length,
      quizzesTaken: results.length,
    });
  }, [user.id]);

  const monthName = MONTHS[new Date().getMonth()];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your academic overview for {monthName} {new Date().getFullYear()}.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className={`stat-icon ${stats.feeStatus === 'paid' ? 'green' : stats.feeStatus === 'unpaid' ? 'red' : 'yellow'}`}>
            <Banknote size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: stats.feeStatus ? 18 : 22 }}>
              {stats.feeStatus === 'paid' ? 'Paid' : stats.feeStatus === 'unpaid' ? 'Pending' : 'N/A'}
            </div>
            <div className="stat-label">This Month's Fee</div>
            {stats.feeAmount && <div style={{ fontSize: 11, color: '#94a3b8' }}>₹{stats.feeAmount?.toLocaleString()}</div>}
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${stats.attendancePct >= 75 ? 'green' : stats.attendancePct >= 50 ? 'yellow' : 'red'}`}>
            <CalendarCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-value">{stats.attendancePct}%</div>
            <div className="stat-label">Attendance</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{stats.totalAttendance} days recorded</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><BookOpen size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.availableQuizzes}</div>
            <div className="stat-label">Available Quizzes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Trophy size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.quizzesTaken}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <TrendingUp size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Attendance Progress
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: stats.attendancePct >= 75 ? '#059669' : '#dc2626' }}>
            {stats.attendancePct}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${stats.attendancePct >= 75 ? 'green' : stats.attendancePct >= 50 ? 'yellow' : 'red'}`}
            style={{ width: `${stats.attendancePct}%` }}
          />
        </div>
        {stats.attendancePct < 75 && stats.totalAttendance > 0 && (
          <div className="alert alert-danger" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} strokeWidth={2} />
            Your attendance is below 75%. Please attend more classes.
          </div>
        )}
        {stats.attendancePct >= 75 && stats.totalAttendance > 0 && (
          <div className="alert alert-success" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} strokeWidth={2} /> Good attendance! Keep it up.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <User size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            My Profile
          </span>
        </div>
        <div className="grid-2-sm">
          <div className="profile-field">
            <div className="profile-label"><User size={12} strokeWidth={2} /> Full Name</div>
            <div className="profile-value">{user?.name}</div>
          </div>
          <div className="profile-field">
            <div className="profile-label"><AtSign size={12} strokeWidth={2} /> Username</div>
            <div className="profile-value">{user?.username}</div>
          </div>
          {user?.email && (
            <div className="profile-field">
              <div className="profile-label"><Mail size={12} strokeWidth={2} /> Email</div>
              <div className="profile-value">{user.email}</div>
            </div>
          )}
          {user?.subject && (
            <div className="profile-field">
              <div className="profile-label"><Tag size={12} strokeWidth={2} /> Subject</div>
              <div className="profile-value"><span className="badge badge-info">{user.subject}</span></div>
            </div>
          )}
          {user?.phone && (
            <div className="profile-field">
              <div className="profile-label"><Phone size={12} strokeWidth={2} /> Phone</div>
              <div className="profile-value">{user.phone}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}