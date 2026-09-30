import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { formatDate, formatDateTime, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Search, Calendar, Download, Eye, Filter as FilterIcon } from 'lucide-react';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    user_id: '',
    date_from: '',
    date_to: '',
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      const response = await adminService.getAuditLog(params);
      setLogs(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters.search, filters.action, filters.user_id, filters.date_from, filters.date_to]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleExport = () => {
    const params = new URLSearchParams(filters);
    window.open(`/api/admin/audit-log/export?${params}`, '_blank');
  };

  const getActionBadge = (action) => {
    const variants = {
      'login': 'primary',
      'logout': 'default',
      'create': 'success',
      'update': 'warning',
      'delete': 'danger',
      'attendance': 'info',
      'journal_submit': 'purple',
      'journal_review': 'blue',
    };
    return variants[action] || 'default';
  };

  const columns = [
    { key: 'created_at', label: 'Waktu', sortable: true, render: (row) => formatDateTime(row.created_at) },
    { key: 'user', label: 'Pengguna', render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.user?.name || 'Sistem'}</p>
        <p className="text-sm text-gray-500">{row.user?.email || '-'}</p>
      </div>
    )},
    { key: 'action', label: 'Aksi', sortable: true, render: (row) => (
      <Badge variant={getActionBadge(row.action)} className="capitalize">{row.action.replace('_', ' ')}</Badge>
    )},
    { key: 'resource', label: 'Resource', render: (row) => row.resource || '-' },
    { key: 'resource_id', label: 'ID Resource', render: (row) => row.resource_id || '-' },
    { key: 'description', label: 'Deskripsi', render: (row) => (
      <p className="text-sm text-gray-700 max-w-xs truncate" title={row.description}>{row.description}</p>
    )},
    { key: 'ip_address', label: 'IP Address', render: (row) => row.ip_address || '-' },
    { 
      key: 'actions', 
      label: 'Detail', 
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => openDetailModal(row)} className="p-2">
          <Eye className="w-4 h-4" />
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600">Riwayat aktivitas penting sistem</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              label="Cari"
              placeholder="Deskripsi, IP, Resource..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Aksi"
              options={[
                { value: '', label: 'Semua Aksi' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
                { value: 'attendance', label: 'Absensi' },
                { value: 'journal_submit', label: 'Submit Jurnal' },
                { value: 'journal_review', label: 'Review Jurnal' },
              ]}
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
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
            <div className="md:col-span-2 flex gap-2">
              <Button variant="outline" onClick={() => setFilters({ search: '', action: '', user_id: '', date_from: '', date_to: '' })}>
                <FilterIcon className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        
        <Table
          columns={columns}
          data={logs}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data audit log"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedLog(null); }}
        title="Detail Audit Log"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">ID Log</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{selectedLog.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Waktu</dt>
                <dd className="mt-1 text-gray-900">{formatDateTime(selectedLog.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Pengguna</dt>
                <dd className="mt-1 text-gray-900">{selectedLog.user?.name || 'Sistem'} ({selectedLog.user?.email || '-'})</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Aksi</dt>
                <dd className="mt-1">
                  <Badge variant={getActionBadge(selectedLog.action)} className="capitalize">
                    {selectedLog.action.replace('_', ' ')}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Resource</dt>
                <dd className="mt-1 text-gray-900">{selectedLog.resource || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Resource ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{selectedLog.resource_id || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Deskripsi</dt>
                <dd className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedLog.description || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">IP Address</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{selectedLog.ip_address || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">User Agent</dt>
                <dd className="mt-1 font-mono text-xs text-gray-700 max-h-24 overflow-auto whitespace-pre-wrap">
                  {selectedLog.user_agent || '-'}
                </dd>
              </div>
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <dt className="text-sm text-gray-500">Perubahan Data</dt>
                  <dd className="mt-1">
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-48">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogPage;