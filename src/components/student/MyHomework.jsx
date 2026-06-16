import { useState, useEffect } from 'react';
import { BookMarked, CheckCircle2, Circle, Clock, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHomework, toggleHomeworkDone } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';

const today = new Date().toISOString().split('T')[0];
const FILTERS = ['All', 'Pending', 'Done', 'Overdue'];

export default function MyHomework() {
  const { user }   = useAuth();
  const [list,     setList]   = useState([]);
  const [filter,   setFilter] = useState('All');
  const toast = useToast();

  const load = () => setList(getHomework());
  useEffect(load, []);

  const handleToggle = (hw) => {
    toggleHomeworkDone(hw.id, user.id);
    load();
    const wasDone = (hw.completedBy || []).includes(user.id);
    toast(wasDone ? 'Marked as pending.' : 'Homework marked as done!', wasDone ? 'info' : 'success');
  };

  const visible = list.filter(hw => {
    const done    = (hw.completedBy || []).includes(user.id);
    const overdue = hw.dueDate < today && !done;
    if (filter === 'Done')    return done;
    if (filter === 'Pending') return !done && !overdue;
    if (filter === 'Overdue') return overdue;
    return true;
  });

  const totalDone    = list.filter(hw => (hw.completedBy || []).includes(user.id)).length;
  const totalOverdue = list.filter(hw => hw.dueDate < today && !(hw.completedBy || []).includes(user.id)).length;

  return (
    <div>
      <div className="page-header">
        <h1>My Homework</h1>
        <p>Track and complete your assigned homework.</p>
      </div>

      {/* Mini stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><BookMarked size={20} strokeWidth={2} /></div>
          <div><div className="stat-value">{list.length}</div><div className="stat-label">Total Assigned</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={20} strokeWidth={2} /></div>
          <div><div className="stat-value">{totalDone}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Clock size={20} strokeWidth={2} /></div>
          <div><div className="stat-value">{totalOverdue}</div><div className="stat-label">Overdue</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <BookMarked size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Homework List
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <BookMarked size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>{list.length === 0 ? 'No homework assigned yet.' : `No ${filter.toLowerCase()} homework.`}</p>
          </div>
        ) : (
          <div className="hw-student-list">
            {visible.map(hw => {
              const done    = (hw.completedBy || []).includes(user.id);
              const overdue = hw.dueDate < today && !done;
              return (
                <div key={hw.id} className={`hw-student-item ${done ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>
                  <button className="hw-check-btn" onClick={() => handleToggle(hw)}>
                    {done
                      ? <CheckCircle2 size={22} strokeWidth={2.5} style={{ color: '#10b981' }} />
                      : <Circle       size={22} strokeWidth={2}   style={{ color: '#cbd5e1' }} />}
                  </button>
                  <div className="hw-student-body">
                    <div className="hw-student-title">{hw.title}</div>
                    <div className="hw-student-meta">
                      <span className="badge badge-info">{hw.subject}</span>
                      <span className={`hw-due ${overdue ? 'overdue' : ''}`}>
                        <Clock size={11} strokeWidth={2.5} />
                        Due: {hw.dueDate}
                        {overdue && ' · Overdue!'}
                      </span>
                      {done && <span className="hw-done-tag"><CheckCircle2 size={11} /> Done</span>}
                    </div>
                    {hw.description && <div className="hw-student-desc">{hw.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
