import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pembimbingService } from '../../services/api';
import { formatDate, formatTime, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import QRScanner from '../../components/attendance/QRScanner';
import { Camera, CheckCircle, AlertCircle, User, Clock, MapPin, Shield, QrCode, RotateCcw } from 'lucide-react';

const QRScannerPage = () => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today_scanned: 0, total_mentees: 0 });

  const fetchMentees = async () => {
    try {
      const response = await pembimbingService.getMentees();
      setMentees(response.data.data || response.data);
      setStats(prev => ({ ...prev, total_mentees: (response.data.data || response.data).length }));
    } catch (err) {
      console.error('Failed to fetch mentees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  const handleScanSuccess = async (result) => {
    try {
      // In real app, this would call API to record attendance
      // const response = await pembimbingService.recordAttendanceFromQR(result);
      
      // Mock success
      const scannedUser = mentees.find(m => m.id === result.userId) || { name: result.name, email: result.email };
      setLastScan({
        ...result,
        mentee_name: scannedUser.name,
        scanned_at: new Date().toISOString(),
        type: result.type || 'masuk',
      });
      setSuccessMessage(`Berhasil memverifikasi ${scannedUser.name} untuk ${result.type === 'masuk' ? 'absen masuk' : 'absen pulang'}`);
      setStats(prev => ({ ...prev, today_scanned: prev.today_scanned + 1 }));
      setError(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses QR Code');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleScanError = (err) => {
    setError(err.message || 'QR Code tidak valid atau sudah kadaluarsa');
    setTimeout(() => setError(null), 5000);
  };

  const resetScan = () => {
    setLastScan(null);
    setScanning(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Peserta</h1>
          <p className="text-gray-600">Verifikasi kehadiran peserta bimbingan</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Peserta</h1>
          <p className="text-gray-600">Verifikasi kehadiran peserta bimbingan dengan scan QR Code</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-700">
              <QrCode className="w-5 h-5" />
              <span className="font-medium">Hari ini: {stats.today_scanned} scan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card header={
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Scanner QR Code</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Camera className="w-4 h-4" />
                <span>Mode: Kamera Belakang</span>
              </div>
            </div>
          }>
            <div className="space-y-4">
              {!scanning && !lastScan ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 p-4 bg-blue-50 rounded-full">
                    <Camera className="w-12 h-12 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Siap Scan QR Code</h3>
                  <p className="text-sm text-gray-500 mt-1">Arahkan kamera ke QR Code peserta untuk memverifikasi kehadiran</p>
                  <Button 
                    onClick={() => setScanning(true)} 
                    variant="primary" 
                    size="lg"
                    className="mt-6"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Mulai Scan
                  </Button>
                </div>
              ) : lastScan && !scanning ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 p-4 bg-green-100 rounded-full">
                    <CheckCircle className="w-10 h-10 text-green-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Verifikasi Berhasil</h3>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-white rounded-lg">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lastScan.mentee_name || lastScan.name}</p>
                        <p className="text-sm text-gray-500">{lastScan.type === 'masuk' ? 'Absen Masuk' : 'Absen Pulang'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Waktu Scan</p>
                        <p className="font-medium text-gray-900">{formatTime(lastScan.scanned_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tanggal</p>
                        <p className="font-medium text-gray-900">{formatDate(lastScan.scanned_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button variant="outline" onClick={resetScan} size="lg">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Scan Lagi
                    </Button>
                  </div>
                </div>
              ) : (
                <QRScanner
                  onSuccess={handleScanSuccess}
                  onError={handleScanError}
                  disabled={!scanning}
                  attendanceType="masuk"
                />
              )}

              {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
              {successMessage && <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card header={<h3 className="text-lg font-semibold text-gray-900">Panduan Scan</h3>}>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">QR Code Peserta</p>
                  <p className="text-gray-600">Peserta menampilkan QR dari aplikasi mereka</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verifikasi Otomatis</p>
                  <p className="text-gray-600">Sistem otomatis mencatat kehadiran</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Validasi Real-time</p>
                  <p className="text-gray-600">Data tersimpan langsung ke server</p>
                </div>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="text-lg font-semibold text-gray-900">Peserta Bimbingan</h3>}>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mentees.slice(0, 10).map((mentee) => (
                <div key={mentee.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{mentee.name}</p>
                      <p className="text-xs text-gray-500">{mentee.email}</p>
                    </div>
                  </div>
                  <Badge variant="info">Belum Scan</Badge>
                </div>
              ))}
              {mentees.length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">Tidak ada peserta bimbingan</p>
              )}
              {mentees.length > 10 && (
                <p className="text-center text-gray-500 text-sm">+{mentees.length - 10} peserta lainnya</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;