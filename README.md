# Astakira Media - Sistem Absensi PKL & Jurnal Kegiatan

Frontend React.js untuk aplikasi Web Panel Sistem Absensi PKL & Jurnal Kegiatan Astakira Media.

## 🚀 Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios dengan Interceptor JWT
- **QR Scanner**: html5-qrcode
- **Face Verification**: face-api.js / HTML5 Camera API
- **State Management**: React Context API

## 📁 Struktur Project

```
src/
├── components/
│   ├── ui/              # Komponen UI dasar (Button, Input, Card, Modal, dll)
│   ├── layout/          # Layout components (Navbar, Sidebar, RootLayout)
│   ├── forms/           # Form components
│   ├── attendance/      # Attendance components (QRScanner, FaceVerification)
│   ├── journal/         # Journal components
│   └── common/          # Common components (Dropdown, etc)
├── pages/
│   ├── auth/            # Login page
│   ├── peserta/         # Peserta PKL pages
│   ├── pembimbing/      # Pembimbing pages
│   ├── admin/           # Admin pages
│   └── profile/         # Profile page
├── context/
│   └── AuthContext.jsx  # Authentication context
├── services/
│   └── api.js           # Axios instance & API services
├── hooks/
│   └── useApi.js        # Custom hooks
├── routes/
│   ├── router.jsx       # Router configuration
│   └── RouteGuard.jsx   # Role-based route guards
├── utils/
│   └── helpers.js       # Utility functions
├── constants/
│   └── roles.js         # Constants (roles, statuses, endpoints)
└── assets/              # Static assets
```

## 🎭 Role & Routing

| Role | Route Prefix | Dashboard |
|------|-------------|-----------|
| Peserta PKL | `/peserta` | `/peserta` |
| Pembimbing | `/pembimbing` | `/pembimbing` |
| Admin | `/admin` | `/admin` |

## 🔐 Authentication

- JWT Token disimpan di `localStorage`
- Axios Interceptor otomatis menambahkan Bearer Token
- Route Guard melindungi halaman berdasarkan role
- Auto-redirect ke login jika token expired

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 🌐 Environment Variables

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎨 UI Components

### Core Components
- `Button` - Variasi: primary, secondary, success, danger, warning, outline, ghost
- `Input` / `Select` / `Textarea` - Form inputs dengan validasi
- `Card` - Container dengan header/footer opsional
- `Modal` - Dialog dengan animasi, keyboard support
- `Table` - Data table dengan sorting, pagination, loading state
- `Badge` - Status badges dengan warna semantik
- `Alert` - Notifikasi dismissible
- `Tabs` - Tab navigation
- `Avatar` - User avatar dengan fallback initials

### Layout Components
- `Navbar` - Top navigation dengan role switcher (dev)
- `Sidebar` - Collapsible sidebar navigation
- `RootLayout` / `PesertaLayout` / `PembimbingLayout` / `AdminLayout`

### Attendance Components
- `QRScanner` - Camera-based QR code scanner
- `FaceVerification` - Face enrollment & verification dengan liveness detection

## 📋 Pages Overview

### Peserta PKL (`/peserta`)
- **Dashboard** - Ringkasan absensi hari ini, jurnal terakhir, aksi cepat
- **Absensi** - Pilih metode (QR Code / Face Verification)
- **Riwayat Absensi** - Tabel dengan filter status & tanggal
- **Jurnal Kegiatan** - CRUD jurnal dengan status Draft/Dikirim/Revisi/Disetujui
- **Detail Jurnal** - Detail + histori status + catatan revisi

### Pembimbing (`/pembimbing`)
- **Dashboard** - Summary anak bimbingan, rekap kehadiran, jurnal pending
- **Review Jurnal** - Daftar jurnal masuk, modal review (Setujui/Revisi)
- **Rekap Kehadiran** - Harian/Bulanan dengan export

### Admin (`/admin`)
- **Dashboard** - Statistik total, keterlambatan, aktivitas terbaru
- **Manajemen Peserta** - CRUD + assign pembimbing
- **Manajemen Pembimbing** - CRUD data pembimbing
- **Pengaturan Jadwal** - Jam kerja, toleransi, hari kerja
- **Audit Log** - Log aktivitas dengan detail changes
- **Laporan & Export** - Filter periode, PDF/Excel

## 🔌 API Integration (Sequelize Convention)

Struktur response API disesuaikan dengan Sequelize:

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } // Model instance atau array
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": { field: "message" } // Validation errors
}

// Paginated Response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

Relasi data (contoh):
```javascript
// Peserta dengan Pembimbing
{
  "id": 1,
  "name": "John Doe",
  "pembimbing_id": 2,
  "pembimbing": {
    "id": 2,
    "name": "Jane Smith",
    "division": "IT"
  }
}
```

## 🎯 Business Rules Implementation

### Absensi
- ✅ Mencegah absensi ganda (disable tombol jika sudah absen masuk hari ini)
- ✅ Absen pulang hanya aktif jika absen masuk sudah tercatat
- ✅ Validasi jam kerja & toleransi keterlambatan

### Jurnal
- ✅ Status enum: Draft, Dikirim, Revisi, Disetujui
- ✅ Hanya Draft/Revisi yang bisa diedit
- ✅ Histori perubahan status lengkap

### Role Access
- ✅ Route Guard per role
- ✅ UI menyesuaikan hak akses

## 🛠️ Development Notes

### Role Switcher (Development Only)
Di Navbar terdapat dropdown untuk switch role tanpa logout - hanya untuk testing UI.

### Mock Camera Implementation
`QRScanner` dan `FaceVerification` menggunakan simulasi untuk development. Integrasi nyata:
- QR: `html5-qrcode` library
- Face: `face-api.js` dengan model TensorFlow.js

### Customization
- Colors: Edit `tailwind.config.js`
- API Endpoints: Edit `src/constants/roles.js`
- Business Logic: Modify service calls in pages

## 📝 TODO untuk Production

- [ ] Integrate real `html5-qrcode` & `face-api.js`
- [ ] Add unit tests (Vitest + React Testing Library)
- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Implement refresh token flow
- [ ] Add PWA support
- [ ] Optimize bundle size
- [ ] Add error boundary
- [ ] Implement real-time notifications (WebSocket)
- [ ] Add internationalization (i18n)

## 📄 License

Internal use - Astakira Media