import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getNotifications, addNotification, deleteNotification } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const TYPES = [
  { value: 'info',    label: 'Info',    Icon: Info,          color: '#0f766e', bg: '#f0fdfa' },
  { value: 'warning', label: 'Warning', Icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
  { value: 'success', label: 'Success', Icon: CheckCircle2,  color: '#059669', bg: '#f0fdf4' },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.value, t]));

export default function Announcements() {
  const [list,    setList]    = useState([]);
  const [form,    setForm]    = useState({ title: '', message: '', type: 'info' });
  const [showForm,setShowForm]= useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const toast = useToast();

  const load = () => setList(getNotifications());
  useEffect(load, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    addNotification(form);
    setForm({ title: '', message: '', type: 'info' });
    setShowForm(false);
    load();
    toast('Announcement sent to all students!', 'success');
  };

  const doDelete = () => {
    deleteNotification(confirm.id);
    load();
    toast('Announcement deleted.', 'success');
    setConfirm({ open: false, id: null });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Announcements</h1>
        <p>Broadcast messages to all students instantly.</p>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Announcement?"
        message="This announcement will be removed for all students."
        confirmLabel="Yes, Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Megaphone size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            All Announcements ({list.length})
          </span>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} strokeWidth={2.5} /> New Announcement</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="ann-form">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="e.g. Exam Schedule Update"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows={3} placeholder="Write your announcement here…"
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="form-label" style={{ margin: 0 }}>Type:</label>
              {TYPES.map(t => (
                <label key={t.value} className="ann-type-radio">
                  <input type="radio" name="type" value={t.value}
                    checked={form.type === t.value}
                    onChange={() => setForm({ ...form, type: t.value })} />
                  <span className="ann-type-pill" style={form.type === t.value ? { background: t.bg, color: t.color, borderColor: t.color } : {}}>
                    <t.Icon size={12} strokeWidth={2.5} /> {t.label}
                  </span>
                </label>
              ))}
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                <Megaphone size={14} strokeWidth={2} /> Send Announcement
              </button>
            </div>
          </form>
        )}

        {list.length === 0 ? (
          <div className="empty-state">
            <Megaphone size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No announcements yet. Create one to notify students.</p>
          </div>
        ) : (
          <div className="ann-list">
            {list.map(n => {
              const t = TYPE_MAP[n.type] || TYPE_MAP.info;
              return (
                <div key={n.id} className="ann-item" style={{ borderLeftColor: t.color }}>
                  <div className="ann-icon" style={{ background: t.bg, color: t.color }}>
                    <t.Icon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="ann-body">
                    <div className="ann-title">{n.title}</div>
                    <div className="ann-message">{n.message}</div>
                    <div className="ann-meta">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <button className="btn btn-danger btn-sm ann-del"
                    onClick={() => setConfirm({ open: true, id: n.id })}>
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
