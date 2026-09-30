import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Users, Shield, FileText, Calendar, Settings, TrendingUp, Target, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
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
  const recentActivities = dashboardData?.recent_activities || [];
  const lateComers = dashboardData?.late_comers || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Selamat datang, {user?.name}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600">Selamat datang, {user?.name} • {todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Peserta PKL</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_peserta || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pembimbing</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_pembimbing || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Jurnal Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending_journals || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Keterlambatan Bulan Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_late_this_month || 0}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Peserta Terlambat Hari Ini</h3>
            <Link to="/admin/peserta">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        }>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {lateComers.length > 0 ? (
              lateComers.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                      {item.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.user?.name}</p>
                      <p className="text-sm text-gray-500">{item.user?.nim} • {item.pembimbing?.name || 'Tanpa Pembimbing'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="danger">Terlambat</Badge>
                    <span className="text-sm text-gray-500">
                      {item.check_in ? formatDate(item.check_in, { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
                Tidak ada keterlambatan hari ini
              </p>
            )}
          </div>
        </Card>

        <Card header={
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
            <Link to="/admin/audit-log">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        }>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    activity.action.includes('login') ? 'bg-blue-100 text-blue-600' :
                    activity.action.includes('create') ? 'bg-green-100 text-green-600' :
                    activity.action.includes('update') ? 'bg-yellow-100 text-yellow-600' :
                    activity.action.includes('delete') ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {activity.action.includes('login') && <Clock className="w-4 h-4" />}
                    {activity.action.includes('create') && <CheckCircle className="w-4 h-4" />}
                    {activity.action.includes('update') && <AlertCircle className="w-4 h-4" />}
                    {activity.action.includes('delete') && <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.user?.name} • {formatDate(activity.created_at, { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada aktivitas terbaru</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card header={<h3 className="text-lg font-semibold text-gray-900">Manajemen Data</h3>}>
          <div className="space-y-3">
            <Link to="/admin/peserta" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Data Peserta PKL</p>
                  <p className="text-sm text-gray-500">{stats.total_peserta || 0} peserta terdaftar</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/pembimbing" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Data Pembimbing</p>
                  <p className="text-sm text-gray-500">{stats.total_pembimbing || 0} pembimbing terdaftar</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/schedule" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pengaturan Jadwal</p>
                  <p className="text-sm text-gray-500">Jam kerja & toleransi</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-semibold text-gray-900">Monitoring & Laporan</h3>}>
          <div className="space-y-3">
            <Link to="/admin/audit-log" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Audit Log</p>
                  <p className="text-sm text-gray-500">Riwayat aktivitas sistem</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/report" className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Laporan & Export</p>
                  <p className="text-sm text-gray-500">PDF/Excel kehadiran & jurnal</p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        <Card header={<h3 className="text-lg font-semibold text-gray-900">Info Sistem</h3>}>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Versi Aplikasi: 1.0.0
              </p>
              <p className="text-sm text-blue-700 mt-1">Sistem Absensi PKL & Jurnal Astakira Media</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Database: Terhubung
              </p>
              <p className="text-sm text-green-700 mt-1">MySQL via Sequelize ORM</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="font-medium text-purple-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Autentikasi: JWT + Refresh Token
              </p>
              <p className="text-sm text-purple-700 mt-1">Role-based Access Control</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;