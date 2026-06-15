import { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, XCircle, Calendar, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFees } from '../../utils/storage';

export default function MyFees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const data = getStudentFees(user.id);
    setFees([...data].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return MONTHS.indexOf(b.month) - MONTHS.indexOf(a.month);
    }));
  }, [user.id]);

  const totalPaid    = fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + (f.amount || 0), 0);
  const paidCount    = fees.filter(f => f.status === 'paid').length;

  return (
    <div>
      <div className="page-header">
        <h1>My Fees</h1>
        <p>View your monthly fee payment status.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
            <div className="stat-label">Total Paid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><XCircle size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">₹{totalPending.toLocaleString()}</div>
            <div className="stat-label">Total Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Receipt size={22} strokeWidth={2} /></div>
          <div>
            <div className="stat-value">{paidCount}/{fees.length}</div>
            <div className="stat-label">Months Paid</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Banknote size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Monthly Fee History
          </span>
        </div>

        {fees.length === 0 ? (
          <div className="empty-state">
            <Receipt size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No fee records found. Your admin will update your fee status.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {fees.map(f => (
              <div key={f.id} className="fee-month-card" style={{
                border: `2px solid ${f.status === 'paid' ? '#99f6e4' : '#fecaca'}`,
                borderRadius: 12, padding: 18,
                background: f.status === 'paid' ? 'var(--clr-light)' : '#fef2f2',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--clr-primary-dark)' }}>
                      {f.month} {f.year}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: f.status === 'paid' ? 'var(--clr-primary)' : '#dc2626' }}>
                      ₹{f.amount?.toLocaleString()}
                    </div>
                  </div>
                  <span className={`badge ${f.status === 'paid' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 12 }}>
                    {f.status === 'paid'
                      ? <><CheckCircle2 size={12} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Paid</>
                      : <><XCircle size={12} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 3 }} />Pending</>
                    }
                  </span>
                </div>
                {f.paidDate && (
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} strokeWidth={2} /> Paid on: {f.paidDate}
                  </div>
                )}
                {f.status !== 'paid' && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <XCircle size={12} strokeWidth={2} /> Fee not paid. Contact admin.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}