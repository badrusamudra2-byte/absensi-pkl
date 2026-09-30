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
import Textarea from '../../components/ui/Textarea';
import { Plus, Search, Filter, Edit, Trash2, User, Building2, Shield, Download, UserPlus } from 'lucide-react';

const PesertaManagementPage = () => {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    division: '',
    pembimbing_id: '',
  });
  const [pembimbingList, setPembimbingList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeserta, setEditingPeserta] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    division: '',
    pembimbing_id: '',
    password: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      const response = await adminService.getPeserta(params);
      setPeserta(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data peserta');
    } finally {
      setLoading(false);
    }
  };

  const fetchPembimbing = async () => {
    try {
      const response = await adminService.getPembimbing({ limit: 100 });
      setPembimbingList(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch pembimbing:', err);
    }
  };

  useEffect(() => {
    fetchPeserta();
    fetchPembimbing();
  }, [pagination.page, filters.search, filters.status, filters.division, filters.pembimbing_id]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openCreateModal = () => {
    setEditingPeserta(null);
    setFormData({ name: '', email: '', nim: '', division: '', pembimbing_id: '', password: '', is_active: true });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPeserta(item);
    setFormData({
      name: item.name,
      email: item.email,
      nim: item.nim || '',
      division: item.division || '',
      pembimbing_id: item.pembimbing_id || '',
      password: '',
      is_active: item.is_active,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPeserta(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Format email tidak valid';
    if (!editingPeserta && !formData.password) errors.password = 'Password wajib diisi untuk data baru';
    else if (formData.password && formData.password.length < 6) errors.password = 'Password minimal 6 karakter';
    if (!formData.nim.trim()) errors.nim = 'NIM/ID wajib diisi';
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

      if (editingPeserta) {
        await adminService.updatePeserta(editingPeserta.id, payload);
      } else {
        await adminService.createPeserta(payload);
      }
      closeModal();
      fetchPeserta();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Gagal menyimpan data' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data peserta ini?')) return;
    try {
      await adminService.deletePeserta(id);
      fetchPeserta();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams(filters);
    window.open(`/api/admin/peserta/export?${params}`, '_blank');
  };

  const columns = [
    { key: 'name', label: 'Nama', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.name}</p>
        <p className="text-sm text-gray-500">{row.email}</p>
      </div>
    )},
    { key: 'nim', label: 'NIM/ID', sortable: true },
    { key: 'division', label: 'Divisi', render: (row) => <Badge variant="info">{row.division || '-'}</Badge> },
    { key: 'pembimbing', label: 'Pembimbing', render: (row) => row.pembimbing?.name || '<span class="text-gray-400">Belum ditugaskan</span>' },
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Data Peserta</h1>
          <p className="text-gray-600">Kelola data peserta PKL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={openCreateModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Peserta
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              label="Cari"
              placeholder="Nama, Email, NIM..."
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
            <Select
              label="Pembimbing"
              options={[{ value: '', label: 'Semua Pembimbing' }, ...pembimbingList.map(p => ({ value: p.id, label: p.name }))]}
              value={filters.pembimbing_id}
              onChange={(e) => handleFilterChange('pembimbing_id', e.target.value)}
            />
            <div className="md:col-span-2 flex gap-2">
              <Input
                label="Divisi"
                placeholder="Filter divisi..."
                value={filters.division}
                onChange={(e) => handleFilterChange('division', e.target.value)}
              />
              <Button variant="outline" onClick={() => setFilters({ search: '', status: '', division: '', pembimbing_id: '' })}>
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
        
        <Table
          columns={columns}
          data={peserta}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data peserta"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPeserta ? 'Edit Peserta' : 'Tambah Peserta Baru'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={submitting}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              {editingPeserta ? 'Update' : 'Simpan'}
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
            <Input
              label="NIM/ID *"
              name="nim"
              value={formData.nim}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              error={formErrors.nim}
              required
              leftIcon={<Building2 className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Divisi *"
              name="division"
              value={formData.division}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              error={formErrors.division}
              required
              leftIcon={<Building2 className="w-5 h-5 text-gray-400" />}
            />
          </div>

          <Select
            label="Pembimbing"
            options={[{ value: '', label: 'Pilih Pembimbing (Opsional)' }, ...pembimbingList.map(p => ({ value: p.id, label: p.name }))]}
            value={formData.pembimbing_id}
            onChange={(e) => setFormData(prev => ({ ...prev, pembimbing_id: e.target.value }))}
          />

          <Input
            label={editingPeserta ? 'Password (Kosongkan jika tidak diubah)' : 'Password *'}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
            error={formErrors.password}
            required={!editingPeserta}
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

export default PesertaManagementPage;