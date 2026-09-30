export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  const defaultOptions = { day: '2-digit', month: 'short', year: 'numeric', ...options };
  return new Date(date).toLocaleDateString('id-ID', defaultOptions);
};

export const formatTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const getStatusColor = (status) => {
  const colors = {
    Hadir: 'bg-green-100 text-green-800',
    Terlambat: 'bg-yellow-100 text-yellow-800',
    Alpha: 'bg-red-100 text-red-800',
    Izin: 'bg-blue-100 text-blue-800',
    Sakit: 'bg-purple-100 text-purple-800',
    Draft: 'bg-gray-100 text-gray-800',
    Dikirim: 'bg-blue-100 text-blue-800',
    Revisi: 'bg-orange-100 text-orange-800',
    Disetujui: 'bg-green-100 text-green-800',
    Aktif: 'bg-green-100 text-green-800',
    'Tidak Aktif': 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getAttendanceTypeLabel = (type) => {
  const labels = { masuk: 'Masuk', pulang: 'Pulang' };
  return labels[type] || type;
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};