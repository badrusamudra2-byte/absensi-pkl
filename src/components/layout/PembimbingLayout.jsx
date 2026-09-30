import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const PembimbingLayout = () => {
  const navigation = [
    { path: '/pembimbing', label: 'Dashboard', icon: 'BarChart2' },
    { path: '/pembimbing/journal/review', label: 'Review Jurnal', icon: 'FileText' },
    { path: '/pembimbing/attendance/recap', label: 'Rekap Kehadiran', icon: 'Calendar' },
    { path: '/pembimbing/attendance/scan', label: 'Scan QR Peserta', icon: 'QrCode' },
  ];

  return (
    <div className="flex flex-1 bg-gray-50">
      <Sidebar navigation={navigation} basePath="/pembimbing" title="Pembimbing" userRole="pembimbing" />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PembimbingLayout;