import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { Clock, Calendar, Save, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleSettingsPage = () => {
  const [schedule, setSchedule] = useState({
    work_start_time: '08:00',
    work_end_time: '17:00',
    late_tolerance_minutes: 15,
    work_days: [1, 2, 3, 4, 5],
    timezone: 'Asia/Jakarta',
    break_start_time: '12:00',
    break_end_time: '13:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSchedule = async () => {
    try {
      const response = await adminService.getSchedule();
      setSchedule(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'work_days') {
      const day = parseInt(value);
      setSchedule(prev => ({
        ...prev,
        work_days: checked 
          ? [...prev.work_days, day].sort((a, b) => a - b)
          : prev.work_days.filter(d => d !== day)
      }));
    } else {
      setSchedule(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await adminService.updateSchedule(schedule);
      setSuccess('Pengaturan jadwal berhasil disimpan');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const dayLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Jadwal</h1>
          <p className="text-gray-600">Konfigurasi jam kerja dan hari kerja</p>
        </div>
        <Card className="animate-pulse">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Jadwal Kerja</h1>
        <p className="text-gray-600">Konfigurasi jam masuk, jam pulang, toleransi keterlambatan, dan hari kerja</p>
      </div>

      {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} dismissible onClose={() => setSuccess(null)} />}

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Jam Kerja</h3>}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Jam Masuk *"
              name="work_start_time"
              type="time"
              value={schedule.work_start_time}
              onChange={handleChange}
              required
              leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Jam Pulang *"
              name="work_end_time"
              type="time"
              value={schedule.work_end_time}
              onChange={handleChange}
              required
              leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Toleransi Keterlambatan (Menit) *"
              name="late_tolerance_minutes"
              type="number"
              value={schedule.late_tolerance_minutes}
              onChange={handleChange}
              required
              min={0}
              max={120}
              leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
            <Input
              label="Istirahat Mulai"
              name="break_start_time"
              type="time"
              value={schedule.break_start_time}
              onChange={handleChange}
              leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Istirahat Selesai"
              name="break_end_time"
              type="time"
              value={schedule.break_end_time}
              onChange={handleChange}
              leftIcon={<Clock className="w-5 h-5 text-gray-400" />}
            />
            <Select
              label="Zona Waktu"
              options={[
                { value: 'Asia/Jakarta', label: 'WIB (UTC+7)' },
                { value: 'Asia/Makassar', label: 'WITA (UTC+8)' },
                { value: 'Asia/Jayapura', label: 'WIT (UTC+9)' },
              ]}
              value={schedule.timezone}
              onChange={handleChange}
            />
          </div>
        </form>
      </Card>

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Hari Kerja</h3>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Pilih hari-hari yang merupakan hari kerja (absensi wajib)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dayLabels.map((day, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50">
                <input
                  type="checkbox"
                  value={index}
                  checked={schedule.work_days.includes(index)}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">{day}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Ringkasan Konfigurasi</h3>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Jam Masuk</p>
            <p className="text-xl font-bold text-gray-900">{schedule.work_start_time} WIB</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Jam Pulang</p>
            <p className="text-xl font-bold text-gray-900">{schedule.work_end_time} WIB</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Toleransi Keterlambatan</p>
            <p className="text-xl font-bold text-gray-900">{schedule.late_tolerance_minutes} Menit</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Hari Kerja</p>
            <p className="text-xl font-bold text-gray-900">
              {schedule.work_days.map(d => dayLabels[d].substring(0, 3)).join(', ')}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Waktu Istirahat</p>
            <p className="text-xl font-bold text-gray-900">
              {schedule.break_start_time} - {schedule.break_end_time}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Zona Waktu</p>
            <p className="text-xl font-bold text-gray-900">{schedule.timezone}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={fetchSchedule}>
          Reset ke Default
        </Button>
        <Button type="submit" form="schedule-form" variant="primary" loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
};

export default ScheduleSettingsPage;