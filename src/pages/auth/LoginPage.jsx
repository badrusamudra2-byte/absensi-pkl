import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { Eye, EyeOff, Building2, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.password) newErrors.password = 'Password wajib diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    const result = await login(formData, rememberMe);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Astakira Media</h1>
          <p className="text-gray-600 mt-2">Sistem Absensi PKL & Jurnal Kegiatan</p>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Masuk ke Akun</h2>

          {error && (
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Masukkan email"
              autoComplete="email"
              required
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">Lupa password?</a>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={submitting || authLoading}
            >
              Masuk
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => setFormData({ email: 'peserta@demo.com', password: 'password123' })}
                className="p-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                Peserta
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'pembimbing@demo.com', password: 'password123' })}
                className="p-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                Pembimbing
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@demo.com', password: 'password123' })}
                className="p-2 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                Admin
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          &copy; 2024 Astakira Media. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;