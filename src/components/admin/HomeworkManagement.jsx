import { useState, useEffect } from 'react';
import { BookMarked, Plus, Trash2, X, Users, CheckCircle2, Clock } from 'lucide-react';
import { getHomework, addHomework, deleteHomework, getStudents } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const today = new Date().toISOString().split('T')[0];

export default function HomeworkManagement() {
  const [list,     setList]    = useState([]);
  const [students, setStudents]= useState([]);
  const [showForm, setShowForm]= useState(false);
  const [form,     setForm]    = useState({ title: '', subject: '', description: '', dueDate: today });
  const [confirm,  setConfirm] = useState({ open: false, id: null, title: '' });
  const toast = useToast();

  const load = () => { setList(getHomework()); setStudents(getStudents()); };
  useEffect(load, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject.trim()) return;
    addHomework(form);
    setForm({ title: '', subject: '', description: '', dueDate: today });
    setShowForm(false);
    load();
    toast('Homework assigned successfully!', 'success');
  };

  const doDelete = () => {
    deleteHomework(confirm.id);
    load();
    toast(`"${confirm.title}" deleted.`, 'success');
    setConfirm({ open: false, id: null, title: '' });
  };

  const isOverdue = (dueDate) => dueDate < today;

  return (
    <div>
      <div className="page-header">
        <h1>Homework</h1>
        <p>Assign and track homework for students.</p>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Homework?"
        message={`Delete "${confirm.title}"? Student completion records will also be lost.`}
        confirmLabel="Yes, Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null, title: '' })}
      />

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <BookMarked size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            All Homework ({list.length})
          </span>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} strokeWidth={2.5} /> Assign Homework</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="hw-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" placeholder="e.g. Chapter 5 Exercise"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input className="form-control" placeholder="e.g. Mathematics"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input className="form-control" type="date" min={today}
                  value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-control" placeholder="Optional details…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <BookMarked size={14} strokeWidth={2} /> Assign
              </button>
            </div>
          </form>
        )}

        {list.length === 0 ? (
          <div className="empty-state">
            <BookMarked size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No homework assigned yet.</p>
          </div>
        ) : (
          <div className="hw-admin-list">
            {list.map(hw => {
              const done    = (hw.completedBy || []).length;
              const total   = students.length;
              const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
              const overdue = isOverdue(hw.dueDate);
              return (
                <div key={hw.id} className={`hw-admin-item ${overdue ? 'overdue' : ''}`}>
                  <div className="hw-admin-left">
                    <div className="hw-admin-title">{hw.title}</div>
                    <div className="hw-admin-meta">
                      <span className="badge badge-info">{hw.subject}</span>
                      <span className={`hw-due ${overdue ? 'overdue' : ''}`}>
                        <Clock size={11} strokeWidth={2.5} />
                        Due: {hw.dueDate}
                        {overdue && ' · Overdue'}
                      </span>
                    </div>
                    {hw.description && <div className="hw-admin-desc">{hw.description}</div>}
                  </div>
                  <div className="hw-admin-right">
                    <div className="hw-progress-wrap">
                      <div className="hw-progress-label">
                        <CheckCircle2 size={13} strokeWidth={2.5} style={{ color: '#10b981' }} />
                        <span>{done}/{total} done ({pct}%)</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill green" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => setConfirm({ open: true, id: hw.id, title: hw.title })}>
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
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
