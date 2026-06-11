# Budaya Sumsel — File Tambahan untuk starterkit-v2

## Cara Pasang

Copy semua folder di sini ke dalam project starterkit-v2 kamu.
File yang ada di sini adalah **file tambahan dan pengganti** — bukan full project.

```
starterkit-v2/          ← root project kamu
├── app/
├── config/
├── database/
├── resources/
└── routes/
```

Cukup salin isi folder ini ke dalam root project tersebut.
File yang sudah ada akan di-replace, file baru akan ditambahkan.

## Setelah Copy, Jalankan

```bash
# 1. Jalankan migration dan seeder
php artisan migrate --seed

# 2. Build frontend
npm install
npm run dev

# 3. Link storage untuk file upload
php artisan storage:link
```

## Daftar File

### Baru (tidak ada di starterkit asli)
- 10 migration files (database/migrations/2026_*)
- 3 seeder baru (WilayahSeeder, KategoriSeeder) + update DatabaseSeeder
- 9 model baru (Wilayah, Category, KontenBudaya, MediaFile, Tag, Comment, Rating, ModerationLog)
- 7 service baru
- 9 controller baru
- 5 form request baru
- 9 shared components React baru
- 1 public layout baru
- 18 halaman React baru (dashboard, konten, kontribusi, kategori, wilayah, tag, komentar, galeri)

### Diupdate (replace file yang sudah ada)
- app/Models/User.php — tambah relasi dan sistem level
- app/Services/DashboardService.php — tambah statistik platform
- app/Services/KontenBudayaService.php — update approve() dengan level counter
- app/Providers/AppServiceProvider.php — auto-assign role saat register
- config/starterkit.php — tambah 18 permissions baru
- routes/web.php — tambah public routes dan semua route baru
- resources/js/types/index.d.ts — tambah semua TypeScript types baru
- resources/js/components/app-sidebar.tsx — tambah nav items baru
- resources/js/pages/dashboard/admin.tsx — update dengan statistik platform
- resources/js/pages/dashboard/member.tsx — update dengan level badge
- resources/js/pages/welcome.tsx — rebuild penuh sebagai landing page publik
