import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, X, UserPlus, UserCircle2 } from 'lucide-react';
import { getStudents, addStudent, deleteStudent } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const emptyForm = { name: '', username: '', password: '', email: '', phone: '', subject: '' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const toast = useToast();

  const load = () => setStudents(getStudents());
  useEffect(load, []);

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.username || !form.password) { setError('Name, username and password are required.'); return; }
    if (getStudents().find(s => s.username === form.username.trim())) { setError('Username already exists.'); return; }
    addStudent({ ...form, username: form.username.trim() });
    setForm(emptyForm);
    setShowModal(false);
    load();
    toast('Student added successfully!', 'success');
  };

  const handleDelete = (id, name) => setConfirm({ open: true, id, name });

  const doDelete = () => {
    deleteStudent(confirm.id);
    load();
    toast(`"${confirm.name}" deleted successfully.`, 'success');
    setConfirm({ open: false, id: null, name: '' });
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>Add, view and manage all enrolled students.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            All Students ({students.length})
          </span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="input-icon-wrap" style={{ width: 220 }}>
              <Search size={15} className="input-icon" strokeWidth={2} />
              <input
                className="form-control with-icon"
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setForm(emptyForm); }}>
              <Plus size={15} strokeWidth={2.5} /> Add Student
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <UserCircle2 size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>{students.length === 0 ? 'No students yet. Click "Add Student" to get started.' : 'No matching students found.'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Subject</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><strong>{s.name}</strong></td>
                    <td><span className="badge badge-info">{s.username}</span></td>
                    <td>{s.email || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.subject ? <span className="badge badge-purple">{s.subject}</span> : '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.name)}>
                        <Trash2 size={13} strokeWidth={2} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Student?"
        message={`Are you sure you want to delete "${confirm.name}"? This will also permanently remove their fees and attendance records.`}
        confirmLabel="Yes, Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                <UserPlus size={18} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Add New Student
              </span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleAdd}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" placeholder="e.g. Rahul Sharma" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input className="form-control" placeholder="e.g. rahul123" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" type="password" placeholder="Set a password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-control" placeholder="e.g. Mathematics" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" placeholder="email@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" placeholder="+91 XXXXX XXXXX" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={14} strokeWidth={2} /> Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}