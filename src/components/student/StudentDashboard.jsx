import { useState, useEffect, useMemo } from 'react';
import {
  Banknote, CalendarCheck, BookOpen, Trophy, TrendingUp,
  User, Mail, Phone, Tag, AtSign, AlertTriangle, CheckCircle2,
  ChevronLeft, ChevronRight, BarChart3, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFees, getStudentAttendance, getQuizzes, getStudentResults } from '../../utils/storage';

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const LONG_MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

/* ── Donut Chart — per-student month summary ─────────────────── */
function StudentDonut({ present, absent }) {
  const total = present + absent;
  if (total === 0) return (
    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '28px 0', fontSize: 13 }}>
      No attendance recorded this month.
    </div>
  );
  const pct           = Math.round((present / total) * 100);
  const r             = 50;
  const sw            = 15;
  const circumference = 2 * Math.PI * r;
  const presentArc    = (present / total) * circumference;

  return (
    <div className="donut-wrap">
      <svg width="160" height="160" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#fee2e2" strokeWidth={sw} />
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

/* ── Main Component ──────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user }  = useAuth();
  const now       = new Date();
  const todayStr  = now.toISOString().split('T')[0];

  const [stats,      setStats]     = useState({ feeStatus: null, feeAmount: null, attendancePct: 0, totalAttendance: 0, availableQuizzes: 0, quizzesTaken: 0 });
  const [attendance, setAttendance]= useState([]);

  const [calMonth,     setCalMonth]    = useState(now.getMonth());
  const [calYear,      setCalYear]     = useState(now.getFullYear());
  const [selectedDate, setSelectedDate]= useState(todayStr);

  useEffect(() => {
    const month  = SHORT_MONTHS[now.getMonth()];
    const year   = now.getFullYear();
    const fees   = getStudentFees(user.id);
    const att    = getStudentAttendance(user.id);
    const present= att.filter(a => a.status === 'present').length;
    const pct    = att.length > 0 ? Math.round((present / att.length) * 100) : 0;
    const results= getStudentResults(user.id);

    const thisMonthFee = fees.find(f => f.month === month && f.year === year);

    setStats({
      feeStatus:       thisMonthFee?.status || null,
      feeAmount:       thisMonthFee?.amount,
      attendancePct:   pct,
      totalAttendance: att.length,
      availableQuizzes:getQuizzes().length,
      quizzesTaken:    results.length,
    });
    setAttendance(att);
  }, [user.id]);

  /* ── Date → status map (only this student) ── */
  const attendanceByDate = useMemo(() => {
    const map = {};
    attendance.forEach(a => { map[a.date] = a.status; });
    return map;
  }, [attendance]);

  /* ── Calendar cells ── */
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  /* ── Month summary for donut ── */
  const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const monthPresent = attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'present').length;
  const monthAbsent  = attendance.filter(a => a.date.startsWith(monthPrefix) && a.status === 'absent').length;

  const prevMonth = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalMonth(0),  setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  const selectedStatus = attendanceByDate[selectedDate];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Your academic overview for {LONG_MONTHS[now.getMonth()]} {now.getFullYear()}.</p>
      </div>

      {/* ── Stats ── */}
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

      {/* ── Attendance progress bar ── */}
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

      {/* ── Attendance Calendar + Donut ── */}
      <div className="grid-2" style={{ marginTop: 20 }}>

        {/* Calendar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CalendarCheck size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              My Attendance Calendar
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '4px 8px' }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-primary-dark)', minWidth: 112, textAlign: 'center' }}>
                {LONG_MONTHS[calMonth]} {calYear}
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
              const ds     = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const status = attendanceByDate[ds];
              const isSel  = ds === selectedDate;
              const isToday= ds === todayStr;

              /* green = present, red = absent, empty = no data */
              const colorClass = status === 'present' ? 'high' : status === 'absent' ? 'low' : '';

              return (
                <div
                  key={ds}
                  className={`att-cal-cell ${isSel ? 'selected' : ''} ${isToday && !isSel ? 'today' : ''} ${!isSel ? colorClass : ''}`}
                  onClick={() => setSelectedDate(ds)}
                  title={status ? `You were ${status}` : 'No record'}
                >
                  <span className="att-cal-num">{day}</span>
                  {status && (
                    <span className="att-cal-count" style={{ fontSize: 8 }}>
                      {status === 'present' ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="att-cal-legend">
            <span className="att-legend-dot high" />Present
            <span className="att-legend-dot low"  style={{ marginLeft: 10 }} />Absent
            <span className="att-legend-dot none" style={{ marginLeft: 10 }} />No Record
          </div>
        </div>

        {/* Donut — month summary */}
        <div className="card donut-card">
          <div className="card-header">
            <span className="card-title">
              <BarChart3 size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Month Overview
            </span>
            <span style={{ fontSize: 12, color: 'var(--clr-text-muted)', fontWeight: 600 }}>
              {LONG_MONTHS[calMonth]} {calYear}
            </span>
          </div>

          <StudentDonut present={monthPresent} absent={monthAbsent} />

          {/* Selected date info */}
          <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Selected: {selectedDate}
            </div>
            {selectedStatus === 'present' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={15} strokeWidth={2.5} /> You were present on this day.
              </div>
            )}
            {selectedStatus === 'absent' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                <AlertTriangle size={15} strokeWidth={2.5} /> You were absent on this day.
              </div>
            )}
            {!selectedStatus && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                No attendance record for this date.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile ── */}
      <div className="card" style={{ marginTop: 20 }}>
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
          {user?.class && (
            <div className="profile-field">
              <div className="profile-label"><GraduationCap size={12} strokeWidth={2} /> Class</div>
              <div className="profile-value"><span className="badge badge-class">{user.class}</span></div>
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
