import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pesertaService } from '../../services/api';
import { formatDate, formatTime, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, ArrowRight, TrendingUp, Target, ClipboardList } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await pesertaService.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Selamat datang, {user?.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayStr = formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' });
  
  const attendanceToday = dashboardData?.attendance_today || {};
  const lastJournal = dashboardData?.last_journal || {};
  const stats = dashboardData?.stats || {};

  const checkInStatus = attendanceToday.check_in ? 'Sudah Absen Masuk' : 'Belum Absen Masuk';
  const checkOutStatus = attendanceToday.check_out ? 'Sudah Absen Pulang' : 'Belum Absen Pulang';
  const canCheckIn = !attendanceToday.check_in;
  const canCheckOut = attendanceToday.check_in && !attendanceToday.check_out;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.name} • {todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Absen Masuk</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {attendanceToday.check_in ? formatTime(attendanceToday.check_in) : '--:--'}
              </p>
              <Badge variant="status" className="mt-2">
                {attendanceToday.status || 'Belum Absen'}
              </Badge>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Absen Pulang</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {attendanceToday.check_out ? formatTime(attendanceToday.check_out) : '--:--'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {checkOutStatus}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Jurnal Terakhir</p>
              <p className="text-lg font-medium text-gray-900 mt-1 line-clamp-1">
                {lastJournal.title || 'Belum ada jurnal'}
              </p>
              {lastJournal.status && (
                <Badge variant="status" className="mt-2">
                  {lastJournal.status}
                </Badge>
              )}
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="text-lg font-semibold text-gray-900">Status Absensi Hari Ini</h3>}>
          <div className="space-y-4">
            <div className={cn('flex items-center justify-between p-4 rounded-lg', canCheckIn ? 'bg-green-50' : 'bg-gray-50')}>
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-xl', canCheckIn ? 'bg-green-100' : 'bg-gray-100')}>
                  {canCheckIn ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Absen Masuk</p>
                  <p className="text-sm text-gray-500">
                    {attendanceToday.check_in 
                      ? `Terlaksana pada ${formatTime(attendanceToday.check_in)} (${attendanceToday.method || 'Manual'})`
                      : 'Belum dilakukan'}
                  </p>
                </div>
              </div>
              {canCheckIn && (
                <Link to="/peserta/attendance">
                  <Button variant="primary" size="sm">
                    Absen Sekarang
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>

            <div className={cn('flex items-center justify-between p-4 rounded-lg', canCheckOut ? 'bg-blue-50' : 'bg-gray-50')}>
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-xl', canCheckOut ? 'bg-blue-100' : 'bg-gray-100')}>
                  {canCheckOut ? (
                    <Target className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Absen Pulang</p>
                  <p className="text-sm text-gray-500">
                    {attendanceToday.check_out
                      ? `Terlaksana pada ${formatTime(attendanceToday.check_out)}`
                      : attendanceToday.check_in
                        ? 'Tersedia setelah jam kerja'
                        : 'Absen masuk terlebih dahulu'}
                  </p>
                </div>
              </div>
              {canCheckOut && (
                <Link to="/peserta/attendance">
                  <Button variant="primary" size="sm">
                    Absen Pulang
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-semibold text-gray-900">Ringkasan Statistik</h3>}>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{stats.total_hadir || 0}</p>
              <p className="text-sm text-gray-600">Hadir</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{stats.total_terlambat || 0}</p>
              <p className="text-sm text-gray-600">Terlambat</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{stats.total_jurnal_disetujui || 0}</p>
              <p className="text-sm text-gray-600">Jurnal Disetujui</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-600">{stats.total_jurnal_pending || 0}</p>
              <p className="text-sm text-gray-600">Jurnal Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
          </div>
        }>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/peserta/attendance" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <ClipboardList className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Absensi</p>
              <p className="text-xs text-gray-500">Scan QR / Wajah</p>
            </Link>
            <Link to="/peserta/journal/create" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <FileText className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Buat Jurnal</p>
              <p className="text-xs text-gray-500">Jurnal harian baru</p>
            </Link>
            <Link to="/peserta/journal" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <FileText className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Daftar Jurnal</p>
              <p className="text-xs text-gray-500">Lihat riwayat</p>
            </Link>
            <Link to="/peserta/attendance/history" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Calendar className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="font-medium text-gray-900">Riwayat Absensi</p>
              <p className="text-xs text-gray-500">Filter & export</p>
            </Link>
          </div>
        </Card>

        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Jadwal Kerja</h3>
          </div>
        }>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Jam Masuk</p>
                  <p className="text-sm text-gray-500">08:00 WIB</p>
                </div>
              </div>
              <Badge variant="primary">Tetap</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Jam Pulang</p>
                  <p className="text-sm text-gray-500">17:00 WIB</p>
                </div>
              </div>
              <Badge variant="success">Tetap</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Toleransi Keterlambatan</p>
                  <p className="text-sm text-gray-500">15 Menit</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hari Kerja</p>
                  <p className="text-sm text-gray-500">Senin - Jumat</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;