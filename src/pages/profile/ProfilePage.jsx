import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/api';
import { cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Avatar from '../../components/ui/Avatar';
import { User, Lock, Save, CheckCircle, Camera, Edit } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const profile = response.data;
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = 'Nama wajib diisi';
    if (!profileForm.email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) errors.email = 'Format email tidak valid';
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.current_password) errors.current_password = 'Password saat ini wajib diisi';
    if (!passwordForm.new_password) errors.new_password = 'Password baru wajib diisi';
    else if (passwordForm.new_password.length < 6) errors.new_password = 'Password minimal 6 karakter';
    if (passwordForm.new_password !== passwordForm.confirm_password) errors.confirm_password = 'Konfirmasi password tidak cocok';
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSaving(true);
    setError(null);
    try {
      await profileService.updateProfile(profileForm);
      updateUser(profileForm);
      setSuccess('Profil berhasil diperbarui');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setSaving(true);
    setError(null);
    try {
      const result = await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      if (result.success) {
        setSuccess('Password berhasil diubah');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil & Pengaturan</h1>
          <p className="text-gray-600">Kelola informasi akun Anda</p>
        </div>
        <Card className="animate-pulse">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil & Pengaturan</h1>
        <p className="text-gray-600">Kelola informasi akun dan keamanan Anda</p>
      </div>

      {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} dismissible onClose={() => setSuccess(null)} />}

      <Card>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <Avatar name={user?.name} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {user?.role === 'peserta' ? 'Peserta PKL' : user?.role === 'pembimbing' ? 'Pembimbing' : 'Admin'}
            </span>
          </div>
        </div>
      </Card>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={cn(
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Keamanan
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
        <Card>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={profileForm.name || user?.name} size="xl" />
              <div>
                <p className="font-medium text-gray-900">Foto Profil</p>
                <p className="text-sm text-gray-500">Fitur upload foto akan segera hadir</p>
                <Button variant="outline" type="button" size="sm" className="mt-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Ganti Foto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap *"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />
              <Input
                label="Email *"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <Input
              label="Nomor Telepon"
              name="phone"
              type="tel"
              value={profileForm.phone}
              onChange={handleProfileChange}
              placeholder="08xx-xxxx-xxxx"
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />

            <Input
              label="Alamat"
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
              placeholder="Alamat lengkap..."
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Pastikan password baru Anda kuat dan unik. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.</span>
              </p>
            </div>

            <Input
              label="Password Saat Ini *"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              required
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />

            <Input
              label="Password Baru *"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              required
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />

            <Input
              label="Konfirmasi Password Baru *"
              name="confirm_password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              required
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <Button type="submit" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Ubah Password
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;