import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthWrapper from '../components/layout/AuthWrapper';
import LoginPage from '../pages/auth/LoginPage';
import ProfilePage from '../pages/profile/ProfilePage';

import PesertaLayout from '../components/layout/PesertaLayout';
import PesertaDashboard from '../pages/peserta/DashboardPage';
import PesertaAttendance from '../pages/peserta/AttendancePage';
import PesertaAttendanceHistory from '../pages/peserta/AttendanceHistoryPage';
import PesertaJournalList from '../pages/peserta/JournalListPage';
import PesertaJournalForm from '../pages/peserta/JournalFormPage';
import PesertaJournalDetail from '../pages/peserta/JournalDetailPage';

import PembimbingLayout from '../components/layout/PembimbingLayout';
import PembimbingDashboard from '../pages/pembimbing/DashboardPage';
import PembimbingJournalReview from '../pages/pembimbing/JournalReviewPage';
import PembimbingJournalDetail from '../pages/pembimbing/JournalDetailPage';
import PembimbingAttendanceRecap from '../pages/pembimbing/AttendanceRecapPage';
import PembimbingQRScanner from '../pages/pembimbing/QRScannerPage';

import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/DashboardPage';
import AdminPesertaManagement from '../pages/admin/PesertaManagementPage';
import AdminPembimbingManagement from '../pages/admin/PembimbingManagementPage';
import AdminScheduleSettings from '../pages/admin/ScheduleSettingsPage';
import AdminAuditLog from '../pages/admin/AuditLogPage';
import AdminReport from '../pages/admin/ReportPage';

import { PesertaGuard, PembimbingGuard, AdminGuard, AuthGuard } from './RouteGuard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthWrapper />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'profile',
        element: <AuthGuard><ProfilePage /></AuthGuard>,
      },
      {
        path: 'peserta',
        element: <PesertaGuard><PesertaLayout /></PesertaGuard>,
        children: [
          { index: true, element: <PesertaDashboard /> },
          { path: 'attendance', element: <PesertaAttendance /> },
          { path: 'attendance/history', element: <PesertaAttendanceHistory /> },
          { path: 'journal', element: <PesertaJournalList /> },
          { path: 'journal/create', element: <PesertaJournalForm /> },
          { path: 'journal/edit/:id', element: <PesertaJournalForm /> },
          { path: 'journal/:id', element: <PesertaJournalDetail /> },
        ],
      },
      {
        path: 'pembimbing',
        element: <PembimbingGuard><PembimbingLayout /></PembimbingGuard>,
        children: [
          { index: true, element: <PembimbingDashboard /> },
          { path: 'journal/review', element: <PembimbingJournalReview /> },
          { path: 'journal/:id', element: <PembimbingJournalDetail /> },
          { path: 'attendance/recap', element: <PembimbingAttendanceRecap /> },
          { path: 'attendance/scan', element: <PembimbingQRScanner /> },
        ],
      },
      {
        path: 'admin',
        element: <AdminGuard><AdminLayout /></AdminGuard>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'peserta', element: <AdminPesertaManagement /> },
          { path: 'pembimbing', element: <AdminPembimbingManagement /> },
          { path: 'schedule', element: <AdminScheduleSettings /> },
          { path: 'audit-log', element: <AdminAuditLog /> },
          { path: 'report', element: <AdminReport /> },
        ],
      },
    ],
  },
]);

export default router;