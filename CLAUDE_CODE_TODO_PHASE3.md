# CLAUDE CODE TODO — PHASE 3
# Budaya Sumsel — Fix Bug Rating/Komentar + Redesign Immersive Galeri Show + Texture Publik
# ════════════════════════════════════════════════════════════════════

## RINGKASAN TUJUAN

Phase 3 berisi 3 pekerjaan yang SUDAH didiskusikan dan SUDAH final desainnya
dengan owner project (jangan didesain ulang, jangan ditanyakan ulang ke user):

1. **Fix bug TypeError** di endpoint rating (`/galeri/{konten}/rating`) dan komentar
   (`/galeri/{konten}/komentar`) — root cause: controller pakai `int $id` + manual
   `findOrFail()`, padahal frontend kirim slug (string), bukan integer.
2. **Texture background** di seluruh halaman publik — dot halus, terracotta tint,
   sangat subtle (opacity rendah), via 1 CSS class reusable.
3. **Redesign total `galeri/show.tsx`** jadi immersive full-screen viewer:
   media (gambar/video/audio/PDF) tampil penuh begitu halaman dibuka, navigasi
   tipe media + konten (Deskripsi/Rating/Komentar) lewat tombol bulat di
   kiri-bawah, panel konten muncul sebagai bottom-sheet TANPA scroll halaman.

## ATURAN WAJIB — BACA SEBELUM MULAI

- **IKUTI KODE YANG DIBERIKAN PERSIS.** Semua code block di TODO ini adalah versi
  FINAL yang sudah didiskusikan, ditulis, dan DIVERIFIKASI (`tsc --noEmit` +
  `eslint` sudah PASS, 0 error, 0 warning). JANGAN menulis ulang dengan pendekatan
  sendiri, JANGAN "memperbaiki" style/pattern yang menurutmu kurang optimal,
  JANGAN menambah fitur yang tidak diminta (contoh: JANGAN tambah dark mode,
  JANGAN tambah lightbox terpisah, JANGAN ubah ke desktop side-panel, JANGAN
  tambah animasi/transisi di luar yang sudah ada).
- **HANYA SENTUH FILE YANG DISEBUTKAN.** Jangan menyentuh file lain di luar yang
  ada di daftar SECTION A–E, termasuk jangan "merapikan" file lain yang kebetulan
  related (misal `konten-card.tsx`, `kontribusi/show.tsx`, `konten/show.tsx`) —
  file-file itu SENGAJA tidak disentuh di Phase 3 ini.
- **JANGAN install dependency baru.** Semua kode di TODO ini hanya pakai
  package yang sudah ada di `package.json` (lucide-react, @inertiajs/react, react).
  Tidak butuh shadcn component baru, tidak butuh library baru.
- **JANGAN ubah `routes/web.php` atau migration apa pun.** Tidak ada perubahan
  routing maupun skema database di Phase 3 ini.
- **Untuk file yang berlabel "ACTION: GANTI TOTAL"** — timpa SELURUH isi file
  dengan code block yang diberikan, jangan digabung manual dengan isi lama.
- **Untuk file yang berlabel "ACTION: TAMBAHKAN"** atau **"ACTION: EDIT TARGETED"**
  — HANYA tambahkan/ubah persis bagian yang ditunjuk, jangan sentuh bagian lain
  di file itu.
- Kalau ada konflik antara TODO ini dan kondisi file saat ini di repo (misal file
  sudah berubah dari yang diasumsikan), STOP dan laporkan ke user — jangan
  menebak/improvisasi sendiri gimana menyelesaikannya.

## URUTAN EKSEKUSI (IKUTI BERURUTAN)

- [x] SECTION A — Fix bug TypeError rating & komentar (backend) ✅ SELESAI
- [x] SECTION B — Texture background + fullBleed layout infra ✅ SELESAI
- [x] SECTION C — MediaPreview: tambah mode fullscreen ✅ SELESAI
- [x] SECTION D — Fix tipe data KontenBudaya (field `comments` yang belum ada) ✅ SELESAI
- [x] SECTION E — Redesign total galeri/show.tsx (immersive viewer) ✅ SELESAI
- [x] SECTION F — Verifikasi ✅ SELESAI (F.1 tsc PASS, F.2 eslint PASS, F.3 build PASS)

# ════════════════════════════════════════════════════════════════════
# SECTION A — FIX BUG TYPEERROR RATING & KOMENTAR
# ════════════════════════════════════════════════════════════════════

## KONTEKS BUG (jangan didiagnosis ulang, ini sudah pasti root cause-nya)

Error yang dilaporkan user:
```
App\Http\Controllers\RatingController::store(): Argument #2 ($id) must be of
type int, string given
App\Http\Controllers\PublicKomentarController::store(): Argument #2 ($id) must
be of type int, string given
```

Root cause: `KontenBudaya::getRouteKeyName()` return `'slug'`. Frontend
(`galeri/show.tsx`) POST ke `/galeri/${konten.slug}/rating` dan
`/galeri/${konten.slug}/komentar` — kirim SLUG (string), bukan integer ID.
Tapi controller declare `int $id` + manual `KontenBudaya::findOrFail($id)` —
PHP gagal coerce slug non-numerik ke int.

Fix: ganti ke route model binding `KontenBudaya $konten`. Karena route di
`routes/web.php` untuk endpoint ini ditulis `{konten}` TANPA suffix `:slug`,
Laravel implicit binding otomatis pakai `getRouteKeyName()` model (= `slug`) —
JADI TIDAK PERLU mengubah `routes/web.php` sama sekali, cukup ubah signature
method di controller.

## A.1 — Fix RatingController ✅ SELESAI
FILE: `app/Http/Controllers/RatingController.php`
ACTION: GANTI TOTAL

```php
<?php

namespace App\Http\Controllers;

use App\Models\KontenBudaya;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RatingController extends Controller
{
    /**
     * Simpan atau update rating.
     * Satu user hanya bisa rating sekali — updateOrCreate untuk mengubah.
     */
    public function store(Request $request, KontenBudaya $konten)
    {
        abort_if($konten->status !== 'published', 403);
        abort_if((int) $konten->user_id === (int) Auth::id(), 403, 'Tidak bisa memberi rating pada konten milik sendiri.');

        $request->validate([
            'skor' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        Rating::updateOrCreate(
            [
                'konten_id' => $konten->id,
                'user_id'   => Auth::id(),
            ],
            ['skor' => $request->skor]
        );

        return back();
    }
}
```

CATATAN: owner check sengaja pakai cast `(int)` di kedua sisi
(`(int) $konten->user_id === (int) Auth::id()`) — ini konvensi project untuk
menghindari strict comparison mismatch antar driver database. Jangan dihapus.

## A.2 — Fix PublicKomentarController ✅ SELESAI
FILE: `app/Http/Controllers/PublicKomentarController.php`
ACTION: GANTI TOTAL

```php
<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\KontenBudaya;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicKomentarController extends Controller
{
    public function store(Request $request, KontenBudaya $konten)
    {
        abort_if($konten->status !== 'published', 403);

        $request->validate([
            'isi'       => ['required', 'string', 'min:3', 'max:1000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        Comment::create([
            'konten_id' => $konten->id,
            'user_id'   => Auth::id(),
            'parent_id' => $request->parent_id,
            'isi'       => $request->isi,
            'status'    => 'aktif',
        ]);

        return back();
    }
}
```

## A.3 — JANGAN lakukan ini
- JANGAN ubah `app/Http/Controllers/KomentarController.php` (yang admin —
  `hide()`/`destroy()` dengan `int $id`). Itu BUKAN bug — model `Comment` tidak
  override route key (tetap pakai `id` numerik), jadi aman. Di luar scope Phase 3.
- JANGAN ubah `routes/web.php`.

# ════════════════════════════════════════════════════════════════════
# SECTION B — TEXTURE BACKGROUND + FULLBLEED LAYOUT INFRA
# ════════════════════════════════════════════════════════════════════

Texture yang dipakai: dot halus, tint terracotta, opacity rendah (sudah dipilih
user dari 3 opsi yang ditawarkan — JANGAN ganti ke opsi lain seperti motif
tenun atau serat kertas). Diterapkan via 1 class CSS reusable, dipakai di
background utama public layout SAJA (bukan di card/komponen lain).

`fullBleed` adalah prop baru di `PublicLayout` — kalau `true`, area `<main>`
jadi pas setinggi viewport (`100vh - 3.5rem`, dikurangi tinggi header) tanpa
padding dan tanpa scroll. INI KHUSUS untuk halaman immersive (Section E).
Halaman publik lain (welcome, galeri/index, tentang, kontak, kontribusi/*)
TIDAK memakai `fullBleed` — biarkan default `false`, JANGAN diubah.

## B.1 — Tambah texture utility di app.css ✅ SELESAI
FILE: `resources/css/app.css`
ACTION: TAMBAHKAN — cari blok ini yang SUDAH ADA di file:

```css
/* ── Plyr brand override — Budaya Sumsel ── */
:root {
    --plyr-color-main: #c2410c;
    --plyr-audio-controls-background: #ffffff;
    --plyr-audio-control-color: #57534e;
}
```

Tepat SETELAH blok di atas (di akhir file), TAMBAHKAN blok baru ini:

```css
/* ── Texture background — halaman publik (Light Gallery) ── */
/* Tweak kerapatan/opacity di sini, kepake otomatis di semua halaman publik */
:root {
    --texture-dot-color: 194, 65, 12; /* rgb terracotta */
    --texture-dot-opacity: 0.12;
    --texture-dot-size: 16px;
}
.bg-texture-dots {
    background-color: #faf9f7;
    background-image: radial-gradient(circle, rgba(var(--texture-dot-color), var(--texture-dot-opacity)) 1px, transparent 1.6px);
    background-size: var(--texture-dot-size) var(--texture-dot-size);
}
```

JANGAN ubah nilai `--texture-dot-opacity` atau warna tanpa instruksi user —
ini sudah ditentukan (terracotta, opacity 0.12, spacing 16px).

## B.2 — Update PublicLayout (texture + prop fullBleed) ✅ SELESAI
FILE: `resources/js/layouts/public-layout.tsx`
ACTION: GANTI TOTAL

```tsx
import { PublicSidebar } from '@/components/public-sidebar';
import BottomAudioPlayer from '@/components/bottom-audio-player';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    /** Halaman immersive (full-screen viewer) — main jadi pas tinggi viewport, tanpa padding/scroll */
    fullBleed?: boolean;
}

export default function PublicLayout({ children, title, breadcrumbs = [], fullBleed = false }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth?.user;

    return (
        <>
            <Head>
                <title>{title ? `${title} — Budaya Sumsel` : 'Budaya Sumsel'}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <AudioPlayerProvider>
                <SidebarProvider defaultOpen={false} style={{ fontFamily: "'Inter', sans-serif" }}>
                    <PublicSidebar />
                    <SidebarInset className="bg-texture-dots">

                        {/* Top bar */}
                        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
                            <SidebarTrigger className="text-stone-600" />
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex-1 min-w-0">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="shrink-0">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-[#c2410c] text-xs font-semibold text-white">
                                            {auth.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            ) : (
                                <div className="flex shrink-0 items-center gap-2">
                                    <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100">
                                        Masuk
                                    </Link>
                                    <Link href="/register" className="rounded-lg bg-[#c2410c] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a330a]">
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </header>

                        <main className={fullBleed ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : 'min-h-[calc(100vh-3.5rem)] pb-24'}>
                            {children}
                        </main>

                        <BottomAudioPlayer />
                    </SidebarInset>
                </SidebarProvider>
            </AudioPlayerProvider>
        </>
    );
}
```

CATATAN PENTING (jangan dihapus/diubah saat menerapkan):
- `<BottomAudioPlayer />` TETAP dirender meskipun `fullBleed={true}` — JANGAN
  disembunyikan saat fullBleed. Halaman immersive di Section E butuh komponen
  ini tetap ada untuk fitur audio (lihat Section E).
- `defaultOpen={false}` pada `SidebarProvider` JANGAN diubah. Ini SUDAH cukup
  untuk requirement "sidebar auto-collapsed di halaman detail" — public layout
  memang sudah default collapsed di semua halaman publik, tidak perlu logic
  tambahan apa pun untuk itu. JANGAN menambahkan logic baca-cookie atau
  override khusus per-halaman untuk sidebar — di luar scope Phase 3.

# ════════════════════════════════════════════════════════════════════
# SECTION C — MEDIAPREVIEW: TAMBAH MODE FULLSCREEN
# ════════════════════════════════════════════════════════════════════

Tambah prop opsional `fullscreen` di `MediaPreviewItemView`, HANYA berlaku
untuk tipe `image` dan `video`. Default `false` — supaya 2 file lain yang
juga memakai komponen ini (`kontribusi/show.tsx` dan `konten/show.tsx`, admin)
TIDAK terpengaruh sama sekali. JANGAN sentuh kedua file itu.

`fullscreen` TIDAK ditambahkan untuk tipe `audio` dan `document` — keduanya
punya rendering khusus sendiri yang ditulis langsung di `galeri/show.tsx`
(Section E), bukan lewat komponen ini. Alasannya: audio fullscreen harus pakai
`AudioPlayerContext`/`BottomAudioPlayer` global yang sama dengan `KontenCard`
(konsistensi satu pola pemutaran audio di seluruh situs) — kalau dependency itu
ditambahkan ke `media-preview.tsx`, file ini akan crash saat dipakai di admin
layout (`konten/show.tsx`) yang TIDAK membungkus `AudioPlayerProvider`.
JANGAN tambahkan `useAudioPlayer` ke file ini.

## C.1 — Update media-preview.tsx ✅ SELESAI
FILE: `resources/js/components/media-preview.tsx`
ACTION: GANTI TOTAL

```tsx
import { FileText, Download } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useEffect, useRef } from 'react';

export type PreviewTipe = 'image' | 'video' | 'audio' | 'document';

interface MediaPreviewItem {
    tipe: PreviewTipe;
    url: string;
    filename: string;
    ukuran_kb?: number;
    durasi_detik?: number | null;
    isLocal?: boolean;
}

function resolveUrl(item: MediaPreviewItem): string {
    if (item.isLocal) return item.url;
    return `/storage/${item.url}`;
}

function formatSize(kb?: number): string {
    if (!kb) return '';
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

function formatDur(s?: number | null): string {
    if (!s) return '';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function VideoPlayer({ src }: { src: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        playerRef.current = new Plyr(ref.current, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
            fullscreen: { enabled: true, fallback: true, iosNative: false },
        });
        return () => { playerRef.current?.destroy(); };
    }, []);

    return (
        <video ref={ref} className="plyr-video w-full" controls playsInline>
            <source src={src} type="video/mp4" />
            Browser kamu tidak mendukung pemutaran video.
        </video>
    );
}

function AudioPlayer({ src }: { src: string }) {
    const ref = useRef<HTMLAudioElement>(null);
    const playerRef = useRef<Plyr | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        playerRef.current = new Plyr(ref.current, {
            controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
        });
        return () => { playerRef.current?.destroy(); };
    }, []);

    return (
        <audio ref={ref} controls className="w-full">
            <source src={src} type="audio/mpeg" />
            Browser kamu tidak mendukung pemutaran audio.
        </audio>
    );
}

export function MediaPreviewItemView({ item, showMeta = true, fullscreen = false }: { item: MediaPreviewItem; showMeta?: boolean; fullscreen?: boolean }) {
    const src = resolveUrl(item);

    if (item.tipe === 'image') {
        if (fullscreen) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <img src={src} alt={item.filename} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
            );
        }
        return (
            <figure className="overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                <img src={src} alt={item.filename} className="w-full object-contain max-h-[600px]" loading="lazy" />
                {showMeta && (
                    <figcaption className="flex items-center justify-between px-3 py-2 text-xs text-stone-500">
                        <span className="truncate">{item.filename}</span>
                        {item.ukuran_kb && <span className="shrink-0 ml-2">{formatSize(item.ukuran_kb)}</span>}
                    </figcaption>
                )}
            </figure>
        );
    }

    if (item.tipe === 'video') {
        if (fullscreen) {
            return (
                <div className="flex h-full w-full max-h-full max-w-full items-center justify-center">
                    <VideoPlayer src={src} />
                </div>
            );
        }
        return (
            <div className="overflow-hidden rounded-lg">
                <VideoPlayer src={src} />
                {showMeta && <p className="mt-1.5 text-xs text-stone-500 truncate">{item.filename}</p>}
            </div>
        );
    }

    if (item.tipe === 'audio') {
        return (
            <div className="rounded-lg border border-black/[0.06] bg-white p-4">
                {showMeta && (
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-stone-800 truncate">{item.filename}</span>
                        {item.durasi_detik && <span className="text-xs text-stone-400 shrink-0 ml-2">{formatDur(item.durasi_detik)}</span>}
                    </div>
                )}
                <AudioPlayer src={src} />
            </div>
        );
    }

    return (
        <a href={src} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 rounded-lg border border-black/[0.06] bg-white p-4 transition-colors hover:border-black/[0.16]">
            <div className="flex size-10 items-center justify-center rounded-md bg-stone-100 shrink-0">
                <FileText className="size-5 text-stone-500" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">{item.filename}</p>
                <p className="text-xs text-stone-400">{formatSize(item.ukuran_kb)}</p>
            </div>
            <Download className="size-4 text-stone-400 shrink-0" />
        </a>
    );
}

export default function MediaPreview({ items, showMeta = true }: { items: MediaPreviewItem[]; showMeta?: boolean }) {
    if (!items || items.length === 0) return null;

    const order: PreviewTipe[] = ['video', 'audio', 'image', 'document'];
    const sorted = [...items].sort((a, b) => order.indexOf(a.tipe) - order.indexOf(b.tipe));

    return (
        <div className="flex flex-col gap-4">
            {sorted.map((item, i) => (
                <MediaPreviewItemView key={i} item={item} showMeta={showMeta} />
            ))}
        </div>
    );
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION D — FIX TIPE DATA KONTENBUDAYA
# ════════════════════════════════════════════════════════════════════

Ini BUKAN bug dari Phase 3 — ini gap yang SUDAH ADA dari awal (field
`comments` dipakai di `galeri/show.tsx` versi LAMA juga, tapi tidak pernah
dideklarasikan di interface `KontenBudaya`). Baru ketahuan sekarang karena
`tsc --noEmit` dijalankan dan menangkapnya. Karena Section E butuh field ini
valid secara tipe, perbaiki dulu di sini.

## D.1 — Tambah field `comments` ke interface KontenBudaya ✅ SELESAI
FILE: `resources/js/types/index.d.ts`
ACTION: EDIT TARGETED — JANGAN ganti total file ini (banyak interface lain di
file yang sama, tidak boleh disentuh).

Cari baris ini (persis, di dalam `interface KontenBudaya`):

```ts
    media_files?: MediaFile[]; primary_media?: MediaFile | null;
    tags?: Tag[]; moderation_logs?: ModerationLog[]; comments_count?: number;
```

Tepat SETELAH baris itu, TAMBAHKAN 1 baris baru:

```ts
    comments?: Comment[];
```

Hasil akhirnya jadi seperti ini (3 baris, hanya baris ke-3 yang baru):

```ts
    media_files?: MediaFile[]; primary_media?: MediaFile | null;
    tags?: Tag[]; moderation_logs?: ModerationLog[]; comments_count?: number;
    comments?: Comment[];
```

JANGAN tambahkan field lain, JANGAN ubah interface lain di file ini.

# ════════════════════════════════════════════════════════════════════
# SECTION E — REDESIGN TOTAL GALERI/SHOW.TSX (IMMERSIVE VIEWER)
# ════════════════════════════════════════════════════════════════════

## Konsep yang HARUS diterapkan (sudah final, jangan didesain ulang)

- Begitu halaman dibuka, media (gambar/video/audio/PDF) langsung tampil FULL
  SCREEN — bukan inline/stacked seperti sebelumnya.
- Tombol bulat di KIRI-BAWAH: tipe media yang TERSEDIA (Gambar/Video/Audio/PDF
  — HANYA yang ada filenya, tipe yang tidak ada filenya TIDAK dirender tombolnya
  sama sekali, BUKAN di-disable), lalu pemisah vertikal tipis, lalu 3 tombol
  konten yang SELALU ada: Deskripsi, Rating, Komentar.
- Klik tombol tipe media → ganti media yang tampil full-screen, otomatis
  menutup panel konten yang sedang terbuka (kalau ada).
- Klik tombol Deskripsi/Rating/Komentar → toggle panel bottom-sheet yang
  geser naik dari bawah, MEDIA TETAP TERLIHAT di belakang panel (panel tidak
  menutupi seluruh layar, max-height 70%).
- Kalau ada >1 file di tipe yang sama (misal 3 foto) → tombol prev/next +
  counter "2 / 3" di kanan-atas. KECUALI untuk tipe `document` (PDF) — TIDAK
  ada navigasi prev/next untuk PDF (scoping yang sudah disetujui, jangan
  ditambahkan sendiri).
- Tab Audio TIDAK punya player inline — dia pakai `useAudioPlayer()` dari
  `AudioPlayerContext` yang sama dengan `KontenCard`, jadi playback-nya muncul
  di `BottomAudioPlayer` global (konsisten satu pola di seluruh situs).
- Tab PDF dirender via `<iframe>` langsung di layar, plus link "Buka di tab
  baru" untuk browser yang tidak bisa render PDF native di iframe.
- Panel Deskripsi berisi GABUNGAN: badge kategori, judul, meta (tanggal/view
  count/wilayah/rating ringkas), info kontributor + `LevelBadge`, deskripsi
  lengkap, tags, DAN "Konten Terkait" (4 `KontenCard`) di paling bawah panel
  ini — Konten Terkait TIDAK punya tab/section sendiri.
- Panel Rating dan Komentar fungsinya SAMA seperti versi sebelumnya (cuma
  dipindah ke dalam panel, bukan section halaman penuh).
- Tab bar dan panel HARUS naik posisinya (geser ke atas) kalau
  `BottomAudioPlayer` sedang tampil (`current` truthy dari `useAudioPlayer()`)
  — supaya tidak tertutup/numpuk. Offset yang dipakai: 76px.
- Layout pakai `PublicLayout` dengan prop `fullBleed` (dari Section B).

## E.1 — Ganti total galeri/show.tsx ✅ SELESAI
FILE: `resources/js/pages/galeri/show.tsx`
ACTION: GANTI TOTAL

```tsx
import { MediaPreviewItemView } from '@/components/media-preview';
import StarRating from '@/components/star-rating';
import LevelBadge from '@/components/level-badge';
import KontenCard from '@/components/konten-card';
import PublicLayout from '@/layouts/public-layout';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { Comment, KontenBudaya, MediaFile, MediaTipe, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AlignLeft, CalendarDays, ChevronLeft, ChevronRight, Eye, FileText,
    Headphones, Image as ImageIcon, LucideIcon, MapPin, MessageCircle, Music,
    Pause, Play, Send, Star, Video,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    konten: KontenBudaya & { ratings_count: number; ratings_avg_skor: number | null };
    relatedKonten: KontenBudaya[];
    userRating: number | null;
}

type ContentTab = 'deskripsi' | 'rating' | 'komentar';

interface TabConfig<T extends string> { key: T; icon: LucideIcon; label: string }

const MEDIA_TABS: TabConfig<MediaTipe>[] = [
    { key: 'image', icon: ImageIcon, label: 'Gambar' },
    { key: 'video', icon: Video, label: 'Video' },
    { key: 'audio', icon: Headphones, label: 'Audio' },
    { key: 'document', icon: FileText, label: 'PDF' },
];

const CONTENT_TABS: TabConfig<ContentTab>[] = [
    { key: 'deskripsi', icon: AlignLeft, label: 'Deskripsi' },
    { key: 'rating', icon: Star, label: 'Rating' },
    { key: 'komentar', icon: MessageCircle, label: 'Komentar' },
];

function formatDur(s?: number | null): string {
    if (!s) return '';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function CommentItem({ comment, kontenSlug }: { comment: Comment; kontenSlug: string }) {
    const [showReply, setShowReply] = useState(false);
    const [reply, setReply] = useState('');
    const { auth } = usePage<SharedData>().props;

    const submit = () => {
        if (!reply.trim()) return;
        router.post(`/galeri/${kontenSlug}/komentar`, { isi: reply, parent_id: comment.id }, {
            onSuccess: () => { setReply(''); setShowReply(false); },
        });
    };

    return (
        <div className="border-b border-black/[0.07] py-4">
            <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-stone-900">{comment.user?.name}</span>
                        <span className="text-xs text-stone-400">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">{comment.isi}</p>
                    {auth?.user && (
                        <button onClick={() => setShowReply(!showReply)}
                            className="mt-2 text-xs font-semibold text-stone-400 transition-colors hover:text-[#c2410c]">
                            {showReply ? 'Batal' : 'Balas'}
                        </button>
                    )}
                    {showReply && (
                        <div className="mt-2 flex gap-2">
                            <input value={reply} onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                placeholder="Tulis balasan..."
                                className="flex-1 border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#c2410c]" />
                            <button onClick={submit} className="text-stone-600 transition-colors hover:text-[#c2410c]">
                                <Send className="size-4" />
                            </button>
                        </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 border-l border-black/[0.07] pl-4">
                            {comment.replies.map((r) => (
                                <div key={r.id} className="flex gap-2">
                                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600">
                                        {r.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-stone-900">{r.user?.name}</span>
                                        <p className="mt-0.5 text-sm text-stone-600">{r.isi}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function GaleriShow({ konten, relatedKonten, userRating }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { current, isPlaying, play, toggle } = useAudioPlayer();

    const [comment, setComment] = useState('');
    const [currentRating, setCurrentRating] = useState(userRating ?? 0);

    // Kelompokkan media_files per tipe, urut sesuai field `urutan`
    const mediaByTipe = useMemo(() => {
        const groups: Partial<Record<MediaTipe, MediaFile[]>> = {};
        (konten.media_files ?? []).forEach((f) => {
            (groups[f.tipe] ??= []).push(f);
        });
        Object.values(groups).forEach((arr) => arr?.sort((a, b) => a.urutan - b.urutan));
        return groups;
    }, [konten.media_files]);

    // Tombol tipe media hanya muncul kalau memang ada filenya
    const availableMediaTabs = MEDIA_TABS.filter((t) => (mediaByTipe[t.key]?.length ?? 0) > 0);

    // Default: tipe dari file primary/cover, fallback ke tab pertama yang tersedia
    const defaultMediaTab = useMemo<MediaTipe | null>(() => {
        const primary = (konten.media_files ?? []).find((f) => f.is_primary);
        if (primary && availableMediaTabs.some((t) => t.key === primary.tipe)) return primary.tipe;
        return availableMediaTabs[0]?.key ?? null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [konten.media_files]);

    const [activeMediaTab, setActiveMediaTab] = useState<MediaTipe | null>(defaultMediaTab);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [activePanel, setActivePanel] = useState<ContentTab | null>(null);

    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const totalRatings = konten.ratings_count ?? 0;
    const visibleComments = (konten.comments ?? []).filter((c: Comment) => c.status === 'aktif');

    const selectMediaTab = (tipe: MediaTipe) => {
        setActiveMediaTab(tipe);
        setMediaIndex(0);
        setActivePanel(null);
    };

    const togglePanel = (key: ContentTab) => {
        setActivePanel((prev) => (prev === key ? null : key));
    };

    const submitComment = () => {
        if (!comment.trim()) return;
        router.post(`/galeri/${konten.slug}/komentar`, { isi: comment }, { onSuccess: () => setComment('') });
    };

    const submitRating = (skor: number) => {
        setCurrentRating(skor);
        router.post(`/galeri/${konten.slug}/rating`, { skor }, { preserveScroll: true });
    };

    // Geser tab bar & panel ke atas biar gak numpuk sama BottomAudioPlayer
    const audioOffset = current ? 76 : 0;

    const breadcrumbs = [
        { title: 'Beranda', href: '/' },
        { title: 'Jelajah', href: '/galeri' },
        { title: konten.judul, href: `/galeri/${konten.slug}` },
    ];

    const activeFiles = activeMediaTab ? (mediaByTipe[activeMediaTab] ?? []) : [];
    const showCarouselNav = activeFiles.length > 1 && activeMediaTab !== 'document';

    function renderMediaCenter() {
        if (!activeMediaTab) {
            return (
                <div className="flex flex-col items-center gap-2 text-stone-500">
                    <ImageIcon className="size-10" />
                    <p className="text-sm">Belum ada media</p>
                </div>
            );
        }

        if (activeMediaTab === 'audio') {
            const file = activeFiles[mediaIndex];
            if (!file) return null;
            const isThisPlaying = current?.url === file.url && isPlaying;

            return (
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                        {konten.cover_url
                            ? <img src={konten.cover_url} alt="" className="size-full object-cover" />
                            : <Music className="size-10 text-white/70" />}
                    </div>
                    <div>
                        <p className="max-w-xs truncate text-sm font-medium text-white">{file.filename}</p>
                        {file.durasi_detik && <p className="mt-1 text-xs text-white/50">{formatDur(file.durasi_detik)}</p>}
                    </div>
                    <button
                        onClick={() => (isThisPlaying ? toggle() : play({
                            judul: konten.judul,
                            url: file.url,
                            user: konten.user?.name,
                            wilayah: konten.wilayah?.nama,
                            durasi_detik: file.durasi_detik,
                            cover_url: konten.cover_url,
                        }))}
                        className="flex size-14 items-center justify-center rounded-full bg-[#c2410c] text-white transition-transform hover:scale-105"
                        aria-label={isThisPlaying ? 'Jeda' : 'Putar'}>
                        {isThisPlaying ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
                    </button>
                </div>
            );
        }

        if (activeMediaTab === 'document') {
            const file = activeFiles[mediaIndex];
            if (!file) return null;
            const src = `/storage/${file.url}`;

            return (
                <div className="flex h-full w-full flex-col bg-white">
                    <iframe src={src} title={file.filename} className="flex-1" />
                    <div className="flex items-center justify-between border-t border-black/10 px-4 py-2 text-xs text-stone-500">
                        <span className="truncate">{file.filename}</span>
                        <a href={src} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-[#c2410c] hover:underline">
                            Buka di tab baru
                        </a>
                    </div>
                </div>
            );
        }

        const file = activeFiles[mediaIndex];
        if (!file) return null;

        return (
            <MediaPreviewItemView
                key={file.id}
                item={{ tipe: file.tipe, url: file.url, filename: file.filename, ukuran_kb: file.ukuran_kb, durasi_detik: file.durasi_detik }}
                showMeta={false}
                fullscreen
            />
        );
    }

    function renderPanel() {
        if (activePanel === 'deskripsi') {
            return (
                <div className="space-y-5">
                    <div>
                        {konten.category && (
                            <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
                                {konten.category.nama}
                            </span>
                        )}
                        <h1 className="mt-3 text-xl font-bold leading-tight text-stone-900 sm:text-2xl">{konten.judul}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="size-4" />
                                {new Date(konten.approved_at ?? konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5"><Eye className="size-4" />{konten.view_count.toLocaleString('id-ID')} dilihat</span>
                            {konten.wilayah && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{konten.wilayah.nama}</span>}
                            {avg && <span className="flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" />{avg} ({totalRatings})</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-black/[0.07] pt-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                            {konten.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-stone-900">{konten.user?.name}</p>
                            {typeof konten.user?.approved_konten_count === 'number' && (
                                <div className="mt-0.5"><LevelBadge approvedCount={konten.user.approved_konten_count} size="sm" /></div>
                            )}
                        </div>
                    </div>

                    <p className="whitespace-pre-wrap border-t border-black/[0.07] pt-5 text-[15px] leading-relaxed text-stone-700">
                        {konten.deskripsi}
                    </p>

                    {konten.tags && konten.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {konten.tags.map((tag) => (
                                <Link key={tag.id} href={`/galeri?search=${encodeURIComponent(tag.nama)}`}
                                    className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-[#c2410c] hover:text-[#c2410c]">
                                    #{tag.nama}
                                </Link>
                            ))}
                        </div>
                    )}

                    {relatedKonten.length > 0 && (
                        <div className="border-t border-black/[0.07] pt-5">
                            <p className="mb-4 text-sm font-semibold text-stone-900">Konten Terkait</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {relatedKonten.map((r) => <KontenCard key={r.id} konten={r} />)}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activePanel === 'rating') {
            return (
                <div>
                    <p className="mb-3 text-sm font-semibold text-stone-900">Beri Penilaian</p>
                    {auth?.user ? (
                        konten.user_id !== auth.user.id ? (
                            <div>
                                <StarRating value={currentRating} onChange={submitRating} size="lg" />
                                <p className="mt-2 text-xs text-stone-400">
                                    {currentRating > 0 ? `${currentRating} bintang — klik untuk mengubah` : 'Klik bintang untuk memberi nilai'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400">Tidak bisa menilai konten sendiri</p>
                        )
                    ) : (
                        <p className="text-sm text-stone-600">
                            <Link href="/login" className="font-semibold text-[#c2410c] underline">Masuk</Link> untuk memberi penilaian
                        </p>
                    )}
                    {avg && totalRatings > 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl font-bold text-stone-900">{avg}</span>
                            <div>
                                <StarRating value={Math.round(Number(avg))} readonly size="sm" />
                                <p className="mt-0.5 text-xs text-stone-400">dari {totalRatings} penilaian</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activePanel === 'komentar') {
            return (
                <div>
                    <p className="mb-5 text-sm font-semibold text-stone-900">
                        Komentar {visibleComments.length > 0 && `(${visibleComments.length})`}
                    </p>

                    {auth?.user ? (
                        <div className="mb-6 flex gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                                {auth.user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                                    placeholder="Tulis komentar..."
                                    className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#c2410c]" />
                                <div className="mt-2 flex justify-end">
                                    <button onClick={submitComment} disabled={!comment.trim()}
                                        className="rounded-lg bg-[#c2410c] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9a330a] disabled:opacity-40">
                                        Kirim Komentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-6 text-sm text-stone-500">
                            <Link href="/login" className="font-semibold text-[#c2410c] underline">Masuk</Link> untuk berkomentar
                        </p>
                    )}

                    {visibleComments.length > 0
                        ? visibleComments.map((c: Comment) => <CommentItem key={c.id} comment={c} kontenSlug={konten.slug} />)
                        : <p className="py-8 text-center text-sm text-stone-400">Belum ada komentar</p>}
                </div>
            );
        }

        return null;
    }

    return (
        <PublicLayout title={konten.judul} breadcrumbs={breadcrumbs} fullBleed>
            <div className="relative h-full w-full overflow-hidden bg-stone-950">

                {/* Media full-screen */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {renderMediaCenter()}
                </div>

                {/* Navigasi prev/next, kalau ada >1 file di tipe yang sama */}
                {showCarouselNav && (
                    <>
                        <button
                            onClick={() => setMediaIndex((i) => (i - 1 + activeFiles.length) % activeFiles.length)}
                            className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                            aria-label="Sebelumnya">
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            onClick={() => setMediaIndex((i) => (i + 1) % activeFiles.length)}
                            className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                            aria-label="Berikutnya">
                            <ChevronRight className="size-5" />
                        </button>
                        <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white">
                            {mediaIndex + 1} / {activeFiles.length}
                        </span>
                    </>
                )}

                {/* Tab bar kiri-bawah */}
                <div
                    className="absolute left-3.5 z-20 flex items-center gap-1 rounded-full bg-black/55 p-1.5 transition-[bottom] duration-200"
                    style={{ bottom: 14 + audioOffset }}>
                    {availableMediaTabs.map((tab) => {
                        const isActive = activeMediaTab === tab.key;
                        return (
                            <button key={tab.key} onClick={() => selectMediaTab(tab.key)} aria-label={tab.label}
                                className={`flex size-8 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[#c2410c] text-white' : 'text-white/70 hover:text-white'}`}>
                                <tab.icon className="size-4" />
                            </button>
                        );
                    })}

                    {availableMediaTabs.length > 0 && <span className="mx-0.5 h-5 w-px bg-white/20" />}

                    {CONTENT_TABS.map((tab) => {
                        const isActive = activePanel === tab.key;
                        return (
                            <button key={tab.key} onClick={() => togglePanel(tab.key)} aria-label={tab.label}
                                className={`flex size-8 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-[#c2410c] text-white' : 'text-white/70 hover:text-white'}`}>
                                <tab.icon className="size-4" />
                            </button>
                        );
                    })}
                </div>

                {/* Panel konten — geser naik dari bawah, media tetap kelihatan di belakangnya */}
                <div
                    className="absolute inset-x-0 bottom-0 z-20 max-h-[70%] overflow-y-auto rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-transform duration-200"
                    style={{ transform: activePanel ? 'translateY(0)' : 'translateY(100%)', bottom: audioOffset }}>
                    <div className="mx-auto max-w-2xl px-5 pb-6 pt-5">
                        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-stone-200" />
                        {renderPanel()}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
```

## E.2 — JANGAN lakukan ini
- JANGAN tambahkan tab/section ke-8 untuk "Konten Terkait" — sudah digabung
  ke dalam panel Deskripsi sesuai keputusan user.
- JANGAN buat panel jadi side-drawer di desktop (breakpoint `sm:`/`lg:` apa
  pun) — panel TETAP bottom-sheet di semua ukuran layar, sudah didiskusikan
  dan diputuskan demikian.
- JANGAN buat komponen lightbox terpisah — seluruh layar di tab Gambar/Video
  SUDAH berfungsi sebagai "lightbox"-nya, tidak perlu komponen Dialog/Modal
  tambahan.
- JANGAN ubah `app/Http/Controllers/PublicController.php` — data yang
  dibutuhkan (`media_files`, `comments.user`, `comments.replies.user`,
  `ratings_count`, `ratings_avg_skor`, `relatedKonten`, `userRating`) SUDAH
  di-load semua oleh method `show()` yang sekarang. Tidak ada perubahan
  backend di Section E ini.

# ════════════════════════════════════════════════════════════════════
# SECTION F — VERIFIKASI
# ════════════════════════════════════════════════════════════════════

## F.1 — Type check ✅ PASS
```bash
npm run types
```
HARUS 0 error yang berasal dari file-file di TODO ini:
`app/Http/Controllers/RatingController.php`,
`app/Http/Controllers/PublicKomentarController.php`,
`resources/css/app.css`,
`resources/js/layouts/public-layout.tsx`,
`resources/js/components/media-preview.tsx`,
`resources/js/types/index.d.ts`,
`resources/js/pages/galeri/show.tsx`.

CATATAN: repo ini SUDAH punya ±40 error TypeScript pre-existing yang TIDAK
berhubungan dengan Phase 3 (kebanyakan modul `@/routes/*` yang belum digenerate
Wayfinder — jalankan generator Wayfinder project kalau mau itu hilang, di luar
scope Phase 3 — plus 2 bug lama kecil di `roles/create.tsx` dan
`nav-main.tsx`). JANGAN mencoba memperbaiki error-error itu, JANGAN
menganggap itu sebagai kegagalan Phase 3. Yang penting: TIDAK ADA error baru
muncul dari 7 file di atas.

## F.2 — Lint ✅ PASS (exit code 0 — 0 error, 0 warning)
```bash
npx eslint resources/js/pages/galeri/show.tsx resources/js/layouts/public-layout.tsx resources/js/components/media-preview.tsx
```
HARUS bersih (0 error, 0 warning) untuk 3 file ini.

## F.3 — Build ✅ PASS (built in 49.70s)
```bash
npm run build
```

## F.4 — Test checklist manual ⏳ PERLU DIVERIFIKASI DI BROWSER
(jalankan `composer run dev` atau `npm run dev` + Laravel server)
- [ ] Buka konten dengan rating — klik bintang TIDAK error (cek dulu: bug
  TypeError di Section A sudah hilang)
- [ ] Kirim komentar di halaman detail — TIDAK error
- [ ] Buka halaman detail konten apa pun — media langsung full-screen, TIDAK
  perlu scroll
- [ ] Tombol kiri-bawah HANYA menampilkan tipe media yang memang ada filenya
- [ ] Klik tombol tipe media lain → media full-screen berganti, panel yang
  terbuka (jika ada) otomatis tertutup
- [ ] Klik Deskripsi/Rating/Komentar → panel naik dari bawah, media tetap
  kelihatan di belakang
- [ ] Klik tombol yang sama lagi → panel turun/tertutup
- [ ] Konten dengan >1 foto/video → ada tombol prev/next + counter, berfungsi
- [ ] Konten dengan >1 PDF (kalau ada datanya) → TIDAK ada tombol prev/next
  (sesuai scoping)
- [ ] Tab Audio → klik play, audio muncul/berjalan di `BottomAudioPlayer` di
  bawah (BUKAN player terpisah di tengah layar)
- [ ] Saat `BottomAudioPlayer` muncul → tab bar & panel naik posisinya, tidak
  tertutup/numpuk
- [ ] Tab PDF → dokumen tampil di iframe, link "Buka di tab baru" berfungsi
- [ ] Panel Deskripsi: kategori, judul, meta, kontributor + level badge,
  deskripsi, tags, DAN Konten Terkait semua muncul di panel yang sama
- [ ] Background semua halaman publik (bukan cuma galeri/show) ada texture
  dot halus — sangat subtle, teks tetap kontras jelas
- [ ] Sidebar publik tetap dalam mode icon-rail (collapsed) seperti biasa,
  tidak ada perubahan perilaku
- [ ] Tidak ada teks/tombol yang putih-di-atas-putih atau kontras buruk di
  mana pun

## F.5 — Kalau ada test yang gagal
STOP, jangan improvisasi perbaikan sendiri di luar yang sudah dijelaskan di
TODO ini. Laporkan ke user persis test mana yang gagal dan kondisi yang
ditemukan, biarkan user yang memutuskan langkah berikutnya.

