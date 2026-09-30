import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pesertaService } from '../../services/api';
import { formatDate, formatTime, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Calendar, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    type: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await pesertaService.getAttendanceHistory(params);
      setRecords(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat riwayat absensi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, filters.status, filters.date_from, filters.date_to, filters.type]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleExport = () => {
    const params = new URLSearchParams(filters);
    window.open(`/api/peserta/attendance/export?${params}`, '_blank');
  };

  const columns = [
    { key: 'date', label: 'Tanggal', sortable: true, render: (row) => formatDate(row.attendance_date) },
    { key: 'type', label: 'Jenis', sortable: true, render: (row) => (
      <Badge variant={row.type === 'masuk' ? 'primary' : 'success'}>
        {row.type === 'masuk' ? 'Masuk' : 'Pulang'}
      </Badge>
    )},
    { key: 'time', label: 'Waktu', sortable: true, render: (row) => formatTime(row.timestamp) },
    { key: 'status', label: 'Status', sortable: true, render: (row) => (
      <Badge variant="status">{row.status || '-'}</Badge>
    )},
    { key: 'method', label: 'Metode', render: (row) => (
      <Badge variant="info">{row.method || 'Manual'}</Badge>
    )},
    { key: 'location', label: 'Lokasi', render: (row) => row.location || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Absensi</h1>
          <p className="text-gray-600">Lihat dan filter riwayat kehadiran Anda</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <Select
              label="Jenis"
              options={[
                { value: '', label: 'Semua Jenis' },
                { value: 'masuk', label: 'Masuk' },
                { value: 'pulang', label: 'Pulang' },
              ]}
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
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
              <Button variant="outline" onClick={() => setFilters({ status: '', date_from: '', date_to: '', type: '' })}>
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        
        <Table
          columns={columns}
          data={records}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada riwayat absensi"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;