import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pesertaService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Plus, Search, Filter, Calendar, Eye, Edit, Trash2, FileText } from 'lucide-react';

const JournalListPage = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await pesertaService.getJournals(params);
      setJournals(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat jurnal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [pagination.page, filters.status, filters.date_from, filters.date_to]);

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jurnal ini?')) return;
    try {
      await pesertaService.deleteJournal(id);
      fetchJournals();
    } catch (err) {
      alert('Gagal menghapus jurnal');
    }
  };

  const columns = [
    { key: 'title', label: 'Judul', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-gray-900 line-clamp-1">{row.title}</p>
        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{row.description}</p>
      </div>
    )},
    { key: 'status', label: 'Status', sortable: true, render: (row) => (
      <Badge variant="status">{row.status}</Badge>
    )},
    { key: 'created_at', label: 'Dibuat', sortable: true, render: (row) => formatDate(row.created_at) },
    { key: 'updated_at', label: 'Diupdate', sortable: true, render: (row) => formatDate(row.updated_at) },
    { 
      key: 'actions', 
      label: 'Aksi', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/peserta/journal/${row.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Detail">
            <Eye className="w-4 h-4" />
          </Link>
          {row.status === 'Draft' || row.status === 'Revisi' ? (
            <Link to={`/peserta/journal/edit/${row.id}`} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit">
              <Edit className="w-4 h-4" />
            </Link>
          ) : null}
          {row.status === 'Draft' && (
            <button onClick={() => handleDelete(row.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jurnal Kegiatan</h1>
          <p className="text-gray-600">Kelola jurnal harian PKL Anda</p>
        </div>
        <Link to="/peserta/journal/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Jurnal Baru
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Cari Judul"
              placeholder="Cari jurnal..."
              value={filters.search}
              onChange={handleSearch}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Status"
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
          </div>
        </div>
        
        <Table
          columns={columns}
          data={journals}
          keyField="id"
          loading={loading}
          emptyMessage="Belum ada jurnal. Buat jurnal pertama Anda!"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </div>
  );
};

export default JournalListPage;