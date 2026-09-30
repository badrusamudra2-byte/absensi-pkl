import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pembimbingService } from '../../services/api';
import { formatDate, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import { Search, Filter, Calendar, Eye, CheckCircle, AlertCircle, Download } from 'lucide-react';

const JournalReviewPage = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
    mentee_id: '',
  });
  const [mentees, setMentees] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ action: 'approve', note: '' });
  const [reviewError, setReviewError] = useState(null);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      const response = await pembimbingService.getJournalsForReview(params);
      setJournals(response.data.data || response.data);
      setPagination(prev => ({ ...prev, total: response.data.total || response.data.meta?.total || 0 }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat jurnal');
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
    fetchJournals();
    fetchMentees();
  }, [pagination.page, filters.status, filters.date_from, filters.date_to, filters.mentee_id]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openReviewModal = (journal) => {
    setSelectedJournal(journal);
    setReviewForm({ action: 'approve', note: '' });
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedJournal(null);
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.note.trim()) {
      setReviewError('Catatan review wajib diisi');
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      await pembimbingService.reviewJournal(selectedJournal.id, {
        action: reviewForm.action,
        note: reviewForm.note,
      });
      closeReviewModal();
      fetchJournals();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gagal mereview jurnal');
    } finally {
      setReviewLoading(false);
    }
  };

  const columns = [
    { key: 'title', label: 'Judul', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-gray-900 line-clamp-1">{row.title}</p>
        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{row.description}</p>
      </div>
    )},
    { key: 'user', label: 'Peserta', render: (row) => (
      <div>
        <p className="font-medium text-gray-900">{row.user?.name}</p>
        <p className="text-sm text-gray-500">{row.user?.nim || row.user?.email}</p>
      </div>
    )},
    { key: 'journal_date', label: 'Tanggal', sortable: true, render: (row) => formatDate(row.journal_date) },
    { key: 'status', label: 'Status', sortable: true, render: (row) => (
      <Badge variant="status">{row.status}</Badge>
    )},
    { 
      key: 'actions', 
      label: 'Aksi', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/pembimbing/journal/${row.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Lihat Detail">
            <Eye className="w-4 h-4" />
          </Link>
          {(row.status === 'Dikirim' || row.status === 'Revisi') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openReviewModal(row)}
              className="px-3 py-1.5 text-xs"
            >
              Review
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Jurnal</h1>
          <p className="text-gray-600">Kelola jurnal masuk dari peserta bimbingan</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              label="Cari Judul"
              placeholder="Cari jurnal..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
            <Select
              label="Status"
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'Dikirim', label: 'Dikirim' },
                { value: 'Revisi', label: 'Revisi' },
                { value: 'Disetujui', label: 'Disetujui' },
              ]}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <Select
              label="Peserta"
              options={[{ value: '', label: 'Semua Peserta' }, ...mentees.map(m => ({ value: m.id, label: m.name }))]}
              value={filters.mentee_id}
              onChange={(e) => handleFilterChange('mentee_id', e.target.value)}
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
          emptyMessage="Tidak ada jurnal untuk direview"
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>

      <Modal
        isOpen={reviewModalOpen}
        onClose={closeReviewModal}
        title={`Review Jurnal: ${selectedJournal?.title}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeReviewModal} disabled={reviewLoading}>
              Batal
            </Button>
            <Button 
              variant={reviewForm.action === 'approve' ? 'success' : 'warning'} 
              onClick={handleReviewSubmit} 
              loading={reviewLoading}
            >
              {reviewForm.action === 'approve' ? 'Setujui' : 'Minta Revisi'}
            </Button>
          </>
        }
      >
        {selectedJournal && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedJournal.title}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedJournal.user?.name} • {formatDate(selectedJournal.journal_date)}</p>
              <Badge variant="status" className="mt-2">{selectedJournal.status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Uraian</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJournal.description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hasil</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJournal.result || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kendala</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJournal.obstacle || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rencana</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJournal.plan || '-'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="action"
                  value="approve"
                  checked={reviewForm.action === 'approve'}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, action: e.target.value }))}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <div className="flex-1 p-3 border rounded-lg bg-green-50 border-green-200">
                  <p className="font-medium text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Setujui Jurnal
                  </p>
                  <p className="text-sm text-green-700 mt-1">Jurnal akan berstatus Disetujui</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="action"
                  value="revision"
                  checked={reviewForm.action === 'revision'}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, action: e.target.value }))}
                  className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                />
                <div className="flex-1 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <p className="font-medium text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Minta Revisi
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">Jurnal akan dikembalikan ke peserta untuk diperbaiki</p>
                </div>
              </label>
            </div>

            <Textarea
              label="Catatan Review *"
              name="note"
              value={reviewForm.note}
              onChange={(e) => setReviewForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Tulis catatan/feedback untuk peserta (wajib diisi)..."
              rows={4}
              error={reviewError}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JournalReviewPage;