import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Filter, Edit, Trash2, Shield, User, Download, UserPlus } from 'lucide-react';

const PembimbingManagementPage = () => {
  const [pembimbing, setPembimbing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', division: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPembimbing, setEditingPembimbing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', division: '', password: '', is_active: true });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchPembimbing = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      const response = await adminService.getPembimbing(params);
      setPembimbing(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data pembimbing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPembimbing();
  }, [pagination.page, filters.search, filters.status, filters.division]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openCreateModal = () => {
    setEditingPembimbing(null);
    setFormData({ name: '', email: '', division: '', password: '', is_active: true });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPembimbing(item);
    setFormData({ name: item.name, email: item.email, division: item.division || '', password: '', is_active: item.is_active });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPembimbing(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Format email tidak valid';
    if (!editingPembimbing && !formData.password) errors.password = 'Password wajib diisi untuk data baru';
    else if (formData.password && formData.password.length < 6) errors.password = 'Password minimal 6 karakter';
    if (!formData.division.trim()) errors.division = 'Divisi wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!formData.password) delete payload.password;
      if (editingPembimbing) {
        await adminService.updatePembimbing(editingPembimbing.id, payload);
      } else {
        await adminService.createPembimbing(payload);
      }
      closeModal();
      fetchPembimbing();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Gagal menyimpan data' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data pembimbing ini?')) return;
    try {
      await adminService.deletePembimbing(id);
      fetchPembimbing();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams(filters);
    window.open(`/api/admin/pembimbing/export?${params}`, '_blank');
  };

  const columns = [
    { key: 'name', label: 'Nama', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        <p className="text-sm text-gray-500">{row.email}</p>
      </div>
    )},
    { key: 'division', label: 'Divisi', render: (row) => <Badge variant="info">{row.division || '-'}</Badge> },
    { key: 'is_active', label: 'Status', sortable: true, render: (row) => (
      <Badge variant={row.is_active ? 'success' : 'danger'}>
        {row.is_active ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    )},
    { key: 'created_at', label: 'Dibuat', sortable: true, render: (row) => formatDate(row.created_at) },
    { 
      key: 'actions', 
      label: 'Aksi', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} className="p-2">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} className="p-2 text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Pembimbing</h1>
          <p className="text-gray-600">Kelola data pembimbing PKL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={openCreateModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Pembimbing
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Cari"
              placeholder="Nama, Email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Status"
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Tidak Aktif' },
              ]}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <Input
              label="Divisi"
              placeholder="Filter divisi..."
              value={filters.division}
              onChange={(e) => handleFilterChange('division', e.target.value)}
            />
            <Button variant="outline" onClick={() => setFilters({ search: '', status: '', division: '' })}>
              <Filter className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        
        <Table
          columns={columns}
          data={pembimbing}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data pembimbing"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPembimbing ? 'Edit Pembimbing' : 'Tambah Pembimbing Baru'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingPembimbing ? 'Update' : 'Simpan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap *"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              error={formErrors.name}
              required
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              error={formErrors.email}
              required
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />
          </div>

          <Input
            label="Divisi *"
            name="division"
            value={formData.division}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={formErrors.division}
            required
            leftIcon={<Shield className="w-5 h-5 text-gray-400" />}
          />

          <Input
            label={editingPembimbing ? 'Password (Kosongkan jika tidak diubah)' : 'Password *'}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={formErrors.password}
            required={!editingPembimbing}
            leftIcon={<Shield className="w-5 h-5 text-gray-400" />}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Aktif</label>
          </div>

          {formErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {formErrors.submit}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PembimbingManagementPage;