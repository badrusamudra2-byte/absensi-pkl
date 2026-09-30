import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pesertaService } from '../../services/api';
import { JOURNAL_STATUS } from '../../constants/roles';
import { cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import { ArrowLeft, Save, Send, Clock, FileText } from 'lucide-react';

const JournalFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    result: '',
    obstacle: '',
    plan: '',
    status: 'Draft',
    journal_date: new Date().toISOString().split('T')[0],
  });

  const fetchJournal = async () => {
    try {
      const response = await pesertaService.getJournalDetail(id);
      const journal = response.data;
      setFormData({
        title: journal.title || '',
        description: journal.description || '',
        result: journal.result || '',
        obstacle: journal.obstacle || '',
        plan: journal.plan || '',
        status: journal.status || 'Draft',
        journal_date: journal.journal_date ? journal.journal_date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat jurnal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) fetchJournal();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Judul wajib diisi';
    if (!formData.description.trim()) errors.description = 'Uraian kegiatan wajib diisi';
    if (!formData.journal_date) errors.journal_date = 'Tanggal jurnal wajib diisi';
    return errors;
  };

  const handleSubmit = async (action = 'save') => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError('Harap isi semua field yang wajib diisi');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = { ...formData, status: action === 'submit' ? 'Dikirim' : 'Draft' };
      
      if (isEdit) {
        await pesertaService.updateJournal(id, payload);
      } else {
        await pesertaService.createJournal(payload);
      }

      if (action === 'submit') {
        setSuccess('Jurnal berhasil dikirim ke pembimbing');
      } else {
        setSuccess('Jurnal berhasil disimpan sebagai draft');
      }

      setTimeout(() => navigate('/peserta/journal'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan jurnal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/peserta/journal')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit' : 'Buat'} Jurnal</h1>
          </div>
        </div>
        <Card className="animate-pulse">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/peserta/journal')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit' : 'Buat'} Jurnal Kegiatan</h1>
          <p className="text-gray-600">Isi jurnal harian PKL Anda</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} />}

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('save'); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Judul Kegiatan *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Pengembangan Fitur Login & Register"
              required
              leftIcon={<FileText className="w-5 h-5 text-gray-400" />}
            />
            <Input
              label="Tanggal Jurnal *"
              name="journal_date"
              type="date"
              value={formData.journal_date}
              onChange={handleChange}
              required
            />
          </div>

          <Textarea
            label="Uraian Kegiatan *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan kegiatan yang dilakukan hari ini secara detail..."
            rows={5}
            required
          />

          <Textarea
            label="Hasil yang Dicapai"
            name="result"
            value={formData.result}
            onChange={handleChange}
            placeholder="Sebutkan output/hasil konkret dari kegiatan hari ini (opsional)..."
            rows={4}
          />

          <Textarea
            label="Kendala/Hambatan"
            name="obstacle"
            value={formData.obstacle}
            onChange={handleChange}
            placeholder="Sebutkan kendala yang dihadapi dan solusinya (opsional)..."
            rows={4}
          />

          <Textarea
            label="Rencana Berikutnya"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            placeholder="Rencana kegiatan untuk hari/esok hari (opsional)..."
            rows={4}
          />

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <Badge variant="status">{formData.status}</Badge>
            </div>
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="secondary"
                onClick={() => navigate('/peserta/journal')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button 
                type="submit"
                variant="primary"
                loading={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Draft
              </Button>
              {(formData.status === 'Draft' || formData.status === 'Revisi') && (
                <Button 
                  type="button"
                  variant="success"
                  onClick={() => handleSubmit('submit')}
                  loading={saving}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim ke Pembimbing
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Tips Menulis Jurnal Baik</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Tulis uraian kegiatan secara kronologis dan detail</li>
              <li>Sebutkan teknologi/tools yang digunakan</li>
              <li>Catat hasil yang measurable/terukur</li>
              <li>Jujur tuliskan kendala dan solusinya</li>
              <li>Rencana harus spesifik dan actionable</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JournalFormPage;