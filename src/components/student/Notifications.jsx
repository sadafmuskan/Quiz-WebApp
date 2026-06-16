import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, setNotifLastSeen } from '../../utils/storage';

const META = {
  info:    { Icon: Info,          color: '#0f766e', bg: '#f0fdfa', label: 'Info'    },
  warning: { Icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', label: 'Warning' },
  success: { Icon: CheckCircle2,  color: '#059669', bg: '#f0fdf4', label: 'Success' },
};

export default function Notifications() {
  const { user }  = useAuth();
  const [list,    setList]    = useState([]);
  const [lastSeen,setLastSeen]= useState(0);

  useEffect(() => {
    if (!user) return;
    const ls = Number(localStorage.getItem(
      `${import.meta.env.VITE_APP_STORAGE_PREFIX || 'edu_dev_'}notif_seen_${user.id}`
    ) || 0);
    setLastSeen(ls);
    setList(getNotifications());
    // Mark all as seen when page opens
    setNotifLastSeen(user.id);
  }, [user]);

  const isNew = (createdAt) => new Date(createdAt).getTime() > lastSeen;

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Announcements and updates from your admin.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Bell size={16} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            All Notifications ({list.length})
          </span>
          {list.filter(n => isNew(n.createdAt)).length > 0 && (
            <span className="badge badge-danger">
              {list.filter(n => isNew(n.createdAt)).length} new
            </span>
          )}
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <Bell size={44} strokeWidth={1} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
            <p>No announcements yet. Check back later.</p>
          </div>
        ) : (
          <div className="notif-list">
            {list.map(n => {
              const m = META[n.type] || META.info;
              return (
                <div key={n.id} className={`notif-item ${isNew(n.createdAt) ? 'notif-new' : ''}`}
                  style={{ borderLeftColor: m.color }}>
                  <div className="notif-icon" style={{ background: m.bg, color: m.color }}>
                    <m.Icon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">
                      {n.title}
                      {isNew(n.createdAt) && <span className="notif-new-dot" />}
                    </div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
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
