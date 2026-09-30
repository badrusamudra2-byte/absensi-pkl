import axios from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS, ROLES } from '../constants/roles';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ROLE);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for demo without backend
const MOCK_DELAY = 300;
const mockData = {
  pesertaDashboard: {
    attendance_today: {
      check_in: '08:05:00',
      check_out: null,
      status: 'Hadir',
      method: 'QR Code',
    },
    last_journal: {
      title: 'Belajar React.js',
      status: 'Disetujui',
      created_at: new Date().toISOString(),
    },
    stats: {
      total_hadir: 20,
      total_terlambat: 2,
      total_jurnal_disetujui: 15,
      total_jurnal_pending: 3,
    },
    server_time: new Date().toISOString(),
  },
  pesertaAttendanceHistory: {
    data: [
      { id: 1, date: '2024-01-15', check_in: '08:00:00', check_out: '17:00:00', status: 'Hadir', method: 'QR Code' },
      { id: 2, date: '2024-01-14', check_in: '08:10:00', check_out: '17:05:00', status: 'Terlambat', method: 'Face' },
      { id: 3, date: '2024-01-13', check_in: '08:00:00', check_out: '17:00:00', status: 'Hadir', method: 'QR Code' },
      { id: 4, date: '2024-01-12', check_in: '08:05:00', check_out: '17:00:00', status: 'Hadir', method: 'Face' },
      { id: 5, date: '2024-01-11', check_in: '08:15:00', check_out: '17:00:00', status: 'Terlambat', method: 'QR Code' },
    ],
    meta: { total: 5, page: 1, limit: 15 },
  },
  pesertaJournals: {
    data: [
      { id: 1, title: 'Belajar React.js', description: 'Mempelajari component lifecycle', status: 'Disetujui', created_at: '2024-01-15T10:00:00Z' },
      { id: 2, title: 'API Integration', description: 'Menghubungkan frontend dengan backend', status: 'Dikirim', created_at: '2024-01-14T10:00:00Z' },
      { id: 3, title: 'Database Design', description: 'Mendesain schema database', status: 'Draft', created_at: '2024-01-13T10:00:00Z' },
    ],
    meta: { total: 3, page: 1, limit: 15 },
  },
  pembimbingDashboard: {
    pending_reviews: 5,
    total_mentees: 10,
    recent_journals: [
      { id: 1, title: 'Belajar React.js', student: 'Peserta Demo', status: 'Dikirim', created_at: '2024-01-15T10:00:00Z' },
      { id: 2, title: 'API Integration', student: 'Peserta Demo', status: 'Dikirim', created_at: '2024-01-14T10:00:00Z' },
    ],
    stats: {
      total_jurnal_disetujui: 8,
      total_jurnal_revisi: 2,
      total_jurnal_pending: 5,
    },
    server_time: new Date().toISOString(),
  },
  pembimbingJournals: {
    data: [
      { id: 1, title: 'Belajar React.js', student: 'Peserta Demo', status: 'Dikirim', created_at: '2024-01-15T10:00:00Z' },
      { id: 2, title: 'API Integration', student: 'Peserta Demo', status: 'Dikirim', created_at: '2024-01-14T10:00:00Z' },
      { id: 3, title: 'Database Design', student: 'Peserta Demo', status: 'Draft', created_at: '2024-01-13T10:00:00Z' },
    ],
    meta: { total: 3, page: 1, limit: 15 },
  },
  adminDashboard: {
    total_peserta: 25,
    total_pembimbing: 5,
    total_journals: 50,
    attendance_today: { hadir: 20, terlambat: 3, izin: 1, sakit: 1, alpha: 0 },
    server_time: new Date().toISOString(),
  },
  adminPeserta: {
    data: [
      { id: 1, name: 'Peserta Demo', email: 'peserta@demo.com', division: 'IT', pembimbing: 'Pembimbing Demo', status: 'Aktif' },
      { id: 2, name: 'Budi Santoso', email: 'budi@demo.com', division: 'IT', pembimbing: 'Pembimbing Demo', status: 'Aktif' },
      { id: 3, name: 'Siti Rahayu', email: 'siti@demo.com', division: 'Marketing', pembimbing: 'Pembimbing Demo', status: 'Aktif' },
    ],
    meta: { total: 3, page: 1, limit: 15 },
  },
  adminPembimbing: {
    data: [
      { id: 1, name: 'Pembimbing Demo', email: 'pembimbing@demo.com', division: 'IT', mentees_count: 3 },
      { id: 2, name: 'Ahmad Wijaya', email: 'ahmad@demo.com', division: 'Marketing', mentees_count: 2 },
    ],
    meta: { total: 2, page: 1, limit: 15 },
  },
};

const mockResponse = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, MOCK_DELAY);
  });
};

// Single backend check promise to avoid race conditions
const backendCheckPromise = (async () => {
  try {
    await api.get('/health', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
})();

const withMockFallback = async (apiCall, mockKey, defaultMock = null) => {
  const backendAvailable = await backendCheckPromise;
  
  if (backendAvailable) {
    try {
      return await apiCall();
    } catch {
      // Fall through to mock in demo mode
    }
  }
  
  const fallbackData = mockKey && mockData[mockKey] ? mockData[mockKey] : (defaultMock || { success: true, message: 'Operasi berhasil' });
  return mockResponse(fallbackData);
};

export const authService = {
  login: (credentials) => withMockFallback(() => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials), null, { success: true }),
  logout: () => withMockFallback(() => api.post(API_ENDPOINTS.AUTH.LOGOUT), null, { success: true }),
  me: () => withMockFallback(() => api.get(API_ENDPOINTS.AUTH.ME), 'pesertaDashboard'),
  changePassword: (data) => withMockFallback(() => api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data), null, { success: true }),
};

export const pesertaService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.DASHBOARD), 'pesertaDashboard'),
  checkIn: (data) => withMockFallback(() => api.post(API_ENDPOINTS.PESERTA.ATTENDANCE, { ...data, type: 'masuk' }), null, { success: true }),
  checkOut: (data) => withMockFallback(() => api.post(API_ENDPOINTS.PESERTA.ATTENDANCE, { ...data, type: 'pulang' }), null, { success: true }),
  getAttendanceHistory: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.ATTENDANCE_HISTORY, { params }), 'pesertaAttendanceHistory'),
  getJournals: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.JOURNAL, { params }), 'pesertaJournals'),
  getJournalDetail: (id) => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id)), null, { id, title: 'Belajar React.js', description: 'Mempelajari component lifecycle', result: 'Pemahaman React state & props', obstacle: 'Tidak ada', plan: 'Integrasi API', status: 'Disetujui', journal_date: '2024-01-15', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' }),
  createJournal: (data) => withMockFallback(() => api.post(API_ENDPOINTS.PESERTA.JOURNAL, data), null, { success: true }),
  updateJournal: (id, data) => withMockFallback(() => api.put(API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id), data), null, { success: true }),
  submitJournal: (id) => withMockFallback(() => api.post(`${API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id)}/submit`), null, { success: true }),
  enrollFace: (data) => withMockFallback(() => api.post(API_ENDPOINTS.PESERTA.FACE_ENROLL, data), null, { success: true }),
  verifyFace: (data) => withMockFallback(() => api.post(API_ENDPOINTS.PESERTA.FACE_VERIFY, data), null, { success: true }),
};

export const pembimbingService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.DASHBOARD), 'pembimbingDashboard'),
  getJournalsForReview: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.JOURNAL_REVIEW, { params }), 'pembimbingJournals'),
  getJournalDetail: (id) => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.JOURNAL_DETAIL(id)), null, { id, title: 'Belajar React.js', description: 'Mempelajari component lifecycle', result: 'Pemahaman React state & props', obstacle: 'Tidak ada', plan: 'Integrasi API', status: 'Dikirim', user: { name: 'Peserta Demo', email: 'peserta@demo.com' }, journal_date: '2024-01-15', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' }),
  reviewJournal: (id, data) => withMockFallback(() => api.post(`${API_ENDPOINTS.PEMBIMBING.JOURNAL_DETAIL(id)}/review`, data), null, { success: true }),
  getAttendanceRecap: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.ATTENDANCE_RECAP, { params }), 'pembimbingJournals'),
  getMentees: () => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.MENTEES), null, mockData.adminPeserta.data),
};

export const adminService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.DASHBOARD), 'adminDashboard'),
  getPeserta: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.PESERTA, { params }), 'adminPeserta'),
  createPeserta: (data) => withMockFallback(() => api.post(API_ENDPOINTS.ADMIN.PESERTA, data), null, { success: true }),
  updatePeserta: (id, data) => withMockFallback(() => api.put(`${API_ENDPOINTS.ADMIN.PESERTA}/${id}`, data), null, { success: true }),
  deletePeserta: (id) => withMockFallback(() => api.delete(`${API_ENDPOINTS.ADMIN.PESERTA}/${id}`), null, { success: true }),
  getPembimbing: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.PEMBIMBING, { params }), 'adminPembimbing'),
  createPembimbing: (data) => withMockFallback(() => api.post(API_ENDPOINTS.ADMIN.PEMBIMBING, data), null, { success: true }),
  updatePembimbing: (id, data) => withMockFallback(() => api.put(`${API_ENDPOINTS.ADMIN.PEMBIMBING}/${id}`, data), null, { success: true }),
  deletePembimbing: (id) => api.delete(`${API_ENDPOINTS.ADMIN.PEMBIMBING}/${id}`),
  getSchedule: () => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.SCHEDULE), null, { work_start_time: '08:00', work_end_time: '17:00', late_tolerance_minutes: 15, work_days: [1, 2, 3, 4, 5], timezone: 'Asia/Jakarta', break_start_time: '12:00', break_end_time: '13:00' }),
  updateSchedule: (data) => withMockFallback(() => api.put(API_ENDPOINTS.ADMIN.SCHEDULE, data), null, { success: true }),
  getAuditLog: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.AUDIT_LOG, { params }), null, { data: [], meta: { total: 0 } }),
  exportReport: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.REPORT, { params, responseType: 'blob' }), null, new Blob(['demo report content'])),
};

export const profileService = {
  getProfile: () => withMockFallback(() => api.get(API_ENDPOINTS.PROFILE.BASE), null, { name: 'Demo User', email: 'user@demo.com', phone: '08123456789', address: 'Jakarta' }),
  updateProfile: (data) => withMockFallback(() => api.put(API_ENDPOINTS.PROFILE.UPDATE, data), null, { success: true }),
};

export default api;