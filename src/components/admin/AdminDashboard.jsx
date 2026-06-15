import { useState, useEffect } from 'react';
import { Users, Banknote, UserCheck, BookOpen, TrendingUp } from 'lucide-react';
import { getStudents, getFees, getAttendance, getQuizzes } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ students: 0, feesPaidThisMonth: 0, todayPresent: 0, quizzes: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentFees, setRecentFees] = useState([]);

  useEffect(() => {
    const now = new Date();
    const month = MONTHS[now.getMonth()];
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    const students = getStudents();
    const fees = getFees();
    const attendance = getAttendance();
    const quizzes = getQuizzes();

    const feesPaidThisMonth = fees.filter(f => f.month === month && f.year === year && f.status === 'paid').length;
    const todayPresent = attendance.filter(a => a.date === today && a.status === 'present').length;

    setStats({ students: students.length, feesPaidThisMonth, todayPresent, quizzes: quizzes.length });
    setRecentStudents([...students].reverse().slice(0, 5));
    setRecentFees([...fees].reverse().slice(0, 5));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's your institution overview for today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.students}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Banknote size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.feesPaidThisMonth}</div>
            <div className="stat-label">Fees Paid This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><UserCheck size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.todayPresent}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><BookOpen size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{stats.quizzes}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Users size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Recent Students
            </span>
          </div>
          {recentStudents.length === 0 ? (
            <div className="empty-state">
              <Users size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', color: '#cbd5e1' }} />
              <p>No students yet. Add from Students section.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Name</th><th>Username</th><th>Subject</th></tr>
                </thead>
                <tbody>
                  {recentStudents.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.username}</td>
                      <td><span className="badge badge-info">{s.subject || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Recent Fee Records
            </span>
          </div>
          {recentFees.length === 0 ? (
            <div className="empty-state">
              <Banknote size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', color: '#cbd5e1' }} />
              <p>No fee records yet.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Month</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {recentFees.map(f => (
                    <tr key={f.id}>
                      <td>{f.month} {f.year}</td>
                      <td>₹{f.amount}</td>
                      <td>
                        <span className={`badge ${f.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                          {f.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}