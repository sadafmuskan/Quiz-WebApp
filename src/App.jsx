import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initializeData } from './utils/storage';

import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/shared/Layout';

import AdminDashboard from './components/admin/AdminDashboard';
import StudentManagement from './components/admin/StudentManagement';
import FeeManagement from './components/admin/FeeManagement';
import AttendanceManagement from './components/admin/AttendanceManagement';
import QuizManagement from './components/admin/QuizManagement';
import Announcements from './components/admin/Announcements';
import HomeworkManagement from './components/admin/HomeworkManagement';

import StudentDashboard from './components/student/StudentDashboard';
import MyFees from './components/student/MyFees';
import MyAttendance from './components/student/MyAttendance';
import MyQuizzes from './components/student/MyQuizzes';
import MyHomework from './components/student/MyHomework';
import ProgressReport from './components/student/ProgressReport';
import Leaderboard from './components/student/Leaderboard';
import Notifications from './components/student/Notifications';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/student" replace />;
  return children;
}

function StudentRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'student') return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin"               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/students"      element={<AdminRoute><StudentManagement /></AdminRoute>} />
          <Route path="/admin/fees"          element={<AdminRoute><FeeManagement /></AdminRoute>} />
          <Route path="/admin/attendance"    element={<AdminRoute><AttendanceManagement /></AdminRoute>} />
          <Route path="/admin/quizzes"       element={<AdminRoute><QuizManagement /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><Announcements /></AdminRoute>} />
          <Route path="/admin/homework"      element={<AdminRoute><HomeworkManagement /></AdminRoute>} />

          <Route path="/student"              element={<StudentRoute><StudentDashboard /></StudentRoute>} />
          <Route path="/student/fees"         element={<StudentRoute><MyFees /></StudentRoute>} />
          <Route path="/student/attendance"   element={<StudentRoute><MyAttendance /></StudentRoute>} />
          <Route path="/student/quizzes"      element={<StudentRoute><MyQuizzes /></StudentRoute>} />
          <Route path="/student/homework"     element={<StudentRoute><MyHomework /></StudentRoute>} />
          <Route path="/student/progress"     element={<StudentRoute><ProgressReport /></StudentRoute>} />
          <Route path="/student/leaderboard"  element={<StudentRoute><Leaderboard /></StudentRoute>} />
          <Route path="/student/notifications"element={<StudentRoute><Notifications /></StudentRoute>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route index element={<RoleRedirect />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => { initializeData(); }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
