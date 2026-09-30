import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pesertaService } from '../../services/api';
import { formatTime, formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Tabs from '../../components/ui/Tabs';
import QRCodeDisplay from '../../components/attendance/QRCodeDisplay';
import FaceVerification from '../../components/attendance/FaceVerification';
import { Clock, CheckCircle, AlertCircle, Wifi, WifiOff, Shield, QrCode, MapPin } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('display');
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const intervalRef = useRef(null);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await pesertaService.getDashboard();
      setAttendanceToday(response.data.attendance_today);
    } catch (err) {
      console.error('Failed to fetch attendance status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerTime = async () => {
    try {
      const response = await pesertaService.getDashboard();
      setServerTime(new Date(response.data.server_time || Date.now()));
    } catch (err) {
      setServerTime(new Date());
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
    fetchServerTime();
    intervalRef.current = setInterval(fetchServerTime, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleAttendanceSuccess = async (result) => {
    setSuccessMessage(`Absensi ${result.type === 'masuk' ? 'masuk' : 'pulang'} berhasil pada ${formatTime(new Date())}`);
    setError(null);
    await fetchAttendanceStatus();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleAttendanceError = (err) => {
    setError(err.response?.data?.message || 'Absensi gagal. Silakan coba lagi.');
    setSuccessMessage(null);
    setTimeout(() => setError(null), 5000);
  };

  const canCheckIn = !attendanceToday?.check_in;
  const canCheckOut = attendanceToday?.check_in && !attendanceToday?.check_out;
  const isWithinWorkHours = serverTime && serverTime.getHours() >= 6 && serverTime.getHours() < 22;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
          <p className="text-gray-600">Pilih metode absensi</p>
        </div>
        <Card className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi PKL</h1>
          <p className="text-gray-600">Pilih metode absensi untuk hari ini</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm', 
            serverTime ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700')}>
            {serverTime ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>Server: {serverTime ? formatTime(serverTime) : 'Menghubungkan...'}</span>
          </div>
        </div>
      </div>

      <Card header={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Status Absensi Hari Ini</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{serverTime ? formatDate(serverTime, { weekday: 'long', day: 'numeric', month: 'long' }) : '-'}</span>
          </div>
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn('p-4 rounded-xl border-2', attendanceToday?.check_in ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50')}>
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', attendanceToday?.check_in ? 'bg-green-100' : 'bg-gray-100')}>
                {attendanceToday?.check_in ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Absen Masuk</p>
                <p className="text-sm text-gray-500">
                  {attendanceToday?.check_in 
                    ? `${formatTime(attendanceToday.check_in)} • ${attendanceToday?.method || 'Manual'}`
                    : 'Belum absen masuk'}
                </p>
                {attendanceToday?.status && (
                  <Badge variant="status" className="mt-1">
                    {attendanceToday.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className={cn('p-4 rounded-xl border-2', attendanceToday?.check_out ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50')}>
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl', attendanceToday?.check_out ? 'bg-blue-100' : 'bg-gray-100')}>
                {attendanceToday?.check_out ? (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">Absen Pulang</p>
                <p className="text-sm text-gray-500">
                  {attendanceToday?.check_out 
                    ? `${formatTime(attendanceToday.check_out)}`
                    : attendanceToday?.check_in
                      ? 'Menunggu jam pulang'
                      : 'Absen masuk terlebih dahulu'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />}

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        tabs={[
          { value: 'display', label: 'Tampilkan QR', icon: QrCode, disabled: !canCheckIn && !canCheckOut },
          { value: 'face', label: 'Verifikasi Wajah', icon: Shield, disabled: !canCheckIn && !canCheckOut },
        ]}
      />

      {activeTab === 'display' && (
        <QRCodeDisplay 
          user={user}
          attendanceType={canCheckIn ? 'masuk' : 'pulang'}
        />
      )}

      {activeTab === 'face' && (
        <FaceVerification
          onSuccess={handleAttendanceSuccess}
          onError={handleAttendanceError}
          disabled={!canCheckIn && !canCheckOut}
          attendanceType={canCheckIn ? 'masuk' : 'pulang'}
          enrolled={!!user?.face_enrolled}
        />
      )}

      {(!canCheckIn && !canCheckOut) && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Absensi Hari Ini Selesai</p>
              <p className="text-sm text-green-700">
                Anda telah melakukan absen masuk dan pulang hari ini. 
                Terima kasih telah hadir tepat waktu!
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Informasi Absensi</h3>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Lokasi Kantor</span>
            </div>
            <p className="text-gray-600">Absensi hanya valid dalam radius 100m dari kantor Astakira Media</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Jam Kerja</span>
            </div>
            <p className="text-gray-600">Masuk: 08:00 - 08:15 WIB | Pulang: 17:00 WIB</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Keamanan</span>
            </div>
            <p className="text-gray-600">Data wajah dienkripsi dan hanya digunakan untuk verifikasi kehadiran</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;