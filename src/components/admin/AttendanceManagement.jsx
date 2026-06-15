import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, XCircle, Save, History, Users, CheckSquare } from 'lucide-react';
import { getStudents, getAttendance, markAttendance } from '../../utils/storage';

export default function AttendanceManagement() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('mark');
  const [historyFilter, setHistoryFilter] = useState('');

  useEffect(() => { setStudents(getStudents()); }, []);

  useEffect(() => {
    const existing = getAttendance().filter(a => a.date === date);
    const map = {};
    students.forEach(s => { map[s.id] = 'present'; });
    existing.forEach(a => { map[a.studentId] = a.status; });
    setAttendance(map);
    setSaved(false);
  }, [date, students]);

  const toggle = (studentId, status) => { setAttendance(prev => ({ ...prev, [studentId]: status })); setSaved(false); };

  const handleSave = () => {
    const records = students.map(s => ({ studentId: s.id, date, status: attendance[s.id] || 'present' }));
    markAttendance(records);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const allAttendance = getAttendance();
  const filteredHistory = historyFilter
    ? allAttendance.filter(a => a.studentId === Number(historyFilter))
    : allAttendance;
  const sortedHistory = [...filteredHistory].sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount  = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Mark and view student attendance records.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`btn ${tab === 'mark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('mark')}>
          <CheckSquare size={15} strokeWidth={2} /> Mark Attendance
        </button>
        <button className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('history')}>
          <History size={15} strokeWidth={2} /> View History
        </button>
      </div>

      {tab === 'mark' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CalendarDays size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Mark Attendance
            </span>
            <input type="date" className="form-control" style={{ width: 'auto', minWidth: 150 }}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {saved && <div className="alert alert-success">Attendance saved for {date}!</div>}

          {students.length === 0 ? (
            <div className="empty-state">
              <Users size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No students found. Add students first.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-success">
                  <CheckCircle2 size={11} strokeWidth={2.5} style={{ marginRight: 4 }} />
                  Present: {presentCount}
                </span>
                <span className="badge badge-danger">
                  <XCircle size={11} strokeWidth={2.5} style={{ marginRight: 4 }} />
                  Absent: {absentCount}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  const all = {}; students.forEach(s => { all[s.id] = 'present'; });
                  setAttendance(all); setSaved(false);
                }}>
                  <CheckSquare size={13} strokeWidth={2} /> Mark All Present
                </button>
              </div>

              <div className="attendance-grid">
                {students.map(s => (
                  <div className="attendance-row" key={s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      {s.subject && <span style={{ marginLeft: 8 }} className="badge badge-purple">{s.subject}</span>}
                    </div>
                    <div className="attendance-toggle">
                      <button
                        className={`att-btn present ${attendance[s.id] === 'present' ? 'active' : ''}`}
                        onClick={() => toggle(s.id, 'present')}
                      >
                        <CheckCircle2 size={13} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Present
                      </button>
                      <button
                        className={`att-btn absent ${attendance[s.id] === 'absent' ? 'active' : ''}`}
                        onClick={() => toggle(s.id, 'absent')}
                      >
                        <XCircle size={13} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={handleSave}>
                  <Save size={15} strokeWidth={2} /> Save Attendance
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <History size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Attendance History
            </span>
            <select className="form-control" style={{ width: 'auto', minWidth: 160 }}
              value={historyFilter} onChange={e => setHistoryFilter(e.target.value)}>
              <option value="">All Students</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
              <p>No attendance records found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Student</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {sortedHistory.slice(0, 100).map((a, i) => {
                    const student = students.find(s => s.id === a.studentId);
                    return (
                      <tr key={a.id || i}>
                        <td>{i + 1}</td>
                        <td><strong>{student?.name || 'Unknown'}</strong></td>
                        <td>{a.date}</td>
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
      )}
    </div>
  );
}