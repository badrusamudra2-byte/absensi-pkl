import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/helpers';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import { Camera, X, CheckCircle, AlertCircle, RotateCcw, Smartphone } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  attendanceType = 'masuk' 
}) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [html5Qrcode, setHtml5Qrcode] = useState(null);
  const videoRef = useRef(null);
  const scanRef = useRef(null);

  const startScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Browser tidak mendukung akses kamera. Gunakan browser modern (Chrome/Firefox/Edge).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const qrcode = new Html5Qrcode('qr-reader');
      setHtml5Qrcode(qrcode);

      await qrcode.start(
        { facingMode: { ideal: facingMode } },
        { fps: 10, qrbox: { width: 256, height: 256 } },
        (qrData) => handleQRDetected(qrData),
        (err) => { /* ignore scan errors */ }
      );

      setScanning(true);
      setPermissionDenied(false);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.');
      } else {
        setError(`Gagal mengakses kamera: ${err.message}`);
      }
    }
  };

  const stopScanner = async () => {
    if (html5Qrcode && html5Qrcode.isScanning) {
      try {
        await html5Qrcode.stop();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
    
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setHtml5Qrcode(null);
  };

  const handleQRDetected = async (qrData) => {
    stopScanner();
    setResult(qrData);
    
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        setError('Format QR Code tidak valid');
        setTimeout(() => {
          setError(null);
          if (scanning) startScanner();
        }, 3000);
        return;
      }

      // Validasi tanggal QR code (harus hari ini)
      const today = new Date().toISOString().split('T')[0];
      if (parsedData.date && parsedData.date !== today) {
        setError(`QR Code kadaluarsa (tanggal: ${parsedData.date}). Silakan minta QR Code baru.`);
        setTimeout(() => {
          setError(null);
          if (scanning) startScanner();
        }, 5000);
        return;
      }

      const response = await fetch('/api/peserta/attendance/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData, type: attendanceType }),
      });
      const data = await response.json();
      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.message || 'QR Code tidak valid atau sudah kadaluarsa');
        setTimeout(() => {
          setError(null);
          if (scanning) startScanner();
        }, 3000);
      }
    } catch (err) {
      setError('Gagal memproses QR Code. Silakan coba lagi.');
      setTimeout(() => {
        setError(null);
        if (scanning) startScanner();
      }, 3000);
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (scanning) {
      stopScanner();
      setTimeout(startScanner, 500);
    }
  };

  const retryScan = () => {
    setError(null);
    setResult(null);
    startScanner();
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const isSuccess = result && !error;

  return (
    <Card>
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
          {!scanning && !permissionDenied ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              <div className="w-24 h-24 border-4 border-white/30 rounded-full mb-4 flex items-center justify-center">
                <Camera className="w-12 h-12" />
              </div>
              <p className="text-lg font-medium">Kamera Siap</p>
              <p className="text-sm text-gray-300 mt-1">Tekan "Mulai Scan" untuk memulai</p>
              <Button 
                onClick={startScanner} 
                variant="primary" 
                size="lg"
                className="mt-4"
                disabled={disabled}
              >
                <Camera className="w-5 h-5 mr-2" />
                Mulai Scan QR
              </Button>
            </div>
          ) : permissionDenied ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 bg-red-900/50">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Izin Kamera Diperlukan</p>
              <p className="text-sm text-gray-300 mt-1 text-center max-w-xs">
                Silakan izinkan akses kamera di pengaturan browser, lalu refresh halaman ini.
              </p>
              <Button variant="outline" className="mt-4" onClick={startScanner}>
                Coba Lagi
              </Button>
            </div>
          ) : (
            <>
              <div id="qr-reader" ref={videoRef} className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-lg relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
                  <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-1 bg-blue-500/50 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={switchCamera}
                  className="bg-white/90 text-gray-900"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Ganti Kamera
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={stopScanner}
                  className="bg-white/90 text-gray-900"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hentikan
                </Button>
              </div>
            </>
          )}

          {isSuccess && (
            <div className="absolute inset-0 bg-green-600/90 flex items-center justify-center z-10 animate-fade-in">
              <div className="text-center text-white p-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">QR Code Terdeteksi!</h3>
                <p className="mt-2">{result}</p>
                <p className="text-sm text-green-100 mt-2">Memproses absensi...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center z-10 animate-fade-in">
              <div className="text-center text-white p-6">
                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Gagal</h3>
                <p className="mt-2">{error}</p>
                <Button 
                  variant="ghost" 
                  className="mt-4 text-white hover:bg-white/20"
                  onClick={retryScan}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Scan Ulang
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Mode: {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Tipe: {attendanceType === 'masuk' ? 'Absen Masuk' : 'Absen Pulang'}</span>
            </div>
          </div>

          {scanning && !isSuccess && !error && (
            <p className="text-center text-sm text-gray-500 animate-pulse">
              Arahkan kamera ke QR Code pada layar absensi...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QRScanner;