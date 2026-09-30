import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pembimbingService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import { Calendar, Filter, Download, Users, Building2 } from 'lucide-react';

const AttendanceRecapPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    mentee_id: '',
    status: '',
  });
  const [mentees, setMentees] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = { 
        page: pagination.page, 
        limit: pagination.limit, 
        period: activeTab,
        ...filters 
      };
      const response = await pembimbingService.getAttendanceRecap(params);
      setRecords(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
      if (response.data.summary) setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat rekap kehadiran');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await pembimbingService.getMentees();
      setMentees(response.data);
    } catch (err) {
      console.error('Failed to fetch mentees:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchMentees();
  }, [activeTab, pagination.page, filters.date_from, filters.date_to, filters.mentee_id, filters.status]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleExport = () => {
    const params = new URLSearchParams({ ...filters, period: activeTab });
    window.open(`/api/pembimbing/attendance/export?${params}`, '_blank');
  };

  const dailyColumns = [
    { key: 'date', label: 'Tanggal', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'user', label: 'Peserta', render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.user?.name}</p>
        <p className="text-sm text-gray-500">{row.user?.nim}</p>
      </div>
    )},
    { key: 'check_in', label: 'Masuk', render: (row) => row.check_in ? formatDate(row.check_in, { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'check_out', label: 'Pulang', render: (row) => row.check_out ? formatDate(row.check_out, { hour: '2-digit', minute: '2-digit' }) : '-' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant="status">{row.status}</Badge> },
    { key: 'method', label: 'Metode', render: (row) => <Badge variant="info">{row.method || '-'}</Badge> },
  ];

  const monthlyColumns = [
    { key: 'user', label: 'Peserta', render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.user?.name}</p>
        <p className="text-sm text-gray-500">{row.user?.nim}</p>
      </div>
    )},
    { key: 'total_hadir', label: 'Hadir', render: (row) => <Badge variant="success">{row.total_hadir || 0}</Badge> },
    { key: 'total_terlambat', label: 'Terlambat', render: (row) => <Badge variant="warning">{row.total_terlambat || 0}</Badge> },
    { key: 'total_alpha', label: 'Alpha', render: (row) => <Badge variant="danger">{row.total_alpha || 0}</Badge> },
    { key: 'total_izin', label: 'Izin', render: (row) => <Badge variant="info">{row.total_izin || 0}</Badge> },
    { key: 'total_sakit', label: 'Sakit', render: (row) => <Badge variant="default">{row.total_sakit || 0}</Badge> },
    { key: 'persentase_kehadiran', label: 'Kehadiran %', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.persentase_kehadiran || 0}%` }} />
        </div>
        <span className="text-sm font-medium text-gray-900 w-12 text-right">{row.persentase_kehadiran || 0}%</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Kehadiran Bimbingan</h1>
          <p className="text-gray-600">Monitor kehadiran peserta bimbingan Anda</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab}
        tabs={[
          { value: 'daily', label: 'Harian', icon: Calendar },
          { value: 'monthly', label: 'Bulanan', icon: Building2 },
        ]}
      />

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Total Peserta</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_mentees || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Rata-rata Hadir</p>
            <p className="text-2xl font-bold text-green-600">{summary.avg_hadir || 0}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Total Terlambat</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.total_terlambat || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Total Alpha</p>
            <p className="text-2xl font-bold text-red-600">{summary.total_alpha || 0}</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              label="Peserta"
              options={[{ value: '', label: 'Semua Peserta' }, ...mentees.map(m => ({ value: m.id, label: m.name }))]}
              value={filters.mentee_id}
              onChange={(e) => handleFilterChange('mentee_id', e.target.value)}
            />
            <Select
              label="Status"
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
            <Input
              label="Dari Tanggal"
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
            <Input
              label="Sampai Tanggal"
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              leftIcon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ date_from: '', date_to: '', mentee_id: '', status: '' })}>
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        
        <Table
          columns={activeTab === 'daily' ? dailyColumns : monthlyColumns}
          data={records}
          keyField="id"
          loading={loading}
          emptyMessage={activeTab === 'daily' ? 'Tidak ada data kehadiran harian' : 'Tidak ada data rekap bulanan'}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
};

export default AttendanceRecapPage;