import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const PesertaLayout = () => {
  const navigation = [
    { path: '/peserta', label: 'Dashboard', icon: 'BarChart2' },
    { path: '/peserta/attendance', label: 'Absensi', icon: 'ClipboardList' },
    { path: '/peserta/attendance/history', label: 'Riwayat Absensi', icon: 'Calendar' },
    { path: '/peserta/journal', label: 'Jurnal Kegiatan', icon: 'BookOpen' },
  ];

  return (
    <div className="flex flex-1 bg-gray-50">
      <Sidebar navigation={navigation} basePath="/peserta" userRole="peserta" />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PesertaLayout;