import { useState, useEffect } from 'react';
import { TrendingUp, CalendarCheck, BookOpen, Banknote, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentAttendance, getStudentFees, getStudentResults, getQuizzes,
} from '../../utils/storage';

function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function ProgressReport() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [fees,       setFees]       = useState([]);
  const [results,    setResults]    = useState([]);
  const [quizzes,    setQuizzes]    = useState([]);

  useEffect(() => {
    if (!user) return;
    setAttendance(getStudentAttendance(user.id));
    setFees(getStudentFees(user.id));
    setResults(getStudentResults(user.id));
    setQuizzes(getQuizzes());
  }, [user]);

  // ── Attendance stats ──
  const totalDays    = attendance.length;
  const presentDays  = attendance.filter(a => a.status === 'present').length;
  const attPct       = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // ── Quiz stats ──
  const avgScore = results.length > 0
    ? Math.round(results.reduce((s, r) => s + Math.round((r.score / r.total) * 100), 0) / results.length)
    : 0;
  const bestScore = results.length > 0
    ? Math.max(...results.map(r => Math.round((r.score / r.total) * 100)))
    : 0;

  // ── Fee stats ──
  const paidFees  = fees.filter(f => f.status === 'paid').length;
  const dueFees   = fees.filter(f => f.status !== 'paid').length;
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);

  // ── Last 6 months attendance ──
  const now = new Date();
  const monthlyAtt = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const yy    = d.getFullYear();
    const mm    = String(d.getMonth() + 1).padStart(2, '0');
    const prefix= `${yy}-${mm}`;
    const rows  = attendance.filter(a => a.date.startsWith(prefix));
    const p     = rows.filter(a => a.status === 'present').length;
    const pct   = rows.length > 0 ? Math.round((p / rows.length) * 100) : null;
    return { label: d.toLocaleString('default', { month: 'short' }), pct, present: p, total: rows.length };
  });

  return (
    <div>
      <div className="page-header">
        <h1>My Progress Report</h1>
        <p>Your complete academic performance overview.</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid">
        <StatCard icon={<CalendarCheck size={22} strokeWidth={2} />} value={`${attPct}%`}  label="Attendance Rate"  color="yellow" />
        <StatCard icon={<BookOpen      size={22} strokeWidth={2} />} value={`${avgScore}%`} label="Avg Quiz Score"   color="blue"   />
        <StatCard icon={<Award         size={22} strokeWidth={2} />} value={`${bestScore}%`}label="Best Quiz Score"  color="purple" />
        <StatCard icon={<Banknote      size={22} strokeWidth={2} />} value={paidFees}       label="Fees Paid"        color="green"  />
      </div>

      <div className="grid-2">
        {/* Attendance Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CalendarCheck size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Attendance Overview
            </span>
            <span className={`badge ${attPct >= 75 ? 'badge-success' : attPct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
              {attPct}%
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 6 }}>
              <span>{presentDays} present / {totalDays - presentDays} absent</span>
              <span>{totalDays} total days</span>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill green" style={{ width: `${attPct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          <div className="prog-month-grid">
            {monthlyAtt.map(m => (
              <div key={m.label} className="prog-month-col">
                <div className="prog-month-bar-wrap">
                  <div className="prog-month-bar" style={{ height: m.pct != null ? `${Math.max(m.pct, 4)}%` : '4%', background: m.pct == null ? '#e2e8f0' : m.pct >= 75 ? '#10b981' : m.pct >= 50 ? '#eab308' : '#ef4444' }} />
                </div>
                <div className="prog-month-label">{m.label}</div>
                <div className="prog-month-pct">{m.pct != null ? `${m.pct}%` : '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Summary */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Banknote size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Fee Summary
            </span>
          </div>
          <div className="prog-fee-summary">
            <div className="prog-fee-stat green">
              <div className="prog-fee-val">₹{totalPaid.toLocaleString()}</div>
              <div className="prog-fee-lbl">Total Paid</div>
            </div>
            <div className="prog-fee-stat blue">
              <div className="prog-fee-val">{paidFees}</div>
              <div className="prog-fee-lbl">Paid Records</div>
            </div>
            <div className="prog-fee-stat red">
              <div className="prog-fee-val">{dueFees}</div>
              <div className="prog-fee-lbl">Pending</div>
            </div>
          </div>
          {fees.length === 0 ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No fee records yet.</p>
          ) : (
            <div className="table-container" style={{ marginTop: 12, maxHeight: 220, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {[...fees].reverse().map(f => (
                    <tr key={f.id}>
                      <td>{f.month} {f.year}</td>
                      <td>₹{f.amount?.toLocaleString()}</td>
                      <td><span className={`badge ${f.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>{f.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Results */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <span className="card-title">
            <BookOpen size={15} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Quiz Performance
          </span>
          <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{results.length} attempts</span>
        </div>
        {results.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No quizzes attempted yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Quiz</th><th>Subject</th><th>Score</th><th>Percentage</th><th>Date</th></tr></thead>
              <tbody>
                {[...results].reverse().map((r, i) => {
                  const quiz = quizzes.find(q => q.id === r.quizId);
                  const pct  = Math.round((r.score / r.total) * 100);
                  return (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td><strong>{quiz?.title || 'Unknown'}</strong></td>
                      <td><span className="badge badge-info">{quiz?.subject || '—'}</span></td>
                      <td>{r.score}/{r.total}</td>
                      <td>
                        <span className={`badge ${pct >= 70 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td>{new Date(r.completedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
