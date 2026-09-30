import { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/helpers';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Download, RefreshCw, QrCode, Clock } from 'lucide-react';

const QRCodeDisplay = ({ 
  user, 
  attendanceType = 'masuk',
  size = 256,
  className = '' 
}) => {
  const canvasRef = useRef(null);
  const qrDataRef = useRef(null);
  const [dailyToken, setDailyToken] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });

  // Update token at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;

    const timer = setTimeout(() => {
      setDailyToken(new Date().toISOString().split('T')[0]);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !user) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const data = JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      type: attendanceType,
      date: dailyToken, // Daily changing token
    });
    qrDataRef.current = data;

    canvas.width = size;
    canvas.height = size;
    
    // Simple QR code pattern (placeholder - in production use qrcode library)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    
    // Draw a simple pattern that looks like QR
    const moduleSize = size / 25;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Simple pattern based on data hash
        const hash = data.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const pseudoRandom = Math.sin(i * 100 + j * 10 + hash) > 0;
        if (pseudoRandom) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add finder patterns (corners)
    const drawFinder = (x, y) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };
    
    drawFinder(0, 0);
    drawFinder(18, 0);
    drawFinder(0, 18);
  }, [user, attendanceType, size, dailyToken]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `attendance-qr-${user?.email}-${attendanceType}-${dailyToken}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className={cn('text-center', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            QR Code {attendanceType === 'masuk' ? 'Absen Masuk' : 'Absen Pulang'}
          </h3>
          <QrCode className="w-6 h-6 text-blue-600" />
        </div>
        
        <p className="text-sm text-gray-500">
          Tampilkan QR ini ke pembimbing untuk diverifikasi
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>Berlaku hingga: 23:59 hari ini ({dailyToken})</span>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="border border-gray-200 rounded-lg bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={downloadQR} size="sm">
            <Download className="w-4 h-4 mr-1" />
            Unduh
          </Button>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-left text-xs text-gray-600">
          <p className="font-medium text-gray-900 mb-1">Data QR Code:</p>
          <p className="font-mono break-all">{qrDataRef.current || 'Generating...'}</p>
        </div>
      </div>
    </Card>
  );
};

export default QRCodeDisplay;