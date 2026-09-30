import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pembimbingService } from '../../services/api';
import { formatDate, formatDateTime, getStatusColor, cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import { ArrowLeft, Clock, User, MessageSquare, AlertCircle, CheckCircle, FileText, Edit } from 'lucide-react';

const JournalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ action: 'approve', note: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchJournal = async () => {
    try {
      const response = await pembimbingService.getJournalDetail(id);
      setJournal(response.data);
      if (response.data.history) setHistory(response.data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail jurnal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!reviewForm.note.trim()) {
      setReviewError('Catatan review wajib diisi');
      return;
    }

    setReviewLoading(true);
    setReviewError(null);

    try {
      await pembimbingService.reviewJournal(id, {
        action: reviewForm.action,
        note: reviewForm.note,
      });
      setReviewModalOpen(false);
      fetchJournal();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gagal mereview jurnal');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pembimbing/journal/review')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mt-1" />
          </div>
        </div>
        <Card className="animate-pulse">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pembimbing/journal/review')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">{error || 'Jurnal tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const canReview = journal.status === 'Dikirim' || journal.status === 'Revisi';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pembimbing/journal/review')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{journal.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <Badge variant="status">{journal.status}</Badge>
              <span>{journal.user?.name} • {formatDate(journal.journal_date)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canReview && (
            <Button 
              variant="primary" 
              onClick={() => { setReviewForm({ action: 'approve', note: '' }); setReviewError(null); setReviewModalOpen(true); }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Uraian Kegiatan
              </h3>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{journal.description}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Hasil yang Dicapai
              </h3>
              <p className="whitespace-pre-wrap text-gray-700">{journal.result || '<em class="text-gray-400">Belum diisi</em>'}</p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Kendala/Hambatan
              </h3>
              <p className="whitespace-pre-wrap text-gray-700">{journal.obstacle || '<em class="text-gray-400">Belum diisi</em>'}</p>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              Rencana Berikutnya
            </h3>
            <p className="whitespace-pre-wrap text-gray-700">{journal.plan || '<em class="text-gray-400">Belum diisi</em>'}</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Jurnal</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1"><Badge variant="status">{journal.status}</Badge></dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Tanggal Kegiatan</dt>
                <dd className="mt-1 text-gray-900">{formatDate(journal.journal_date)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Peserta</dt>
                <dd className="mt-1 flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4 text-gray-400" />
                  {journal.user?.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">NIM/Email</dt>
                <dd className="mt-1 text-gray-900">{journal.user?.nim || journal.user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Dibuat Pada</dt>
                <dd className="mt-1 text-gray-900">{formatDateTime(journal.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Diupdate Pada</dt>
                <dd className="mt-1 text-gray-900">{formatDateTime(journal.updated_at)}</dd>
              </div>
              {journal.supervisor_note && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <dt className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Catatan Pembimbing
                  </dt>
                  <dd className="mt-1 text-yellow-800 whitespace-pre-wrap">{journal.supervisor_note}</dd>
                </div>
              )}
            </dl>
          </Card>

          {history.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histori Perubahan Status</h3>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', 
                      item.status === 'Disetujui' ? 'bg-green-100 text-green-600' :
                      item.status === 'Revisi' ? 'bg-yellow-100 text-yellow-600' :
                      item.status === 'Dikirim' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {item.status === 'Disetujui' && <CheckCircle className="w-5 h-5" />}
                      {item.status === 'Revisi' && <AlertCircle className="w-5 h-5" />}
                      {item.status === 'Dikirim' && <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.status}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(item.created_at)}</p>
                      {item.note && <p className="text-sm text-gray-700 mt-1">{item.note}</p>}
                      {item.reviewed_by && <p className="text-xs text-gray-500 mt-1">Oleh: {item.reviewed_by}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review: ${journal.title}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)} disabled={reviewLoading}>
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
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{journal.title}</p>
            <p className="text-sm text-gray-500 mt-1">{journal.user?.name} • {formatDate(journal.journal_date)}</p>
            <Badge variant="status" className="mt-2">{journal.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Uraian</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{journal.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hasil</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{journal.result || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kendala</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{journal.obstacle || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Rencana</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{journal.plan || '-'}</p>
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
      </Modal>
    </div>
  );
};

export default JournalDetailPage;