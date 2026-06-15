import { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, CalendarDays, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAttendance } from '../../utils/storage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MyAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    const data = getStudentAttendance(user.id);
    setAttendance([...data].sort((a, b) => b.date.localeCompare(a.date)));
  }, [user.id]);

  const years = [...new Set(attendance.map(a => a.date.split('-')[0]))].sort((a, b) => b - a);

  const filtered = attendance.filter(a => {
    const d = new Date(a.date);
    const matchMonth = !filterMonth || MONTHS[d.getMonth()] === filterMonth;
    const matchYear  = !filterYear  || d.getFullYear() === Number(filterYear);
    return matchMonth && matchYear;
  });

  const fPresent = filtered.filter(a => a.status === 'present').length;
  const fAbsent  = filtered.filter(a => a.status === 'absent').length;
  const fPct     = filtered.length > 0 ? Math.round((fPresent / filtered.length) * 100) : 0;

  const allPresent = attendance.filter(a => a.status === 'present').length;
  const allPct     = attendance.length > 0 ? Math.round((allPresent / attendance.length) * 100) : 0;

  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  return (
    <div>
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>View your attendance records and statistics.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card">
          <div className={`stat-icon ${allPct >= 75 ? 'green' : 'red'}`}>
            <TrendingUp size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-value">{allPct}%</div>
            <div className="stat-label">Overall Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{allPresent}</div>
            <div className="stat-label">Total Present</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><XCircle size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{attendance.length - allPresent}</div>
            <div className="stat-label">Total Absent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><CalendarDays size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{attendance.length}</div>
            <div className="stat-label">Days Recorded</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <TrendingUp size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Overall Attendance
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: allPct >= 75 ? '#059669' : '#dc2626' }}>{allPct}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${allPct >= 75 ? 'green' : allPct >= 50 ? 'yellow' : 'red'}`}
            style={{ width: `${allPct}%` }} />
        </div>
        {allPct < 75 && attendance.length > 0 && (
          <div className="alert alert-danger" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} strokeWidth={2} />
            Your attendance is {allPct}%, which is below the required 75%.
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <CalendarCheck size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Attendance Records
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: 'auto', minWidth: 130 }} value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}>
              <option value="">All Months</option>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="form-control" style={{ width: 'auto', minWidth: 90 }} value={filterYear}
              onChange={e => setFilterYear(e.target.value)}>
              <option value="">All Years</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {(filterMonth || filterYear) && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={11} strokeWidth={2.5} style={{ marginRight: 3 }} />Present: {fPresent}
            </span>
            <span className="badge badge-danger">
              <XCircle size={11} strokeWidth={2.5} style={{ marginRight: 3 }} />Absent: {fAbsent}
            </span>
            <span className="badge badge-info">Rate: {fPct}%</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No attendance records found for the selected period.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>#</th><th>Date</th><th>Day</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const d = new Date(a.date);
                  return (
                    <tr key={a.id || i}>
                      <td>{i + 1}</td>
                      <td><strong>{a.date}</strong></td>
                      <td>{DAYS[d.getDay()]}</td>
                      <td>
                        <span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-danger'}`}>
                          {a.status === 'present'
                            ? <><CheckCircle2 size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Present</>
                            : <><XCircle size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Absent</>
                          }
                        </span>
                      </td>
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