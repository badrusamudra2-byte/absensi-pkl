import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/helpers';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Card from '../ui/Card';
import { Camera, X, CheckCircle, AlertCircle, UserCheck, Zap, Shield, RotateCcw } from 'lucide-react';

const FaceVerification = ({ 
  onSuccess, 
  onError, 
  disabled = false,
  attendanceType = 'masuk',
  enrolled = false 
}) => {
  const [step, setStep] = useState(enrolled ? 'verify' : 'enroll');
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setPermissionDenied(false);
      setError(null);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
      } else {
        setError(`Gagal mengakses kamera: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
  };

  const submitVerification = async () => {
    if (!capturedImage || processing) return;
    
    setProcessing(true);
    setError(null);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, send capturedImage to backend for face recognition
      // const response = await fetch('/api/face/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: capturedImage, type: attendanceType }),
      // });
      
      const mockResponse = {
        success: true,
        data: {
          type: attendanceType,
          method: 'face',
          timestamp: new Date().toISOString(),
        }
      };
      
      if (step === 'enroll') {
        setSuccess(true);
        setTimeout(() => {
          setStep('verify');
          setSuccess(false);
          stopCamera();
        }, 2000);
      } else {
        onSuccess(mockResponse.data);
      }
    } catch (err) {
      setError('Gagal memproses verifikasi wajah. Pastikan pencahayaan cukup dan wajah terlihat jelas.');
    } finally {
      setProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSuccess(false);
    setError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  if (!enrolled && step === 'enroll') {
    return (
      <Card>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-3">
              <UserCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pendaftaran Wajah (Enrollment)</h3>
            <p className="text-sm text-gray-500 mt-1">
              Proses ini hanya dilakukan sekali. Pastikan pencahayaan cukup dan wajah terlihat jelas.
            </p>
          </div>

          <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden">
            {permissionDenied ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 bg-red-900/50">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Izin Kamera Diperlukan</p>
                <p className="text-sm text-gray-300 mt-1 text-center max-w-xs">
                  Silakan izinkan akses kamera di pengaturan browser, lalu refresh halaman ini.
                </p>
                <Button variant="ghost" className="mt-4 text-white hover:bg-white/20" onClick={startCamera}>
                  Coba Lagi
                </Button>
              </div>
            ) : stream ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {capturedImage ? (
                  <canvas ref={canvasRef} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-48 border-2 border-purple-500 rounded-xl relative">
                      <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-purple-500" />
                      <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500" />
                      <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500" />
                      <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-purple-500" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {!capturedImage ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-white/90 text-gray-900"
                      onClick={stopCamera}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Batal
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="bg-white/90 text-gray-900"
                      onClick={retakePhoto}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Ulangi
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                <div className="w-24 h-24 border-4 border-white/30 rounded-full mb-4 flex items-center justify-center">
                  <Camera className="w-12 h-12" />
                </div>
                <p className="text-lg font-medium">Kamera Siap</p>
                <p className="text-sm text-gray-300 mt-1">Tekan "Mulai Pendaftaran" untuk memulai</p>
                <Button 
                  onClick={startCamera} 
                  variant="primary" 
                  size="lg"
                  className="mt-4"
                  disabled={disabled}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Mulai Pendaftaran
                </Button>
              </div>
            )}
          </div>

          {!capturedImage && stream && (
            <div className="flex gap-3">
              <Button 
                onClick={capturePhoto}
                variant="primary"
                className="flex-1"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Ambil Foto
              </Button>
              <Button 
                onClick={stopCamera}
                variant="secondary"
                className="flex-1"
              >
                <X className="w-5 h-5 mr-2" />
                Batalkan
              </Button>
            </div>
          )}

          {capturedImage && !success && !processing && (
            <div className="flex gap-3">
              <Button 
                onClick={submitVerification}
                variant="primary"
                className="flex-1"
                size="lg"
                loading={processing}
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Daftarkan Wajah
              </Button>
              <Button 
                onClick={retakePhoto}
                variant="secondary"
                className="flex-1"
              >
                <X className="w-5 h-5 mr-2" />
                Batalkan
              </Button>
            </div>
          )}

          {success && (
            <Button variant="primary" className="flex-1" disabled>
              <CheckCircle className="w-5 h-5 mr-2 animate-spin" />
              Pendaftaran Berhasil
            </Button>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Keamanan Data Wajah</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Data wajah dienkripsi dan disimpan dengan aman</li>
                  <li>Hanya digunakan untuk verifikasi kehadiran</li>
                  <li>Tidak dibagikan ke pihak ketiga</li>
                  <li>Dapat dihapus kapan saja dari pengaturan profil</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Verifikasi Wajah</h3>
          <p className="text-sm text-gray-500 mt-1">
            {attendanceType === 'masuk' ? 'Absen Masuk' : 'Absen Pulang'} menggunakan pengenalan wajah
          </p>
        </div>

        <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden">
          {permissionDenied ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 bg-red-900/50">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Izin Kamera Diperlukan</p>
              <Button variant="ghost" className="mt-4 text-white hover:bg-white/20" onClick={startCamera}>
                Coba Lagi
              </Button>
            </div>
          ) : stream ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {capturedImage ? (
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-48 border-2 border-blue-500 rounded-xl relative">
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
                    <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {!capturedImage ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/90 text-gray-900"
                    onClick={stopCamera}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Batal
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/90 text-gray-900"
                    onClick={retakePhoto}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Ulangi
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
              <div className="w-24 h-24 border-4 border-white/30 rounded-full mb-4 flex items-center justify-center">
                <Camera className="w-12 h-12" />
              </div>
              <p className="text-lg font-medium">Kamera Siap</p>
              <p className="text-sm text-gray-300 mt-1">Tekan "Mulai Verifikasi" untuk memulai</p>
              <Button 
                onClick={startCamera} 
                variant="primary" 
                size="lg"
                className="mt-4"
                disabled={disabled}
              >
                <Camera className="w-5 h-5 mr-2" />
                Mulai Verifikasi
              </Button>
            </div>
          )}
        </div>

        {!capturedImage && stream && (
          <div className="flex gap-3">
            <Button 
              onClick={capturePhoto}
              variant="primary"
              className="flex-1"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Ambil Foto
            </Button>
            <Button 
              onClick={stopCamera}
              variant="secondary"
              className="flex-1"
            >
              <X className="w-5 h-5 mr-2" />
              Batalkan
            </Button>
          </div>
        )}

        {capturedImage && !success && !processing && (
          <div className="flex gap-3">
            <Button 
              onClick={submitVerification}
              variant="primary"
              className="flex-1"
              size="lg"
              loading={processing}
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Verifikasi & Absen
            </Button>
            <Button 
              onClick={retakePhoto}
              variant="secondary"
              className="flex-1"
            >
              <X className="w-5 h-5 mr-2" />
              Batalkan
            </Button>
          </div>
        )}

        {success && (
          <Button variant="primary" className="flex-1" disabled>
            <CheckCircle className="w-5 h-5 mr-2 animate-spin" />
            Verifikasi Berhasil
          </Button>
        )}

        {error && (
          <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
        )}

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Camera className="w-4 h-4 text-gray-400" />
              <span>Posisikan wajah di dalam kotak</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-4 h-4 text-gray-400" />
              <span>Pastikan pencahayaan cukup</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-4 h-4 text-gray-400" />
              <span>Hindari contralight (lampu di belakang)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span>Lepaskan kacamata jika memungkinkan</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FaceVerification;