import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Banknote, CalendarDays, ClipboardList,
  BookOpen, CalendarCheck, Receipt, LogOut, Menu, X, GraduationCap,
  Megaphone, BookMarked, TrendingUp, Trophy, Bell,
} from 'lucide-react';
import FloatingBackground from './FloatingBackground';
import { config } from '../../config/env';
import { getUnreadNotifCount } from '../../utils/storage';

const adminNav = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { to: '/admin/students',      icon: Users,           label: 'Students'              },
  { to: '/admin/fees',          icon: Banknote,        label: 'Fee Management'        },
  { to: '/admin/attendance',    icon: CalendarDays,    label: 'Attendance'            },
  { to: '/admin/quizzes',       icon: ClipboardList,   label: 'Quiz Management'       },
  { to: '/admin/announcements', icon: Megaphone,       label: 'Announcements'         },
  { to: '/admin/homework',      icon: BookMarked,      label: 'Homework'              },
];

const studentNav = [
  { to: '/student',                icon: LayoutDashboard, label: 'Dashboard',     end: true },
  { to: '/student/fees',           icon: Receipt,         label: 'My Fees'              },
  { to: '/student/attendance',     icon: CalendarCheck,   label: 'My Attendance'        },
  { to: '/student/quizzes',        icon: BookOpen,        label: 'My Quizzes'           },
  { to: '/student/homework',       icon: BookMarked,      label: 'Homework'             },
  { to: '/student/progress',       icon: TrendingUp,      label: 'Progress Report'      },
  { to: '/student/leaderboard',    icon: Trophy,          label: 'Leaderboard'          },
  { to: '/student/notifications',  icon: Bell,            label: 'Notifications', badge: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const navLinks = user?.role === 'admin' ? adminNav : studentNav;

  useEffect(() => {
    if (user?.role === 'student') {
      const refresh = () => setUnread(getUnreadNotifCount(user.id));
      refresh();
      const id = setInterval(refresh, 10000);
      return () => clearInterval(id);
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setMobileOpen(false);

  return (
    <div className="app-container">
      {mobileOpen && <div className="sidebar-overlay" onClick={close} />}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-row">
            <h2>
              <GraduationCap size={20} strokeWidth={2.5} />
              <span className="logo-text">Learn & Grow</span>
            </h2>
            <button className="sidebar-close-btn" onClick={close}>
              <X size={18} />
            </button>
          </div>
          <p className="logo-sub">{user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            {navLinks.map(link => {
              const Icon = link.icon;
              const showBadge = link.badge && unread > 0;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={close}
                >
                  <span className="icon" style={{ position: 'relative' }}>
                    <Icon size={18} strokeWidth={2} />
                    {showBadge && (
                      <span className="nav-badge">{unread > 9 ? '9+' : unread}</span>
                    )}
                  </span>
                  <span className="nav-label">{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Student'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={2} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <FloatingBackground fixed />
        <header className="mobile-header">
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} color="#5eead4" strokeWidth={2} />
          </button>
          <span className="mobile-brand">
            <GraduationCap size={18} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            EduApp
          </span>
          <div className="mobile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </header>

        <div className="main-inner">
          <Outlet />
        </div>
      </main>

      {config.showEnvBadge && (
        <div className={`env-badge env-badge--${config.env}`}>
          {config.env}
        </div>
      )}
    </div>
  );
}
