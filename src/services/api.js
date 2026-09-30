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

const withMockFallback = async (apiCall, mockKey) => {
  const backendAvailable = await backendCheckPromise;
  
  if (backendAvailable) {
    try {
      return await apiCall();
    } catch {
      // Fall through to mock
    }
  }
  
  return mockResponse(mockData[mockKey]);
};

export const authService = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  me: () => api.get(API_ENDPOINTS.AUTH.ME),
  changePassword: (data) => api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
};

export const pesertaService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.DASHBOARD), 'pesertaDashboard'),
  checkIn: (data) => api.post(API_ENDPOINTS.PESERTA.ATTENDANCE, { ...data, type: 'masuk' }),
  checkOut: (data) => api.post(API_ENDPOINTS.PESERTA.ATTENDANCE, { ...data, type: 'pulang' }),
  getAttendanceHistory: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.ATTENDANCE_HISTORY, { params }), 'pesertaAttendanceHistory'),
  getJournals: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PESERTA.JOURNAL, { params }), 'pesertaJournals'),
  getJournalDetail: (id) => api.get(API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id)),
  createJournal: (data) => api.post(API_ENDPOINTS.PESERTA.JOURNAL, data),
  updateJournal: (id, data) => api.put(API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id), data),
  submitJournal: (id) => api.post(`${API_ENDPOINTS.PESERTA.JOURNAL_DETAIL(id)}/submit`),
  enrollFace: (data) => api.post(API_ENDPOINTS.PESERTA.FACE_ENROLL, data),
  verifyFace: (data) => api.post(API_ENDPOINTS.PESERTA.FACE_VERIFY, data),
};

export const pembimbingService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.DASHBOARD), 'pembimbingDashboard'),
  getJournalsForReview: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.JOURNAL_REVIEW, { params }), 'pembimbingJournals'),
  getJournalDetail: (id) => api.get(API_ENDPOINTS.PEMBIMBING.JOURNAL_DETAIL(id)),
  reviewJournal: (id, data) => api.post(`${API_ENDPOINTS.PEMBIMBING.JOURNAL_DETAIL(id)}/review`, data),
  getAttendanceRecap: (params) => withMockFallback(() => api.get(API_ENDPOINTS.PEMBIMBING.ATTENDANCE_RECAP, { params }), 'pembimbingJournals'),
  getMentees: () => api.get(API_ENDPOINTS.PEMBIMBING.MENTEES),
};

export const adminService = {
  getDashboard: () => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.DASHBOARD), 'adminDashboard'),
  getPeserta: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.PESERTA, { params }), 'adminPeserta'),
  createPeserta: (data) => api.post(API_ENDPOINTS.ADMIN.PESERTA, data),
  updatePeserta: (id, data) => api.put(`${API_ENDPOINTS.ADMIN.PESERTA}/${id}`, data),
  deletePeserta: (id) => api.delete(`${API_ENDPOINTS.ADMIN.PESERTA}/${id}`),
  getPembimbing: (params) => withMockFallback(() => api.get(API_ENDPOINTS.ADMIN.PEMBIMBING, { params }), 'adminPembimbing'),
  createPembimbing: (data) => api.post(API_ENDPOINTS.ADMIN.PEMBIMBING, data),
  updatePembimbing: (id, data) => api.put(`${API_ENDPOINTS.ADMIN.PEMBIMBING}/${id}`, data),
  deletePembimbing: (id) => api.delete(`${API_ENDPOINTS.ADMIN.PEMBIMBING}/${id}`),
  getSchedule: () => api.get(API_ENDPOINTS.ADMIN.SCHEDULE),
  updateSchedule: (data) => api.put(API_ENDPOINTS.ADMIN.SCHEDULE, data),
  getAuditLog: (params) => api.get(API_ENDPOINTS.ADMIN.AUDIT_LOG, { params }),
  exportReport: (params) => api.get(API_ENDPOINTS.ADMIN.REPORT, { params, responseType: 'blob' }),
};

export const profileService = {
  getProfile: () => api.get(API_ENDPOINTS.PROFILE.BASE),
  updateProfile: (data) => api.put(API_ENDPOINTS.PROFILE.UPDATE, data),
};

export default api;