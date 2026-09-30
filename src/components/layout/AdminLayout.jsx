import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const navigation = [
    { path: '/admin', label: 'Dashboard', icon: 'BarChart2' },
    { path: '/admin/peserta', label: 'Data Peserta', icon: 'Users' },
    { path: '/admin/pembimbing', label: 'Data Pembimbing', icon: 'Shield' },
    { path: '/admin/schedule', label: 'Pengaturan Jadwal', icon: 'Settings' },
    { path: '/admin/audit-log', label: 'Audit Log', icon: 'ClipboardList' },
    { path: '/admin/report', label: 'Laporan & Export', icon: 'FileText' },
  ];

  return (
    <div className="flex flex-1 bg-gray-50">
      <Sidebar navigation={navigation} basePath="/admin" title="Admin Panel" userRole="admin" />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;