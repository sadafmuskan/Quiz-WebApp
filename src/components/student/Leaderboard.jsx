import { useState, useEffect } from 'react';
import { Trophy, Medal, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudents, getQuizResults, getQuizzes } from '../../utils/storage';

const RANK_STYLE = [
  { bg: '#fef9c3', border: '#fde047', text: '#854d0e', icon: '🥇' },
  { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569', icon: '🥈' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', icon: '🥉' },
];

export default function Leaderboard() {
  const { user }   = useAuth();
  const [rows,     setRows]    = useState([]);
  const [quizCount,setQuizCount]= useState(0);

  useEffect(() => {
    const students = getStudents();
    const results  = getQuizResults();
    const quizzes  = getQuizzes();
    setQuizCount(quizzes.length);

    const ranked = students.map(s => {
      const myResults = results.filter(r => r.studentId === s.id);
      const attempts  = myResults.length;
      const avgPct    = attempts > 0
        ? Math.round(myResults.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / attempts)
        : 0;
      const bestPct   = attempts > 0
        ? Math.max(...myResults.map(r => Math.round((r.score / r.total) * 100)))
        : 0;
      return { id: s.id, name: s.name, subject: s.subject, attempts, avgPct, bestPct };
    });

    ranked.sort((a, b) => b.avgPct - a.avgPct || b.attempts - a.attempts);
    setRows(ranked);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top performers ranked by average quiz score.</p>
      </div>

      {/* Top 3 podium */}
      {rows.length >= 3 && (
        <div className="podium-wrap">
          {[rows[1], rows[0], rows[2]].map((s, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const style = RANK_STYLE[rank - 1];
            return (
              <div key={s.id} className={`podium-card ${rank === 1 ? 'podium-first' : ''}`}
                style={{ background: style.bg, borderColor: style.border }}>
                <div className="podium-emoji">{style.icon}</div>
                <div className="podium-avatar" style={{ background: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#c2793e', color: 'white' }}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="podium-name" style={{ color: style.text }}>{s.name}</div>
                <div className="podium-score">{s.avgPct}%</div>
                <div className="podium-sub">{s.attempts} quizzes</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Trophy size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Full Rankings
          </span>
          <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
            <BookOpen size={13} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 3 }} />
            {quizCount} quizzes total
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="empty-state">
            <Trophy size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No students enrolled yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Rank</th><th>Student</th><th>Subject</th><th>Quizzes</th><th>Avg Score</th><th>Best Score</th></tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const isMe = s.id === user?.id;
                  return (
                    <tr key={s.id} className={isMe ? 'lb-me-row' : ''}>
                      <td>
                        {i < 3
                          ? <span style={{ fontSize: 16 }}>{RANK_STYLE[i].icon}</span>
                          : <span className="lb-rank-num">#{i + 1}</span>}
                      </td>
                      <td>
                        <strong style={{ color: isMe ? 'var(--clr-primary)' : undefined }}>
                          {s.name} {isMe && <span className="lb-you-tag">You</span>}
                        </strong>
                      </td>
                      <td>{s.subject ? <span className="badge badge-info">{s.subject}</span> : '—'}</td>
                      <td>{s.attempts}</td>
                      <td>
                        <span className={`badge ${s.avgPct >= 70 ? 'badge-success' : s.avgPct >= 40 ? 'badge-warning' : s.attempts === 0 ? 'badge-purple' : 'badge-danger'}`}>
                          {s.attempts === 0 ? 'No attempts' : `${s.avgPct}%`}
                        </span>
                      </td>
                      <td>{s.attempts > 0 ? `${s.bestPct}%` : '—'}</td>
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
