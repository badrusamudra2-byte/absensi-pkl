export const ROLES = {
  PESERTA: 'peserta',
  PEMBIMBING: 'pembimbing',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.PESERTA]: 'Peserta PKL',
  [ROLES.PEMBIMBING]: 'Pembimbing',
  [ROLES.ADMIN]: 'Admin',
};

export const ROLE_ROUTES = {
  [ROLES.PESERTA]: '/peserta',
  [ROLES.PEMBIMBING]: '/pembimbing',
  [ROLES.ADMIN]: '/admin',
};

export const JOURNAL_STATUS = {
  DRAFT: 'Draft',
  DIKIRIM: 'Dikirim',
  REVISI: 'Revisi',
  DISETUJUI: 'Disetujui',
};

export const ATTENDANCE_STATUS = {
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  ALPHA: 'Alpha',
  IZIN: 'Izin',
  SAKIT: 'Sakit',
};

export const ATTENDANCE_TYPE = {
  MASUK: 'masuk',
  PULANG: 'pulang',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  PESERTA: {
    BASE: '/peserta',
    DASHBOARD: '/peserta/dashboard',
    ATTENDANCE: '/peserta/attendance',
    ATTENDANCE_HISTORY: '/peserta/attendance/history',
    JOURNAL: '/peserta/journal',
    JOURNAL_DETAIL: (id) => `/peserta/journal/${id}`,
    FACE_ENROLL: '/peserta/face/enroll',
    FACE_VERIFY: '/peserta/face/verify',
  },
  PEMBIMBING: {
    BASE: '/pembimbing',
    DASHBOARD: '/pembimbing/dashboard',
    JOURNAL_REVIEW: '/pembimbing/journal/review',
    JOURNAL_DETAIL: (id) => `/pembimbing/journal/${id}`,
    ATTENDANCE_RECAP: '/pembimbing/attendance/recap',
    MENTEES: '/pembimbing/mentees',
  },
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    PESERTA: '/admin/peserta',
    PEMBIMBING: '/admin/pembimbing',
    SCHEDULE: '/admin/schedule',
    AUDIT_LOG: '/admin/audit-log',
    REPORT: '/admin/report',
  },
  PROFILE: {
    BASE: '/profile',
    UPDATE: '/profile/update',
  },
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLE: 'auth_role',
  REMEMBER_ME: 'remember_me',
};