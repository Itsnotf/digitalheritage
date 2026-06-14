# CLAUDE CODE TODO — Budaya Sumsel
# Dibuat untuk dieksekusi oleh Claude Code di code editor

## KONTEKS PROJECT
- Laravel 12, Inertia.js, React 19, TypeScript, Tailwind CSS 4
- Pattern: Request → Controller → Service → Model
- Design system: Spacious/Editorial — cream `#EDE8DC`, Montserrat uppercase, flat (no rounded corners, no shadows)
- Semua konten dan label dalam Bahasa Indonesia

---

## URUTAN EKSEKUSI (WAJIB DIIKUTI)

1. SECTION A — Bug Fix (tidak ada dependency)
2. SECTION B — Install Dependency
3. SECTION C — Backend Changes
4. SECTION D — Types Update
5. SECTION E — Frontend Changes (urutan dalam section ini penting)

---

## SECTION A — BUG FIX TypeError (PRIORITAS PERTAMA)

### ROOT CAUSE
`KontenBudaya::getRouteKeyName()` mengembalikan `'slug'`, sehingga URL menjadi
`/kontribusi/nama-slug` dan `/konten/nama-slug`. Kedua controller menggunakan
`int $id` sehingga PHP 8 melempar `TypeError` ketika string slug dicoba cast ke
integer. Error ini juga terjadi setelah `store()` berhasil karena redirect ke
`show` menggunakan slug.

### A.1 — GANTI KontribusiController
FILE: `app/Http/Controllers/KontribusiController.php`
ACTION: GANTI SELURUH ISI FILE dengan kode berikut:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontribusiRequest\StoreKontribusiRequest;
use App\Http\Requests\KontribusiRequest\UpdateKontribusiRequest;
use App\Models\KontenBudaya;
use App\Models\MediaFile;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\MediaFileService;
use App\Services\WilayahService;
use Illuminate\Http\Request;

class KontribusiController extends Controller
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private MediaFileService    $mediaService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    public function index(Request $request)
    {
        return inertia('kontribusi/index', [
            'konten'  => $this->kontenService->getAllByUser(
                user:   $request->user(),
                search: $request->search,
                status: $request->status,
            ),
            'filters' => $request->only('search', 'status'),
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function create()
    {
        return inertia('kontribusi/create', [
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    public function store(StoreKontribusiRequest $request)
    {
        $konten = $this->kontenService->create($request->validated(), $request->user());

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($konten, $request->file('files'));
        }

        return redirect()
            ->route('kontribusi.show', $konten)
            ->with('success', 'Konten berhasil dikirim dan sedang menunggu review admin.');
    }

    // Route model binding — Laravel otomatis cari KontenBudaya berdasarkan slug
    public function show(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);

        $kontribusi->load([
            'user', 'category', 'wilayah', 'mediaFiles', 'tags', 'moderationLogs.user',
        ]);

        return inertia('kontribusi/show', [
            'konten' => $kontribusi,
        ]);
    }

    public function edit(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $kontribusi->load(['mediaFiles', 'tags', 'category', 'wilayah']);

        return inertia('kontribusi/edit', [
            'konten'    => $kontribusi,
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
        ]);
    }

    public function update(UpdateKontribusiRequest $request, KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa diedit.');

        $this->kontenService->update($kontribusi, $request->validated());

        if ($request->has('delete_media')) {
            foreach ($request->delete_media as $mediaId) {
                $media = MediaFile::where('id', $mediaId)
                                  ->where('konten_id', $kontribusi->id)
                                  ->first();
                if ($media) {
                    $this->mediaService->deleteFile($media);
                }
            }
        }

        if ($request->filled('primary_media')) {
            $media = MediaFile::where('id', $request->primary_media)
                              ->where('konten_id', $kontribusi->id)
                              ->firstOrFail();
            $this->mediaService->setPrimary($media);
        }

        if ($request->hasFile('files')) {
            $this->mediaService->storeFiles($kontribusi, $request->file('files'));
        }

        $message = $kontribusi->wasChanged('status')
            ? 'Konten berhasil diperbarui dan dikirim ulang untuk review admin.'
            : 'Konten berhasil diperbarui.';

        return redirect()
            ->route('kontribusi.show', $kontribusi)
            ->with('success', $message);
    }

    public function destroy(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status === 'published', 403, 'Konten yang sudah tayang tidak bisa dihapus langsung. Hubungi admin.');

        $this->kontenService->delete($kontribusi);

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten berhasil dihapus.');
    }

    public function respondRevise(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondRevise($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.edit', $kontribusi)
            ->with('success', 'Silakan perbaiki konten sesuai catatan admin, lalu simpan.');
    }

    public function respondDecline(KontenBudaya $kontribusi)
    {
        $this->authorizeOwner($kontribusi);
        abort_if($kontribusi->status !== 'rejected', 403);

        $this->kontenService->respondDecline($kontribusi, request()->user());

        return redirect()
            ->route('kontribusi.index')
            ->with('success', 'Konten ditandai sebagai ditolak final.');
    }

    // (int) cast di kedua sisi mencegah strict mismatch antar environment database
    private function authorizeOwner(KontenBudaya $konten): void
    {
        abort_if((int) $konten->user_id !== (int) auth()->id(), 403);
    }
}
```

---

### A.2 — GANTI KontenBudayaController
FILE: `app/Http/Controllers/KontenBudayaController.php`
ACTION: GANTI SELURUH ISI FILE dengan kode berikut:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\KontenRequest\RejectKontenRequest;
use App\Models\KontenBudaya;
use App\Services\KategoriService;
use App\Services\KontenBudayaService;
use App\Services\WilayahService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class KontenBudayaController extends Controller implements HasMiddleware
{
    public function __construct(
        private KontenBudayaService $kontenService,
        private KategoriService     $kategoriService,
        private WilayahService      $wilayahService,
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:konten index',    only: ['index', 'show']),
            new Middleware('permission:konten validate', only: ['approve', 'reject']),
            new Middleware('permission:konten delete',   only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('konten/index', [
            'konten'    => $this->kontenService->getAllForAdmin(
                search:     $request->search,
                status:     $request->status,
                categoryId: $request->category_id,
                wilayahId:  $request->wilayah_id,
            ),
            'kategoris' => $this->kategoriService->getForSelect(),
            'wilayahs'  => $this->wilayahService->getForSelect(),
            'filters'   => $request->only('search', 'status', 'category_id', 'wilayah_id'),
            'flash'     => ['success' => session('success')],
        ]);
    }

    // Route model binding — Laravel otomatis cari KontenBudaya berdasarkan slug
    public function show(KontenBudaya $konten)
    {
        $konten->load([
            'user', 'category', 'wilayah', 'mediaFiles', 'tags', 'moderationLogs.user',
        ]);

        return inertia('konten/show', [
            'konten' => $konten,
        ]);
    }

    public function approve(Request $request, KontenBudaya $konten)
    {
        abort_if($konten->status === 'published', 422, 'Konten sudah tayang.');

        $this->kontenService->approve($konten, $request->user());

        return redirect()
            ->route('konten.show', $konten)
            ->with('success', 'Konten berhasil disetujui dan sekarang tayang.');
    }

    public function reject(RejectKontenRequest $request, KontenBudaya $konten)
    {
        abort_if($konten->status === 'published', 422, 'Konten sudah tayang, tidak bisa ditolak langsung.');

        $this->kontenService->reject($konten, $request->user(), $request->catatan);

        return redirect()
            ->route('konten.show', $konten)
            ->with('success', 'Konten ditolak. Pengguna akan menerima notifikasi beserta alasan penolakan.');
    }

    public function destroy(KontenBudaya $konten)
    {
        $this->kontenService->delete($konten);

        return redirect()
            ->route('konten.index')
            ->with('success', 'Konten berhasil dihapus.');
    }
}
```

---

### A.3 — UPDATE KontenBudaya Model
FILE: `app/Models/KontenBudaya.php`
ACTION: TAMBAHKAN entri berikut ke dalam array `$casts` yang sudah ada:

CARI blok ini:
```php
protected $casts = [
    'approved_at' => 'datetime',
    'view_count'  => 'integer',
];
```

GANTI dengan:
```php
protected $casts = [
    'approved_at' => 'datetime',
    'view_count'  => 'integer',
    // Cast foreign keys ke integer — mencegah strict !== mismatch di berbagai database driver
    'user_id'     => 'integer',
    'category_id' => 'integer',
    'wilayah_id'  => 'integer',
    'approved_by' => 'integer',
];
```

TAMBAHKAN juga relasi berikut di dalam class, setelah method `primaryMedia()`:
```php
/** Video pertama yang diupload — dipakai untuk preview durasi di galeri list */
public function firstVideo(): HasOne
{
    return $this->hasOne(MediaFile::class, 'konten_id')
                ->where('tipe', 'video')
                ->orderBy('urutan');
}
```

Pastikan `HasOne` sudah ada di import `use` statement. Jika belum ada, tambahkan:
```php
use Illuminate\Database\Eloquent\Relations\HasOne;
```

---

## SECTION B — INSTALL DEPENDENCY

### B.1 — Install Plyr.js
ACTION: Jalankan perintah berikut di terminal root project:

```bash
npm install plyr
```

Plyr v3.x sudah include TypeScript definitions, tidak perlu `@types/plyr` terpisah.

---

## SECTION C — BACKEND CHANGES

### C.1 — UPDATE PublicController — method galeri()
FILE: `app/Http/Controllers/PublicController.php`
ACTION: GANTI SELURUH method `galeri()` dengan kode berikut.
JANGAN ubah method lain (`welcome`, `show`, `tentang`, `kontak`).

CARI:
```php
public function galeri(Request $request)
{
    return inertia('galeri/index', [
```

GANTI seluruh method `galeri()` (dari baris `public function galeri` sampai penutup `}` method-nya) dengan:

```php
public function galeri(Request $request)
{
    // 'video' adalah mode default — hanya tampilkan konten yang punya file video
    // 'galeri' — tampilkan semua tipe konten
    $mode = $request->mode === 'galeri' ? 'galeri' : 'video';

    $query = KontenBudaya::published()
        ->with(['category', 'wilayah', 'primaryMedia', 'user'])
        ->withCount('ratings')
        ->withAvg('ratings', 'skor')
        ->when($request->search,      fn($q) => $q->where('judul', 'like', "%{$request->search}%"))
        ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
        ->when($request->wilayah_id,  fn($q) => $q->where('wilayah_id', $request->wilayah_id))
        ->when($request->sort === 'popular', fn($q) => $q->orderByDesc('view_count'))
        ->when($request->sort !== 'popular', fn($q) => $q->latest('approved_at'));

    // Mode video: filter hanya konten yang memiliki minimal 1 file video
    // dan load firstVideo untuk menampilkan durasi di card
    if ($mode === 'video') {
        $query
            ->whereHas('mediaFiles', fn($q) => $q->where('tipe', 'video'))
            ->with(['firstVideo']);
    }

    return inertia('galeri/index', [
        'konten'     => $query->paginate(12)->withQueryString(),
        'kategoris'  => Category::whereNull('parent_id')->orderBy('urutan')->get(),
        'wilayahs'   => Wilayah::orderBy('nama')->get(),
        'filters'    => $request->only('search', 'category_id', 'wilayah_id', 'sort', 'mode'),
        'galeriPage' => SitePage::forKey('galeri')->only(['hero_image_url', 'content']),
    ]);
}
```

---

## SECTION D — TYPES UPDATE

### D.1 — Tambah firstVideo ke KontenBudaya type
FILE: `resources/js/types/index.d.ts`
ACTION: CARI interface `KontenBudaya` dan TAMBAHKAN field `first_video` di baris terakhir sebelum penutup `}`:

CARI baris ini di dalam `interface KontenBudaya`:
```typescript
    tags?: Tag[]; moderation_logs?: ModerationLog[]; comments_count?: number;
```

GANTI dengan:
```typescript
    tags?: Tag[]; moderation_logs?: ModerationLog[]; comments_count?: number;
    first_video?: MediaFile; // loaded only in galeri list ketika mode=video
    ratings_count?: number;
    ratings_avg_skor?: number | null;
```

---

## SECTION E — FRONTEND CHANGES

### E.1 — UPDATE PublicLayout — tambah darkMode prop
FILE: `resources/js/layouts/public-layout.tsx`

#### E.1.1 — Tambah `darkMode` ke interface Props
CARI:
```typescript
interface Props {
    children: ReactNode;
    title?: string;
}
```
GANTI dengan:
```typescript
interface Props {
    children: ReactNode;
    title?: string;
    darkMode?: boolean;
}
```

#### E.1.2 — Tambah darkMode ke function signature
CARI:
```typescript
export default function PublicLayout({ children, title }: Props) {
```
GANTI dengan:
```typescript
export default function PublicLayout({ children, title, darkMode = false }: Props) {
```

#### E.1.3 — Update outer wrapper div
CARI:
```typescript
<div style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: '#EDE8DC' }} className="min-h-screen text-gray-900">
```
GANTI dengan:
```typescript
<div
    style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: darkMode ? '#111827' : '#EDE8DC' }}
    className={`min-h-screen ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
>
```

#### E.1.4 — Update header (nav) background
CARI:
```typescript
<header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-900/10 bg-[#EDE8DC]/95 backdrop-blur-sm">
```
GANTI dengan:
```typescript
<header className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm ${
    darkMode
        ? 'border-white/8 bg-gray-900/95'
        : 'border-gray-900/10 bg-[#EDE8DC]/95'
}`}>
```

#### E.1.5 — Update logo color di header
CARI:
```typescript
<Link href="/" style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-sm font-black uppercase tracking-widest text-gray-900">
    Budaya<span className="ml-1.5 text-gray-500">Sumsel</span>
</Link>
```
GANTI dengan:
```typescript
<Link href="/" style={{ fontFamily: "'Montserrat', sans-serif" }} className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
    Budaya<span className={`ml-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sumsel</span>
</Link>
```

#### E.1.6 — Update nav links desktop
CARI array nav links desktop yang berisi `['Beranda', '/'], ['Galeri', '/galeri']...`:
```typescript
className="text-xs font-semibold uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors">
```
GANTI dengan:
```typescript
className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
    darkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
}`}>
```

#### E.1.7 — Update mobile nav background
CARI:
```typescript
<div className="border-t border-gray-900/10 bg-[#EDE8DC] px-8 py-6 md:hidden">
```
GANTI dengan:
```typescript
<div className={`border-t px-8 py-6 md:hidden ${darkMode ? 'border-white/8 bg-gray-900' : 'border-gray-900/10 bg-[#EDE8DC]'}`}>
```

---

### E.2 — UPDATE KontenCard — tambah video mode variant
FILE: `resources/js/components/konten-card.tsx`
ACTION: GANTI SELURUH ISI FILE dengan kode berikut:

```tsx
import { KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';
import { Eye, MapPin, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    konten: KontenBudaya & { ratings_avg_skor?: number | null; ratings_count?: number };
    className?: string;
    variant?: 'default' | 'large' | 'video';
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function KontenCard({ konten, className, variant = 'default' }: Props) {
    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const duration = konten.first_video?.durasi_detik;
    const isVideoCard = variant === 'video';

    // Untuk mode video: link ke show page dengan ?autoplay=1
    const href = isVideoCard
        ? `/galeri/${konten.slug}?autoplay=1`
        : `/galeri/${konten.slug}`;

    if (isVideoCard) {
        return (
            <Link href={href} className={cn('group block', className)}>
                {/* Thumbnail — dark card style */}
                <div className="relative overflow-hidden bg-gray-800 aspect-video">
                    {konten.cover_url ? (
                        <img
                            src={konten.cover_url}
                            alt={konten.judul}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-gray-700">
                            <Play className="size-8 text-gray-500" />
                        </div>
                    )}

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex size-10 items-center justify-center border-2 border-white/80 bg-black/50 transition-transform duration-200 group-hover:scale-110">
                            <Play className="size-4 fill-white text-white ml-0.5" />
                        </div>
                    </div>

                    {/* Category badge — top left */}
                    {konten.category && (
                        <span style={FONT}
                            className="absolute top-0 left-0 bg-gray-900 text-[#EDE8DC] text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                            {konten.category.nama}
                        </span>
                    )}

                    {/* Duration badge — bottom right */}
                    {duration != null && (
                        <span style={FONT}
                            className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5">
                            {formatDuration(duration)}
                        </span>
                    )}
                </div>

                {/* Card content — dark */}
                <div className="pt-3 pb-1">
                    <h3 style={FONT}
                        className="text-[12px] font-black uppercase leading-tight text-gray-100 group-hover:text-gray-400 transition-colors line-clamp-2 tracking-tight">
                        {konten.judul}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wider" style={FONT}>
                            {konten.wilayah && konten.wilayah.nama}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] text-gray-600" style={FONT}>
                            {avg && (
                                <span className="flex items-center gap-0.5 text-amber-500">
                                    <Star className="size-2.5 fill-current" />
                                    {avg}
                                </span>
                            )}
                            <span className="flex items-center gap-0.5">
                                <Eye className="size-2.5" />
                                {konten.view_count.toLocaleString('id-ID')}
                            </span>
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    // Default & large variant — editorial/galeri mode (tidak ada perubahan dari sebelumnya)
    return (
        <Link href={href} className={cn('group block', className)}>
            {/* Thumbnail */}
            <div className={cn(
                'overflow-hidden bg-gray-200 relative',
                variant === 'large' ? 'aspect-[4/3]' : 'aspect-video'
            )}>
                {konten.cover_url ? (
                    <img
                        src={konten.cover_url}
                        alt={konten.judul}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-[#D9D4C8]">
                        <span className="text-4xl">🏛️</span>
                    </div>
                )}

                {/* Category badge */}
                {konten.category && (
                    <span style={FONT}
                        className="absolute top-0 left-0 bg-gray-900 text-[#EDE8DC] text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                        {konten.category.nama}
                    </span>
                )}

                {/* Play overlay jika konten punya video (di galeri mode) */}
                {konten.first_video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <div className="flex size-9 items-center justify-center border border-white/60 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="size-3.5 fill-white text-white ml-0.5" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pt-4">
                <h3 style={FONT}
                    className={cn(
                        'font-bold uppercase leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2',
                        variant === 'large' ? 'text-xl' : 'text-base'
                    )}>
                    {konten.judul}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        {konten.wilayah && <><MapPin className="size-3" />{konten.wilayah.nama}</>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        {avg && (
                            <span className="flex items-center gap-0.5">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                <span>{avg}</span>
                            </span>
                        )}
                        <span className="flex items-center gap-0.5">
                            <Eye className="size-3" />{konten.view_count.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                <p className="mt-1.5 text-xs text-gray-400 uppercase tracking-wider" style={FONT}>
                    {konten.user?.name}
                </p>
            </div>
        </Link>
    );
}
```

---

### E.3 — UPDATE Galeri Index — dual mode (Video & Galeri)
FILE: `resources/js/pages/galeri/index.tsx`
ACTION: GANTI SELURUH ISI FILE dengan kode berikut:

```tsx
import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { router } from '@inertiajs/react';
import { LayoutGrid, Play, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: {
        search?: string;
        category_id?: string;
        wilayah_id?: string;
        sort?: string;
        mode?: 'video' | 'galeri';
    };
    galeriPage?: { hero_image_url: string | null; content: Record<string, any> | null };
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function GaleriIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    // Default mode adalah 'video'
    const currentMode = filters.mode === 'galeri' ? 'galeri' : 'video';
    const isVideoMode = currentMode === 'video';

    const apply = (key: string, value: string) =>
        router.get('/galeri', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const toggleMode = () => {
        const newMode = isVideoMode ? 'galeri' : 'video';
        // preserveState: false karena background berubah total
        router.get('/galeri', { ...filters, mode: newMode, page: undefined }, { preserveState: false });
    };

    const clear = () => router.get('/galeri', { mode: currentMode }, { preserveState: true, replace: true });

    const hasFilter = !!(filters.search || filters.category_id || filters.wilayah_id);
    const selectedKat = kategoris.find((k) => String(k.id) === filters.category_id);
    const selectedWil = wilayahs.find((w) => String(w.id) === filters.wilayah_id);

    // ── Dark mode styles ──────────────────────────────────────────────
    const headerBg    = isVideoMode ? 'bg-gray-900'    : 'bg-[#EDE8DC]';
    const contentBg   = isVideoMode ? 'bg-gray-900'    : 'bg-[#EDE8DC]';
    const titleColor  = isVideoMode ? 'text-gray-100'  : 'text-gray-900';
    const accentLine  = isVideoMode ? 'border-gray-600' : 'border-gray-900';
    const borderColor = isVideoMode ? 'border-white/8' : 'border-gray-900/10';
    const mutedColor  = isVideoMode ? 'text-gray-500'  : 'text-gray-500';
    const inputBorder = isVideoMode ? 'border-white/15 text-gray-200 placeholder:text-gray-600' : 'border-gray-900/20 text-gray-700 placeholder:text-gray-400';
    const selectStyle = isVideoMode ? 'border-white/15 text-gray-300' : 'border-gray-900/20 text-gray-700';

    return (
        <PublicLayout title="Galeri Budaya" darkMode={isVideoMode}>

            {/* ── Page Header ── */}
            <section className={`${headerBg} border-b ${borderColor} pt-16 pb-0`}>
                <div className="mx-auto max-w-screen-xl px-8 pb-0">
                    <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 py-16 border-b ${borderColor}`}>

                        {/* Left: Title */}
                        <div>
                            <h1 style={FONT}
                                className={`text-5xl font-black uppercase leading-none tracking-tight md:text-6xl lg:text-7xl ${titleColor}`}>
                                Galeri Budaya
                            </h1>
                            <div className={`mt-5 w-12 border-b-2 ${accentLine}`} />
                        </div>

                        {/* Right: desc + mode toggle */}
                        <div className="flex flex-col justify-between gap-6">
                            <p className={`text-sm leading-relaxed ${mutedColor}`}>
                                {konten.total.toLocaleString('id-ID')} {isVideoMode ? 'konten video' : 'konten budaya'} dari seluruh wilayah Sumatera Selatan.
                            </p>

                            {/* Mode Toggle */}
                            <div className="flex items-center gap-0 self-start">
                                <button
                                    onClick={toggleMode}
                                    style={FONT}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        isVideoMode
                                            ? 'bg-[#EDE8DC] text-gray-900 border-[#EDE8DC]'
                                            : 'bg-transparent text-gray-400 border-gray-900/20 hover:border-gray-900 hover:text-gray-900'
                                    }`}
                                >
                                    <Play className="size-3 fill-current" />
                                    Mode Video
                                </button>
                                <button
                                    onClick={toggleMode}
                                    style={FONT}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        !isVideoMode
                                            ? 'bg-gray-900 text-[#EDE8DC] border-gray-900'
                                            : 'bg-transparent border-white/15 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                    }`}
                                >
                                    <LayoutGrid className="size-3" />
                                    Mode Galeri
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Filter bar ── */}
                    <div className="py-4 flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <form onSubmit={(e) => { e.preventDefault(); apply('search', search); }} className="flex">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari konten..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`h-9 border bg-transparent pl-9 pr-4 text-xs outline-none focus:border-gray-500 transition-colors w-52 ${inputBorder}`}
                                    style={FONT}
                                />
                            </div>
                            <button type="submit" style={FONT}
                                className="h-9 bg-gray-900 text-[#EDE8DC] px-4 text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-colors">
                                Cari
                            </button>
                        </form>

                        {/* Category */}
                        <select
                            value={filters.category_id ?? ''}
                            onChange={(e) => apply('category_id', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="">Semua Kategori</option>
                            {kategoris.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>

                        {/* Wilayah */}
                        <select
                            value={filters.wilayah_id ?? ''}
                            onChange={(e) => apply('wilayah_id', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="">Semua Wilayah</option>
                            {wilayahs.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
                        </select>

                        {/* Sort */}
                        <select
                            value={filters.sort ?? 'latest'}
                            onChange={(e) => apply('sort', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="latest">Terbaru</option>
                            <option value="popular">Terpopuler</option>
                        </select>

                        {/* Active filters */}
                        {hasFilter && (
                            <div className="ml-auto flex items-center gap-3">
                                {selectedKat && (
                                    <span style={FONT}
                                        className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {selectedKat.nama}
                                        <button onClick={() => apply('category_id', '')}><X className="size-3" /></button>
                                    </span>
                                )}
                                {selectedWil && (
                                    <span style={FONT}
                                        className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {selectedWil.nama}
                                        <button onClick={() => apply('wilayah_id', '')}><X className="size-3" /></button>
                                    </span>
                                )}
                                <button onClick={clear} style={FONT}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${mutedColor} hover:text-gray-900`}>
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Card Grid ── */}
            <section className={`${contentBg} min-h-[400px]`}>
                <div className="mx-auto max-w-screen-xl px-8 py-12">
                    {konten.data.length === 0 ? (
                        <div className="py-32 text-center">
                            <p style={FONT} className={`text-xs font-black uppercase tracking-widest ${mutedColor}`}>
                                Tidak ada konten yang sesuai
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${isVideoMode ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} ${isVideoMode ? 'gap-y-8' : 'gap-10'}`}>
                                {konten.data.map((item) => (
                                    <KontenCard
                                        key={item.id}
                                        konten={item}
                                        variant={isVideoMode ? 'video' : 'default'}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className={`mt-14 border-t pt-8 flex justify-center ${borderColor}`}>
                                <PaginationLinks links={konten.links} />
                            </div>

                            <p style={FONT}
                                className={`mt-4 text-center text-[10px] font-semibold uppercase tracking-widest ${mutedColor}`}>
                                Halaman {konten.current_page} dari {konten.last_page} · {konten.total} konten
                            </p>
                        </>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
```

---

### E.4 — UPDATE Galeri Show — Plyr.js video player + playlist switcher
FILE: `resources/js/pages/galeri/show.tsx`
ACTION: TAMBAHKAN kode berikut di BAGIAN ATAS file, setelah baris import yang sudah ada:

```tsx
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useEffect, useRef, useState } from 'react';
```

CATATAN: File ini sudah import `useState` di baris terakhir import-nya. Ganti baris
`import { useState } from 'react';` yang sudah ada dengan 3 baris import di atas.

---

Selanjutnya, GANTI seluruh blok hero/cover di bagian atas JSX.
CARI blok ini (cover image hero):
```tsx
{/* ── Cover image — full-bleed ── */}
{konten.cover_url && (
    <section className="h-[55vh] overflow-hidden bg-gray-800">
        <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
    </section>
)}
```

GANTI dengan komponen VideoSection BERIKUT.
Tambahkan SEBELUM `export default function GaleriShow`:

```tsx
// ──────────────────────────────────────────────────────────────
// VideoSection — Player Plyr.js dengan playlist multi-video
// ──────────────────────────────────────────────────────────────
const FONT = { fontFamily: "'Montserrat', sans-serif" };

interface VideoSectionProps {
    videoFiles: NonNullable<typeof konten.media_files>;
    autoplay?: boolean;
}
```

CATATAN: `konten` belum tersedia di sini sebagai type. Ganti definisi di atas dengan:

```tsx
import { Comment, KontenBudaya, MediaFile } from '@/types';

// Tambahkan komponen VideoSection sebelum GaleriShow component:

const FONT_DISPLAY = { fontFamily: "'Montserrat', sans-serif" };

function VideoSection({ videoFiles, autoplay = false }: { videoFiles: MediaFile[]; autoplay?: boolean }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);
    const activeVideo = videoFiles[activeIndex];

    useEffect(() => {
        if (!videoRef.current || !activeVideo) return;

        // Destroy player lama sebelum buat yang baru
        playerRef.current?.destroy();

        playerRef.current = new Plyr(videoRef.current, {
            controls: [
                'play-large', 'play', 'progress', 'current-time',
                'duration', 'mute', 'volume', 'captions', 'fullscreen',
            ],
            resetOnEnd: false,
        });

        if (autoplay) {
            // Delay sedikit agar Plyr selesai init
            const t = setTimeout(() => playerRef.current?.play(), 400);
            return () => {
                clearTimeout(t);
                playerRef.current?.destroy();
            };
        }

        return () => {
            playerRef.current?.destroy();
        };
    }, [activeIndex]); // re-init saat video aktif berubah

    if (!activeVideo) return null;

    const formatDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <section className="bg-gray-950">
            {/* Plyr video player */}
            <div className="mx-auto max-w-screen-xl">
                {/* key={activeVideo.id} memaksa React unmount-remount video element saat video berubah */}
                <video
                    key={activeVideo.id}
                    ref={videoRef}
                    className="plyr-video w-full"
                    controls
                    playsInline
                >
                    <source src={`/storage/${activeVideo.url}`} type="video/mp4" />
                    Browser kamu tidak mendukung pemutaran video.
                </video>
            </div>

            {/* Playlist tab switcher — tampil hanya jika ada lebih dari 1 video */}
            {videoFiles.length > 1 && (
                <div className="mx-auto max-w-screen-xl px-8 py-4 border-t border-white/6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span style={FONT_DISPLAY} className="text-[9px] font-black uppercase tracking-widest text-gray-500 mr-3 shrink-0">
                            Video ({videoFiles.length})
                        </span>
                        {videoFiles.map((v, i) => (
                            <button
                                key={v.id}
                                onClick={() => setActiveIndex(i)}
                                style={FONT_DISPLAY}
                                className={`shrink-0 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
                                    i === activeIndex
                                        ? 'bg-[#EDE8DC] text-gray-900'
                                        : 'border border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-200'
                                }`}
                            >
                                Video {i + 1}
                                {v.durasi_detik && (
                                    <span className="ml-2 text-[9px] opacity-60">{formatDur(v.durasi_detik)}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
```

---

Sekarang GANTI bagian JSX di dalam `GaleriShow` component.
CARI blok hero lama:
```tsx
{/* ── Cover image — full-bleed ── */}
{konten.cover_url && (
    <section className="h-[55vh] overflow-hidden bg-gray-800">
        <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
    </section>
)}
```

GANTI dengan:
```tsx
{/* ── Hero: Video Player atau Cover Image ── */}
{(() => {
    const videoFiles = (konten.media_files ?? []).filter(f => f.tipe === 'video');
    // Cek ?autoplay=1 dari URL
    const autoplay = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('autoplay') === '1';

    if (videoFiles.length > 0) {
        return <VideoSection videoFiles={videoFiles} autoplay={autoplay} />;
    }

    // Fallback: cover image jika tidak ada video
    if (konten.cover_url) {
        return (
            <section className="h-[55vh] overflow-hidden bg-gray-800">
                <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
            </section>
        );
    }

    return null;
})()}
```

---

TERAKHIR, tambahkan override CSS Plyr agar warna progressbar sesuai brand.
TAMBAHKAN di `resources/css/app.css` (atau file CSS utama project):

```css
/* ── Plyr brand override — Budaya Sumsel ── */
:root {
    --plyr-color-main: #111827;
    --plyr-video-background: #0f172a;
}
```

---

## VERIFIKASI AKHIR

Setelah semua perubahan selesai, jalankan:

```bash
npm run build
```

Pastikan tidak ada TypeScript error. Jika ada error pada import `Plyr`, pastikan
`npm install plyr` sudah dijalankan (SECTION B.1).

Test checklist:
- [ ] `/kontribusi/{slug}` — tidak lagi TypeError, halaman terbuka
- [ ] `/konten/{slug}/approve` — admin bisa approve tanpa error
- [ ] `/galeri` — default tampil Mode Video (dark, grid 4 kolom)
- [ ] Toggle "Mode Galeri" — background cream, grid 3 kolom, semua tipe konten
- [ ] Klik konten video dari Mode Video → `/galeri/{slug}?autoplay=1` → video langsung play
- [ ] Halaman show dengan 1 video — player tampil, tidak ada tab
- [ ] Halaman show dengan 2+ video — tab switcher muncul, klik tab ganti video
- [ ] Halaman show tanpa video — cover image tampil seperti sebelumnya
- [ ] Filter (search, kategori, wilayah, sort) masih berfungsi di kedua mode
- [ ] URL mode persist ketika pindah halaman (karena pakai URL param)
