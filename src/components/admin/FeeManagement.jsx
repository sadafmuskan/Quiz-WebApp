import { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, XCircle, Plus, Trash2, Filter } from 'lucide-react';
import { getStudents, getFees, addOrUpdateFee, deleteFee, getUserById } from '../../utils/storage';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../shared/ConfirmDialog';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

export default function FeeManagement() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [form, setForm] = useState({
    studentId: '', month: MONTHS[new Date().getMonth()],
    year: currentYear, amount: '', status: 'unpaid'
  });
  const [showForm, setShowForm] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null, label: '' });
  const toast = useToast();

  const load = () => { setStudents(getStudents()); setFees(getFees()); };
  useEffect(load, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.amount) return;
    addOrUpdateFee({
      studentId: Number(form.studentId), month: form.month,
      year: Number(form.year), amount: Number(form.amount),
      status: form.status,
      paidDate: form.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
    });
    setForm({ studentId: '', month: MONTHS[new Date().getMonth()], year: currentYear, amount: '', status: 'unpaid' });
    setShowForm(false);
    load();
    toast('Fee record saved successfully!', 'success');
  };

  const handleDelete = (fee) => {
    const student = getUserById(fee.studentId);
    setConfirm({
      open: true,
      id: fee.id,
      label: `${student?.name || 'Unknown'}'s ${fee.month} ${fee.year} fee record`,
    });
  };

  const doDelete = () => {
    deleteFee(confirm.id);
    load();
    toast('Fee record deleted.', 'success');
    setConfirm({ open: false, id: null, label: '' });
  };

  const filtered = fees.filter(f => {
    const matchStudent = !filterStudent || f.studentId === Number(filterStudent);
    const matchMonth   = !filterMonth   || f.month === filterMonth;
    const matchYear    = !filterYear    || f.year === Number(filterYear);
    return matchStudent && matchMonth && matchYear;
  });

  const totalCollected = filtered.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Fee Management</h1>
        <p>Track and manage student fee payments month-wise.</p>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Fee Record?"
        message={`Are you sure you want to delete ${confirm.label}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={doDelete}
        onCancel={() => setConfirm({ open: false, id: null, label: '' })}
      />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon green"><Banknote size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">₹{totalCollected.toLocaleString()}</div>
            <div className="stat-label">Collected (Filtered)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><CheckCircle2 size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{filtered.filter(f => f.status === 'paid').length}</div>
            <div className="stat-label">Paid Records</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><XCircle size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{filtered.filter(f => f.status !== 'paid').length}</div>
            <div className="stat-label">Pending Records</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Banknote size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Fee Records
          </span>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><XCircle size={14} /> Cancel</> : <><Plus size={14} strokeWidth={2.5} /> Add Fee Record</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'var(--clr-light)', borderRadius: 10, padding: 18, marginBottom: 18, border: '1px solid var(--clr-light-border)' }}>
            <div className="form-row-4">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select className="form-control" value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })} required>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Month *</label>
                <select className="form-control" value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select className="form-control" value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-control" type="number" min="0" placeholder="e.g. 5000"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <label className="radio-label">
                <input type="radio" name="status" value="paid" checked={form.status === 'paid'}
                  onChange={() => setForm({ ...form, status: 'paid' })} />
                <span className="badge badge-success">Paid</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="status" value="unpaid" checked={form.status === 'unpaid'}
                  onChange={() => setForm({ ...form, status: 'unpaid' })} />
                <span className="badge badge-danger">Unpaid</span>
              </label>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={14} strokeWidth={2} /> Save Record
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="form-row-3" style={{ marginBottom: 16 }}>
          <div className="input-icon-wrap">
            <Filter size={14} className="input-icon" strokeWidth={2} />
            <select className="form-control with-icon" value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
              <option value="">All Students</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <select className="form-control" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="form-control" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Banknote size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No fee records found. Add a record above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Student</th><th>Month</th><th>Year</th>
                  <th>Amount</th><th>Status</th><th>Paid Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => {
                  const student = getUserById(f.studentId);
                  return (
                    <tr key={f.id}>
                      <td>{i + 1}</td>
                      <td><strong>{student?.name || 'Unknown'}</strong></td>
                      <td>{f.month}</td>
                      <td>{f.year}</td>
                      <td><strong>₹{f.amount?.toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge ${f.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                          {f.status === 'paid'
                            ? <><CheckCircle2 size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Paid</>
                            : <><XCircle size={11} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Unpaid</>
                          }
                        </span>
                      </td>
                      <td>{f.paidDate || '—'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f)}>
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
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