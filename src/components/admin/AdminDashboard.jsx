import { useState, useEffect, useMemo } from 'react';
import {
  Users, Banknote, UserCheck, BookOpen, TrendingUp,
  Search, ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';
import { getStudents, getFees, getAttendance, getQuizzes } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const PAGE_SIZE   = 10;

/* ── Donut Chart ────────────────────────────────────────────── */
function DonutChart({ present, total }) {
  if (total === 0) return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: 13 }}>
      No students enrolled yet.
    </div>
  );
  const pct           = Math.round((present / total) * 100);
  const absent        = total - present;
  const r             = 50;
  const sw            = 15;
  const circumference = 2 * Math.PI * r;
  const presentArc    = (present / total) * circumference;

  return (
    <div className="donut-wrap">
      <svg width="160" height="160" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
        {/* Absent segment */}
        {absent > 0 && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="#fee2e2"
            strokeWidth={sw}
            strokeDasharray={`${circumference} 0`}
            transform="rotate(-90 70 70)" />
        )}
        {/* Present arc */}
        {present > 0 && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="#10b981"
            strokeWidth={sw}
            strokeDasharray={`${presentArc} ${circumference - presentArc}`}
            strokeLinecap="butt"
            transform="rotate(-90 70 70)" />
        )}
        <text x="70" y="64" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">{pct}%</text>
        <text x="70" y="80" textAnchor="middle" fontSize="9"  fontWeight="600" fill="#64748b" letterSpacing="1">PRESENT</text>
      </svg>

      <div className="donut-legend">
        <div className="donut-legend-item">
          <span className="donut-dot" style={{ background: '#10b981' }} />
          <span>Present <strong>{present}</strong></span>
        </div>
        <div className="donut-legend-item">
          <span className="donut-dot" style={{ background: '#fca5a5' }} />
          <span>Absent <strong>{absent}</strong></span>
        </div>
        <div className="donut-legend-item">
          <span className="donut-dot" style={{ background: '#e2e8f0' }} />
          <span>Total <strong>{total}</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [stats, setStats]           = useState({ students: 0, feesPaidThisMonth: 0, todayPresent: 0, quizzes: 0 });
  const [allStudents, setAllStudents] = useState([]);
  const [allFees, setAllFees]         = useState([]);
  const [attendance, setAttendance]   = useState([]);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage,   setStudentPage]   = useState(1);
  const [feeSearch,     setFeeSearch]     = useState('');
  const [feePage,       setFeePage]       = useState(1);

  const [calMonth,      setCalMonth]      = useState(now.getMonth());
  const [calYear,       setCalYear]       = useState(now.getFullYear());
  const [selectedDate,  setSelectedDate]  = useState(todayStr);

  useEffect(() => {
    const month    = MONTHS[now.getMonth()];
    const year     = now.getFullYear();
    const students = getStudents();
    const fees     = getFees();
    const att      = getAttendance();
    const quizzes  = getQuizzes();

    setStats({
      students: students.length,
      feesPaidThisMonth: fees.filter(f => f.month === month && f.year === year && f.status === 'paid').length,
      todayPresent: att.filter(a => a.date === todayStr && a.status === 'present').length,
      quizzes: quizzes.length,
    });
    setAllStudents([...students].reverse());
    setAllFees([...fees].reverse());
    setAttendance(att);
  }, []);

  /* ── Students table ── */
  const filteredStudents = useMemo(() =>
    allStudents.filter(s =>
      `${s.name} ${s.username} ${s.subject || ''}`.toLowerCase().includes(studentSearch.toLowerCase())
    ), [allStudents, studentSearch]);

  const studentPages  = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE);

  /* ── Fees table ── */
  const filteredFees = useMemo(() =>
    allFees.filter(f =>
      `${f.month} ${f.year} ${f.status}`.toLowerCase().includes(feeSearch.toLowerCase())
    ), [allFees, feeSearch]);

  const feePages  = Math.max(1, Math.ceil(filteredFees.length / PAGE_SIZE));
  const pagedFees = filteredFees.slice((feePage - 1) * PAGE_SIZE, feePage * PAGE_SIZE);

  /* ── Calendar ── */
  const attendanceByDate = useMemo(() => {
    const map = {};
    attendance.forEach(a => {
      if (!map[a.date]) map[a.date] = { present: 0, absent: 0 };
      a.status === 'present' ? map[a.date].present++ : map[a.date].absent++;
    });
    return map;
  }, [attendance]);

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const totalStudents  = stats.students;
  const selectedData   = attendanceByDate[selectedDate] || { present: 0, absent: 0 };

  const prevMonth = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalMonth(0),  setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's your institution overview for today.</p>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} strokeWidth={2} /></div>
          <div><div className="stat-value">{stats.students}</div><div className="stat-label">Total Students</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Banknote size={22} strokeWidth={2} /></div>
          <div><div className="stat-value">{stats.feesPaidThisMonth}</div><div className="stat-label">Fees Paid This Month</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><UserCheck size={22} strokeWidth={2} /></div>
          <div><div className="stat-value">{stats.todayPresent}</div><div className="stat-label">Present Today</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><BookOpen size={22} strokeWidth={2} /></div>
          <div><div className="stat-value">{stats.quizzes}</div><div className="stat-label">Total Quizzes</div></div>
        </div>
      </div>

      {/* ── Recent Students + Recent Fees ── */}
      <div className="grid-2">

        {/* Recent Students */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Users size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Recent Students
            </span>
            <div className="input-icon-wrap" style={{ width: 160 }}>
              <Search size={13} className="input-icon" strokeWidth={2} />
              <input className="form-control with-icon dash-search-input" placeholder="Search…"
                value={studentSearch}
                onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }} />
            </div>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="empty-state">
              <Users size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', color: '#cbd5e1' }} />
              <p>{allStudents.length === 0 ? 'No students yet. Add from Students section.' : 'No matching students found.'}</p>
            </div>
          ) : (
            <>
              <div className="dash-table-scroll">
                <table>
                  <thead>
                    <tr><th>Name</th><th>Username</th><th>Subject</th></tr>
                  </thead>
                  <tbody>
                    {pagedStudents.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.username}</td>
                        <td><span className="badge badge-info">{s.subject || 'N/A'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dash-pagination">
                <button className="btn btn-secondary btn-sm" onClick={() => setStudentPage(p => p - 1)} disabled={studentPage === 1}>
                  <ChevronLeft size={14} />
                </button>
                <span className="dash-page-info">Page {studentPage} / {studentPages} &nbsp;·&nbsp; {filteredStudents.length} total</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setStudentPage(p => p + 1)} disabled={studentPage === studentPages}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent Fee Records */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Recent Fee Records
            </span>
            <div className="input-icon-wrap" style={{ width: 160 }}>
              <Search size={13} className="input-icon" strokeWidth={2} />
              <input className="form-control with-icon dash-search-input" placeholder="Search…"
                value={feeSearch}
                onChange={e => { setFeeSearch(e.target.value); setFeePage(1); }} />
            </div>
          </div>
          {filteredFees.length === 0 ? (
            <div className="empty-state">
              <Banknote size={40} strokeWidth={1} style={{ margin: '0 auto 12px', display: 'block', color: '#cbd5e1' }} />
              <p>{allFees.length === 0 ? 'No fee records yet.' : 'No matching records.'}</p>
            </div>
          ) : (
            <>
              <div className="dash-table-scroll">
                <table>
                  <thead>
                    <tr><th>Month</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {pagedFees.map(f => (
                      <tr key={f.id}>
                        <td>{f.month} {f.year}</td>
                        <td><strong>₹{f.amount?.toLocaleString()}</strong></td>
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
              <div className="dash-pagination">
                <button className="btn btn-secondary btn-sm" onClick={() => setFeePage(p => p - 1)} disabled={feePage === 1}>
                  <ChevronLeft size={14} />
                </button>
                <span className="dash-page-info">Page {feePage} / {feePages} &nbsp;·&nbsp; {filteredFees.length} total</span>
                <button className="btn btn-secondary btn-sm" onClick={() => setFeePage(p => p + 1)} disabled={feePage === feePages}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Attendance Calendar + Donut Chart ── */}
      <div className="grid-2" style={{ marginTop: 20 }}>

        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <UserCheck size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Attendance Calendar
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '4px 8px' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-primary-dark)', minWidth: 112, textAlign: 'center' }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '4px 8px' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="att-cal-grid">
            {DAY_LABELS.map(d => (
              <div key={d} className="att-cal-day-label">{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const ds  = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const data = attendanceByDate[ds];
              const pct  = data && totalStudents > 0 ? Math.round((data.present / totalStudents) * 100) : null;
              const isSel   = ds === selectedDate;
              const isToday = ds === todayStr;
              const color   = data && !isSel ? (pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low') : '';

              return (
                <div
                  key={ds}
                  className={`att-cal-cell ${isSel ? 'selected' : ''} ${isToday && !isSel ? 'today' : ''} ${color}`}
                  onClick={() => setSelectedDate(ds)}
                  title={data ? `${data.present} present, ${data.absent} absent` : 'No data'}
                >
                  <span className="att-cal-num">{day}</span>
                  {data && <span className="att-cal-count">{data.present}</span>}
                </div>
              );
            })}
          </div>

          <div className="att-cal-legend">
            <span className="att-legend-dot high" />High (≥70%)
            <span className="att-legend-dot mid"  style={{ marginLeft: 10 }} />Medium
            <span className="att-legend-dot low"  style={{ marginLeft: 10 }} />Low
            <span className="att-legend-dot none" style={{ marginLeft: 10 }} />No Data
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card donut-card">
          <div className="card-header">
            <span className="card-title">
              <BarChart3 size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Day Attendance
            </span>
            <span style={{ fontSize: 12, color: 'var(--clr-text-muted)', fontWeight: 600 }}>
              {selectedDate}
            </span>
          </div>

          <DonutChart present={selectedData.present} total={totalStudents} />

          {totalStudents > 0 && (
            <div style={{ marginTop: 20, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 6 }}>
                <span>Present</span>
                <span>{selectedData.present} / {totalStudents} students</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill green"
                  style={{ width: `${totalStudents > 0 ? Math.round((selectedData.present / totalStudents) * 100) : 0}%`, transition: 'width 0.5s ease' }} />
              </div>
              {attendanceByDate[selectedDate] ? null : (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                  No attendance recorded for this date
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
