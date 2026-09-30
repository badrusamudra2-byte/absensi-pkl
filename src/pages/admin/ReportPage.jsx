import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { formatDate, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { Calendar, Download, FileText, BarChart2, Users, Clock, FileSpreadsheet, AlertCircle, Shield } from 'lucide-react';

const ReportPage = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState({
    division: '',
    pembimbing_id: '',
    status: '',
    format: 'pdf',
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [pembimbingList, setPembimbingList] = useState([]);

  const fetchFilters = async () => {
    try {
      const [divRes, pembRes] = await Promise.all([
        adminService.getPeserta({ limit: 1000 }),
        adminService.getPembimbing({ limit: 1000 }),
      ]);
      const divSet = new Set();
      (divRes.data.data || divRes.data).forEach(p => p.division && divSet.add(p.division));
      setDivisions(Array.from(divSet));
      setPembimbingList(pembRes.data.data || pembRes.data);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (key, value) => {
    setDateRange(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Tanggal mulai dan akhir wajib diisi');
      return;
    }
    if (new Date(dateRange.start) > new Date(dateRange.end)) {
      setError('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const params = {
        ...dateRange,
        ...filters,
        type: reportType,
      };
      const response = await adminService.exportReport(params);
      
      const blob = new Blob([response.data], { 
        type: filters.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-${reportType}-${dateRange.start}-${dateRange.end}.${filters.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Laporan berhasil diunduh');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat laporan');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    { 
      value: 'attendance', 
      label: 'Laporan Kehadiran', 
      icon: Clock,
      description: 'Rekap absensi peserta per hari/bulan dengan status hadir, terlambat, izin, sakit, alpha'
    },
    { 
      value: 'journal', 
      label: 'Laporan Jurnal', 
      icon: FileText,
      description: 'Daftar jurnal peserta dengan status draft, dikirim, revisi, disetujui'
    },
    { 
      value: 'late_summary', 
      label: 'Rekap Keterlambatan', 
      icon: AlertCircle,
      description: 'Statistik keterlambatan per peserta, per divisi, per bulan'
    },
    { 
      value: 'participant_summary', 
      label: 'Rekap Peserta', 
      icon: Users,
      description: 'Data lengkap peserta PKL dengan pembimbing, divisi, status aktif'
    },
    { 
      value: 'supervisor_summary', 
      label: 'Rekap Pembimbing', 
      icon: Shield,
      description: 'Data pembimbing dengan jumlah peserta bimbingan dan divisi'
    },
  ];

  const selectedType = reportTypes.find(t => t.value === reportType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Export</h1>
        <p className="text-gray-600">Buat dan unduh laporan sistem dalam format PDF atau Excel</p>
      </div>

      {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} dismissible onClose={() => setSuccess(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Laporan</h3>
          <div className="space-y-2">
            {reportTypes.map((type) => (
              <label 
                key={type.value}
                className={cn(
                  'block p-4 border rounded-xl cursor-pointer transition-all',
                  reportType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  checked={reportType === type.value}
                  onChange={(e) => setReportType(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <type.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </div>
                  {reportType === type.value && (
                    <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Laporan</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tanggal Mulai *"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                required
                leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
              />
              <Input
                label="Tanggal Akhir *"
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                required
                leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
              />
            </div>

            {selectedType?.value === 'attendance' || selectedType?.value === 'late_summary' || selectedType?.value === 'participant_summary' ? (
              <Select
                label="Divisi"
                options={[{ value: '', label: 'Semua Divisi' }, ...divisions.map(d => ({ value: d, label: d }))]}
                value={filters.division}
                onChange={(e) => handleFilterChange('division', e.target.value)}
              />
            ) : null}

            {selectedType?.value === 'attendance' || selectedType?.value === 'journal' ? (
              <Select
                label="Pembimbing"
                options={[{ value: '', label: 'Semua Pembimbing' }, ...pembimbingList.map(p => ({ value: p.id, label: p.name }))]}
                value={filters.pembimbing_id}
                onChange={(e) => handleFilterChange('pembimbing_id', e.target.value)}
              />
            ) : null}

            {selectedType?.value === 'attendance' && (
              <Select
                label="Status Kehadiran"
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'Hadir', label: 'Hadir' },
                  { value: 'Terlambat', label: 'Terlambat' },
                  { value: 'Alpha', label: 'Alpha' },
                  { value: 'Izin', label: 'Izin' },
                  { value: 'Sakit', label: 'Sakit' },
                ]}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
            )}

            {selectedType?.value === 'journal' && (
              <Select
                label="Status Jurnal"
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Dikirim', label: 'Dikirim' },
                  { value: 'Revisi', label: 'Revisi' },
                  { value: 'Disetujui', label: 'Disetujui' },
                ]}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              />
            )}

            <Select
              label="Format Export"
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'excel', label: 'Excel (XLSX)' },
              ]}
              value={filters.format}
              onChange={(e) => handleFilterChange('format', e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview & Generate</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedType?.label}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedType?.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Periode</p>
                  <p className="font-medium text-gray-900">{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Format</p>
                  <p className="font-medium text-gray-900 capitalize">{filters.format}</p>
                </div>
                {filters.division && (
                  <div>
                    <p className="text-gray-500">Divisi</p>
                    <p className="font-medium text-gray-900">{filters.division}</p>
                  </div>
                )}
                {filters.pembimbing_id && (
                  <div>
                    <p className="text-gray-500">Pembimbing</p>
                    <p className="font-medium text-gray-900">
                      {pembimbingList.find(p => p.id == filters.pembimbing_id)?.name || filters.pembimbing_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant={filters.format === 'pdf' ? 'danger' : 'success'}
                onClick={generateReport}
                loading={generating}
                className="flex-1"
                size="lg"
              >
                {filters.format === 'pdf' ? (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Download PDF
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Download Excel
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Catatan:</strong> Laporan akan mencakup data sesuai filter yang dipilih. 
                  Untuk performa terbaik, batasi rentang tanggal maksimal 3 bulan per export.
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;