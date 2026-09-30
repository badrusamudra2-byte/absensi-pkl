import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pembimbingService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Users, TrendingUp, Target, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await pembimbingService.getDashboard();
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

  const today = new Date();
  const todayStr = formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = dashboardData?.stats || {};
  const attendanceToday = dashboardData?.attendance_today || [];
  const pendingJournals = dashboardData?.pending_journals || [];
  const mentees = dashboardData?.mentees || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Pembimbing</h1>
          <p className="text-gray-600">Selamat datang, {user?.name}</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Pembimbing</h1>
          <p className="text-gray-600">Selamat datang, {user?.name} • {todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Peserta Bimbingan</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_mentees || mentees.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.hadir_hari_ini || 0}</p>
              <p className="text-sm text-green-600 mt-1">dari {stats.total_mentees || mentees.length || 0} peserta</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Terlambat Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.terlambat_hari_ini || 0}</p>
              <p className="text-sm text-yellow-600 mt-1">perlu perhatian</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Jurnal Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingJournals.length || stats.pending_journals || 0}</p>
              <p className="text-sm text-blue-600 mt-1">menunggu review</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Kehadiran Peserta Hari Ini</h3>
            <Link to="/pembimbing/attendance/recap">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        }>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {attendanceToday.length > 0 ? (
              attendanceToday.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {record.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.user?.name || 'Peserta'}</p>
                      <p className="text-sm text-gray-500">{record.user?.nim || record.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="status">{record.status}</Badge>
                    <span className="text-sm text-gray-500">
                      Masuk: {record.check_in ? formatDate(record.check_in, { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {record.check_out && ` • Pulang: ${formatDate(record.check_out, { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada data kehadiran hari ini</p>
            )}
          </div>
        </Card>

        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Jurnal Butuh Review</h3>
            <Link to="/pembimbing/journal/review">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        }>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingJournals.length > 0 ? (
              pendingJournals.slice(0, 5).map((journal, index) => (
                <Link key={journal.id} to={`/pembimbing/journal/${journal.id}`} className="block">
                  <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{journal.title}</p>
                        <p className="text-sm text-gray-500">{journal.user?.name} • {formatDate(journal.journal_date)}</p>
                      </div>
                      <Badge variant="status" className="flex-shrink-0">{journal.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada jurnal pending review</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>}>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/pembimbing/journal/review" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <FileText className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Review Jurnal</p>
              <p className="text-xs text-gray-500">{pendingJournals.length} menunggu</p>
            </Link>
            <Link to="/pembimbing/attendance/recap" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Rekap Kehadiran</p>
              <p className="text-xs text-gray-500">Filter & export</p>
            </Link>
            <Link to="/pembimbing/mentees" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Users className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Data Peserta</p>
              <p className="text-xs text-gray-500">{mentees.length} peserta</p>
            </Link>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-semibold text-gray-900">Daftar Peserta Bimbingan</h3>}>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mentees.length > 0 ? (
              mentees.map((mentee, index) => (
                <div key={mentee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                      {mentee.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{mentee.name}</p>
                      <p className="text-sm text-gray-500">{mentee.nim || mentee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={mentee.is_active ? 'success' : 'danger'}>
                      {mentee.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada peserta bimbingan</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;