# CLAUDE CODE TODO — PHASE 2
# Budaya Sumsel — Redesign Public + Inline Media Preview
# ════════════════════════════════════════════════════════════════════

## RINGKASAN TUJUAN

Phase 2 mengubah seluruh tampilan PUBLIC dari editorial/Spacious (cream, Montserrat,
top-nav) menjadi gaya **Light Gallery** ala YouTube/SoundCloud/Pinterest:

1. **Layout baru** — sidebar collapsible (pakai komponen Sidebar shadcn yang sudah
   dipakai admin) menggantikan top-nav. Minimize, mobile drawer, cookie persistence,
   keyboard shortcut Cmd/Ctrl+B semuanya otomatis dari shadcn.
2. **Beranda jadi feed konten** — bukan hero besar, tapi langsung grid semua konten.
3. **Style Light Gallery** — off-white `#faf9f7`, aksen terakota `#c2410c`, font Inter.
4. **Tiga pola konsumsi**: video → halaman detail, audio → bottom player persistent,
   foto → lightbox (Dialog shadcn).
5. **Inline media preview** — di halaman detail (galeri/show, kontribusi/show) DAN
   halaman upload (kontribusi/create), semua gambar/video/audio langsung tampil &
   bisa diputar TANPA klik. Tidak lagi sekadar daftar nama file.

## ATURAN DESAIN WAJIB (BERLAKU DI SEMUA FILE PHASE 2)

- **KONTRAS WCAG AA DI STATE DEFAULT.** Setiap teks/tombol HARUS terbaca jelas di
  kondisi awal — JANGAN PERNAH mengandalkan hover untuk memunculkan visibilitas.
  Hover hanya untuk PENEGASAN, bukan PENGUNGKAPAN. Contoh SALAH: tombol bg putih +
  teks putih yang baru terbaca saat hover. Contoh BENAR: tombol bg `#f0efed` + teks
  `#57534e` (terbaca), saat hover bg jadi `#e7e5e4` (sekadar menegaskan).
- **Ikon: HANYA `lucide-react`** (konsisten dengan dashboard). Jangan pakai library ikon lain.
- **Font: Inter** untuk semua teks public Phase 2. Bukan Montserrat lagi.
- **Warna sistem:**
  - Background utama: `#faf9f7` (off-white hangat, BUKAN putih murni)
  - Surface/card: `#ffffff` dengan border `rgba(0,0,0,0.06)`
  - Aksen: `#c2410c` (terakota) — untuk active state, tombol primary, link aktif
  - Aksen bg muda: `#fef3e9` (untuk highlight active nav)
  - Teks utama: `#1c1917` · Teks sekunder: `#57534e` · Teks redup: `#78716c` · Hint: `#a8a29e`
- **shadcn dipakai di tempat tepat:** Sidebar, Dialog (lightbox), DropdownMenu (filter),
  Avatar, Tooltip, Input. JANGAN paksa semua jadi shadcn — card konten, bottom audio
  player, dan filter pill tetap custom karena itu identitas platform.
- **Flat, rounded lembut** — `rounded-lg` untuk card, `rounded-md` untuk tombol/badge.
  Tidak ada shadow berat; cukup border halus.

## URUTAN EKSEKUSI (IKUTI BERURUTAN)

- SECTION A — Komponen media preview (fondasi, dipakai banyak halaman)
- SECTION B — Bottom audio player (context global)
- SECTION C — Public layout baru (sidebar)
- SECTION D — Konten card (style Light Gallery)
- SECTION E — Beranda jadi feed
- SECTION F — Galeri index (sesuaikan ke layout & style baru)
- SECTION G — Galeri show (inline media + lightbox + style baru)
- SECTION H — Kontribusi create (inline preview saat upload)
- SECTION I — Kontribusi show (inline media)
- SECTION J — Tentang & Kontak (style baru)
- SECTION K — Verifikasi

# ════════════════════════════════════════════════════════════════════
# SECTION A — KOMPONEN MEDIA PREVIEW (FONDASI)
# ════════════════════════════════════════════════════════════════════

Buat satu komponen reusable yang me-render preview media inline berdasarkan tipe.
Dipakai di galeri/show, kontribusi/show, dan kontribusi/create.

## A.1 — Buat MediaPreview component
FILE BARU: `resources/js/components/media-preview.tsx`

```tsx
import { FileText, Download } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useEffect, useRef } from 'react';

export type PreviewTipe = 'image' | 'video' | 'audio' | 'document';

interface MediaPreviewItem {
    tipe: PreviewTipe;
    url: string;        // path relatif (akan diprefix /storage/) ATAU blob URL utk preview lokal
    filename: string;
    ukuran_kb?: number;
    durasi_detik?: number | null;
    isLocal?: boolean;  // true = blob URL dari upload lokal (jangan prefix /storage/)
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

// Video player Plyr — satu instance per elemen video
function VideoPlayer({ src }: { src: string }) {
    const ref = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        playerRef.current = new Plyr(ref.current, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
        });
        return () => { playerRef.current?.destroy(); };
    }, []);

    return (
        <video ref={ref} className="plyr-video w-full rounded-lg overflow-hidden" controls playsInline>
            <source src={src} type="video/mp4" />
            Browser kamu tidak mendukung pemutaran video.
        </video>
    );
}

// Audio player Plyr
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

// Render satu item media sesuai tipe — INLINE, langsung tampil/putar
export function MediaPreviewItemView({ item }: { item: MediaPreviewItem }) {
    const src = resolveUrl(item);

    if (item.tipe === 'image') {
        return (
            <figure className="overflow-hidden rounded-lg border border-black/[0.06] bg-white">
                <img src={src} alt={item.filename} className="w-full object-contain max-h-[600px]" loading="lazy" />
                <figcaption className="flex items-center justify-between px-3 py-2 text-xs text-stone-500">
                    <span className="truncate">{item.filename}</span>
                    {item.ukuran_kb && <span className="shrink-0 ml-2">{formatSize(item.ukuran_kb)}</span>}
                </figcaption>
            </figure>
        );
    }

    if (item.tipe === 'video') {
        return (
            <div className="overflow-hidden rounded-lg">
                <VideoPlayer src={src} />
                <p className="mt-1.5 text-xs text-stone-500 truncate">{item.filename}</p>
            </div>
        );
    }

    if (item.tipe === 'audio') {
        return (
            <div className="rounded-lg border border-black/[0.06] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-800 truncate">{item.filename}</span>
                    {item.durasi_detik && <span className="text-xs text-stone-400 shrink-0 ml-2">{formatDur(item.durasi_detik)}</span>}
                </div>
                <AudioPlayer src={src} />
            </div>
        );
    }

    // document
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

// Render seluruh daftar media, dikelompokkan: video dulu, lalu audio, gambar, dokumen
export default function MediaPreview({ items }: { items: MediaPreviewItem[] }) {
    if (!items || items.length === 0) return null;

    const order: PreviewTipe[] = ['video', 'audio', 'image', 'document'];
    const sorted = [...items].sort((a, b) => order.indexOf(a.tipe) - order.indexOf(b.tipe));

    return (
        <div className="flex flex-col gap-4">
            {sorted.map((item, i) => (
                <MediaPreviewItemView key={i} item={item} />
            ))}
        </div>
    );
}
```

## A.2 — Tambah CSS Plyr brand override
FILE: `resources/css/app.css`
ACTION: TAMBAHKAN di bagian akhir file (jika belum ada dari Phase sebelumnya):

```css
:root {
    --plyr-color-main: #c2410c;
    --plyr-audio-controls-background: #ffffff;
    --plyr-audio-control-color: #57534e;
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION B — BOTTOM AUDIO PLAYER (CONTEXT GLOBAL)
# ════════════════════════════════════════════════════════════════════

Audio dari card di feed/galeri diputar di bottom player persistent. User bisa terus
browse sambil mendengarkan. Pakai React Context agar bisa di-trigger dari card mana pun.

## B.1 — Buat AudioPlayerContext
FILE BARU: `resources/js/contexts/audio-player-context.tsx`

```tsx
import { createContext, useContext, useRef, useState, ReactNode, useEffect, useRef } from 'react';

export interface AudioTrack {
    judul: string;
    url: string;          // path relatif (akan diprefix /storage/)
    user?: string;
    wilayah?: string;
    durasi_detik?: number | null;
    cover_url?: string | null;
}

interface AudioPlayerContextType {
    current: AudioTrack | null;
    isPlaying: boolean;
    play: (track: AudioTrack) => void;
    toggle: () => void;
    close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
    const ctx = useContext(AudioPlayerContext);
    if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
    return ctx;
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<AudioTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        const a = audioRef.current;
        a.addEventListener('play', () => setIsPlaying(true));
        a.addEventListener('pause', () => setIsPlaying(false));
        a.addEventListener('ended', () => setIsPlaying(false));
        return () => { a.pause(); };
    }, []);

    const play = (track: AudioTrack) => {
        const a = audioRef.current;
        if (!a) return;
        const src = `/storage/${track.url}`;
        if (current?.url !== track.url) {
            a.src = src;
            setCurrent(track);
        }
        a.play();
    };

    const toggle = () => {
        const a = audioRef.current;
        if (!a || !current) return;
        if (a.paused) a.play();
        else a.pause();
    };

    const close = () => {
        const a = audioRef.current;
        if (a) a.pause();
        setCurrent(null);
        setIsPlaying(false);
    };

    return (
        <AudioPlayerContext.Provider value={{ current, isPlaying, play, toggle, close }}>
            {children}
        </AudioPlayerContext.Provider>
    );
}
```

CATATAN: import baris pertama harus diperbaiki — `useRef` tertulis dua kali dan `useRef`
bukan `useRef`. Gunakan import yang benar ini di baris pertama file:

```tsx
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
```

## B.2 — Buat komponen BottomAudioPlayer (UI)
FILE BARU: `resources/js/components/bottom-audio-player.tsx`

```tsx
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { Music, Pause, Play, Volume2, X } from 'lucide-react';

export default function BottomAudioPlayer() {
    const { current, isPlaying, toggle, close } = useAudioPlayer();

    if (!current) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white px-4 py-2.5">
            <div className="mx-auto flex max-w-screen-2xl items-center gap-3">
                {/* Artwork */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-orange-100">
                    {current.cover_url
                        ? <img src={current.cover_url} alt="" className="size-full rounded-md object-cover" />
                        : <Music className="size-5 text-orange-700" />}
                </div>

                {/* Title */}
                <div className="w-32 min-w-0 shrink-0">
                    <p className="truncate text-xs font-semibold text-stone-900">{current.judul}</p>
                    <p className="truncate text-[11px] text-stone-400">
                        {current.wilayah}{current.user ? ` · ${current.user}` : ''}
                    </p>
                </div>

                {/* Play/Pause */}
                <button onClick={toggle}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
                    aria-label={isPlaying ? 'Jeda' : 'Putar'}>
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                </button>

                {/* Spacer (progress bar dihandle oleh elemen Audio internal; UI bar opsional) */}
                <div className="flex-1" />

                <Volume2 className="size-4 shrink-0 text-stone-500" />
                <button onClick={close} aria-label="Tutup pemutar"
                    className="shrink-0 text-stone-400 transition-colors hover:text-stone-700">
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION C — PUBLIC LAYOUT BARU (SIDEBAR)
# ════════════════════════════════════════════════════════════════════

Ganti total public-layout dari top-nav editorial menjadi sidebar Light Gallery
menggunakan komponen Sidebar shadcn (sama seperti admin → minimize otomatis).

## C.1 — Buat komponen PublicSidebar
FILE BARU: `resources/js/components/public-sidebar.tsx`

```tsx
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
    SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Compass, FolderOpen, Home, Info, LayoutGrid, Mail, MapPin, Upload,
} from 'lucide-react';

interface NavLink { title: string; href: string; icon: React.ElementType }

const utama: NavLink[] = [
    { title: 'Beranda', href: '/', icon: Home },
    { title: 'Jelajah', href: '/galeri', icon: Compass },
    { title: 'Kategori', href: '/galeri?view=kategori', icon: LayoutGrid },
    { title: 'Wilayah', href: '/galeri?view=wilayah', icon: MapPin },
];

const kontribusi: NavLink[] = [
    { title: 'Upload Konten', href: '/kontribusi/create', icon: Upload },
    { title: 'Konten Saya', href: '/kontribusi', icon: FolderOpen },
];

const institusional: NavLink[] = [
    { title: 'Tentang Kami', href: '/tentang-kami', icon: Info },
    { title: 'Kontak', href: '/kontak', icon: Mail },
];

export function PublicSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const isActive = (href: string) => {
        const path = href.split('?')[0];
        return path === '/' ? page.url === '/' : page.url.startsWith(path);
    };

    const renderItems = (items: NavLink[]) =>
        items.map((item) => (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                    <Link href={item.href} prefetch>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ));

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-[#c2410c] text-white font-bold">
                                    B
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Budaya Sumsel</span>
                                    <span className="truncate text-xs text-muted-foreground">Arsip Budaya Digital</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>{renderItems(utama)}</SidebarMenu>
                </SidebarGroup>

                {auth?.user && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Kontribusi</SidebarGroupLabel>
                        <SidebarMenu>{renderItems(kontribusi)}</SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>{renderItems(institusional)}</SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
```

## C.2 — GANTI public-layout.tsx total
FILE: `resources/js/layouts/public-layout.tsx`
ACTION: GANTI SELURUH ISI dengan:

```tsx
import { PublicSidebar } from '@/components/public-sidebar';
import BottomAudioPlayer from '@/components/bottom-audio-player';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, Search } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
}

export default function PublicLayout({ children, title }: Props) {
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
                <SidebarProvider style={{ fontFamily: "'Inter', sans-serif" }}>
                    <PublicSidebar />
                    <SidebarInset className="bg-[#faf9f7]">

                        {/* Top bar */}
                        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-black/[0.07] bg-white px-4">
                            <SidebarTrigger className="text-stone-600" />

                            {/* Search */}
                            <div className="flex h-9 max-w-md flex-1 items-center gap-2 rounded-lg border border-black/10 bg-[#faf9f7] px-3">
                                <Search className="size-4 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Cari konten budaya..."
                                    className="flex-1 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
                                />
                            </div>

                            <div className="flex-1" />

                            {isLoggedIn ? (
                                <>
                                    <button className="flex size-9 items-center justify-center rounded-lg border border-black/[0.08] text-stone-600 transition-colors hover:bg-stone-50" aria-label="Notifikasi">
                                        <Bell className="size-4" />
                                    </button>
                                    <Link href="/dashboard">
                                        <Avatar className="size-8">
                                            <AvatarFallback className="bg-[#c2410c] text-xs font-semibold text-white">
                                                {auth.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100">
                                        Masuk
                                    </Link>
                                    <Link href="/register" className="rounded-lg bg-[#c2410c] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a330a]">
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </header>

                        {/* Page content — pb-24 memberi ruang utk bottom player */}
                        <main className="min-h-[calc(100vh-3.5rem)] pb-24">
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

CATATAN: Jika komponen Avatar belum ada di `resources/js/components/ui/avatar.tsx`,
jalankan: `npx shadcn@latest add avatar`. Cek dulu — admin mungkin sudah punya.

# ════════════════════════════════════════════════════════════════════
# SECTION D — KONTEN CARD (LIGHT GALLERY)
# ════════════════════════════════════════════════════════════════════

## D.1 — GANTI konten-card.tsx total
FILE: `resources/js/components/konten-card.tsx`
ACTION: GANTI SELURUH ISI dengan kartu gaya Light Gallery. Card mendeteksi tipe
konten utama dan menyesuaikan tampilan: video/foto/artikel → link ke detail; audio →
trigger bottom player.

```tsx
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';
import { Eye, FileText, Image as ImageIcon, Music, Play, Star } from 'lucide-react';

interface Props {
    konten: KontenBudaya & { ratings_avg_skor?: number | null };
}

// Tentukan tipe konten dominan dari primary_media / first_video / media_files
function tipeKonten(k: KontenBudaya): 'video' | 'audio' | 'image' | 'document' {
    if (k.first_video) return 'video';
    const pm = k.primary_media?.tipe;
    if (pm === 'video' || pm === 'audio' || pm === 'image') return pm;
    const first = k.media_files?.[0]?.tipe;
    if (first === 'video' || first === 'audio' || first === 'image') return first;
    return 'document';
}

const katStyle: Record<string, { bg: string; text: string }> = {
    // fallback netral; warna spesifik kategori opsional
};

function formatDur(s?: number | null): string {
    if (!s) return '';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function KontenCard({ konten }: Props) {
    const { play } = useAudioPlayer();
    const tipe = tipeKonten(konten);
    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const durasi = konten.first_video?.durasi_detik ?? konten.primary_media?.durasi_detik;
    const initial = konten.user?.name?.charAt(0).toUpperCase() ?? '?';

    // Thumbnail content
    const thumb = (
        <div className="relative aspect-video overflow-hidden bg-stone-200">
            {konten.cover_url ? (
                <img src={konten.cover_url} alt={konten.judul}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            ) : (
                <div className="flex size-full items-center justify-center bg-stone-300">
                    {tipe === 'video' && <Play className="size-8 text-stone-500" />}
                    {tipe === 'audio' && <Music className="size-8 text-stone-500" />}
                    {tipe === 'image' && <ImageIcon className="size-8 text-stone-500" />}
                    {tipe === 'document' && <FileText className="size-8 text-stone-500" />}
                </div>
            )}

            {/* Overlay icon utk video & audio */}
            {(tipe === 'video' || tipe === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-11 items-center justify-center rounded-full bg-black/50">
                        <Play className="size-5 fill-white text-white ml-0.5" />
                    </div>
                </div>
            )}

            {/* Category badge */}
            {konten.category && (
                <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 backdrop-blur-sm">
                    {konten.category.nama}
                </span>
            )}

            {/* Duration / type badge */}
            {durasi ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    {formatDur(durasi)}
                </span>
            ) : tipe === 'image' ? (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <ImageIcon className="size-3" /> Foto
                </span>
            ) : tipe === 'document' ? (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    <FileText className="size-3" /> Artikel
                </span>
            ) : null}
        </div>
    );

    const meta = (
        <div className="px-1 pt-2.5">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-stone-900 transition-colors group-hover:text-[#c2410c]">
                {konten.judul}
            </h3>
            <div className="mt-2 flex items-center gap-2">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[8px] font-bold text-orange-700">
                    {initial}
                </div>
                <span className="text-[11px] font-medium text-stone-500">{konten.wilayah?.nama}</span>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-0.5 text-[11px] text-stone-400">
                    <Eye className="size-3" />{konten.view_count.toLocaleString('id-ID')}
                </span>
                {avg && (
                    <>
                        <span className="text-stone-300">·</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
                            <Star className="size-3 fill-current" />{avg}
                        </span>
                    </>
                )}
            </div>
        </div>
    );

    const cardInner = (
        <div className="group cursor-pointer overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-colors hover:border-black/[0.16]">
            {thumb}
            {meta}
            <div className="h-2" />
        </div>
    );

    // Audio → trigger bottom player (bukan navigasi)
    if (tipe === 'audio') {
        const audioFile = konten.primary_media?.tipe === 'audio'
            ? konten.primary_media
            : konten.media_files?.find((f) => f.tipe === 'audio');
        return (
            <div onClick={() => audioFile && play({
                judul: konten.judul,
                url: audioFile.url,
                user: konten.user?.name,
                wilayah: konten.wilayah?.nama,
                durasi_detik: audioFile.durasi_detik,
                cover_url: konten.cover_url,
            })}>
                {cardInner}
            </div>
        );
    }

    // Video/foto/artikel → link ke detail
    const href = tipe === 'video' ? `/galeri/${konten.slug}?autoplay=1` : `/galeri/${konten.slug}`;
    return <Link href={href}>{cardInner}</Link>;
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION E — BERANDA JADI FEED
# ════════════════════════════════════════════════════════════════════

Ubah beranda dari hero besar + intro editorial menjadi feed konten langsung
(filter pills + grid). Backend perlu mengirim daftar konten yang lebih banyak.

## E.1 — UPDATE PublicController::welcome()
FILE: `app/Http/Controllers/PublicController.php`
ACTION: GANTI method `welcome()` dengan:

```php
public function welcome(Request $request)
{
    $tipe = $request->tipe; // null | image | video | audio | document

    return inertia('welcome', [
        'konten' => KontenBudaya::published()
            ->with(['category', 'wilayah', 'primaryMedia', 'firstVideo', 'user'])
            ->withCount('ratings')
            ->withAvg('ratings', 'skor')
            ->when($tipe, fn($q) => $q->whereHas('mediaFiles', fn($m) => $m->where('tipe', $tipe)))
            ->latest('approved_at')
            ->paginate(24)
            ->withQueryString(),

        'kategoris' => Category::withCount(['kontenBudayas' => fn($q) => $q->published()])
            ->whereNull('parent_id')->orderBy('urutan')->get(),

        'filters' => $request->only('tipe'),
    ]);
}
```

CATATAN: Pastikan `use Illuminate\Http\Request;` sudah ada (sudah ada di file).

## E.2 — GANTI welcome.tsx total
FILE: `resources/js/pages/welcome.tsx`
ACTION: GANTI SELURUH ISI dengan feed:

```tsx
import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya, Paginated } from '@/types';
import { router } from '@inertiajs/react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: (Category & { konten_budayas_count: number })[];
    filters: { tipe?: string };
}

const TIPE_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Foto' },
    { value: 'document', label: 'Artikel' },
];

export default function Welcome({ konten, filters }: Props) {
    const activeTipe = filters.tipe ?? '';

    const setTipe = (tipe: string) =>
        router.get('/', tipe ? { tipe } : {}, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <PublicLayout title="Beranda">
            <div className="px-4 py-4 sm:px-6">

                {/* Filter pills — kontras default terjaga: bg stone-100 + teks stone-600 */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {TIPE_FILTERS.map((f) => {
                        const active = activeTipe === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => setTipe(f.value)}
                                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                                    active
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Grid */}
                {konten.data.length === 0 ? (
                    <div className="py-32 text-center text-sm font-medium text-stone-400">
                        Belum ada konten
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {konten.data.map((item) => (
                                <KontenCard key={item.id} konten={item} />
                            ))}
                        </div>
                        <div className="mt-10 flex justify-center">
                            <PaginationLinks links={konten.links} />
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION F — GALERI INDEX (SESUAIKAN STYLE BARU)
# ════════════════════════════════════════════════════════════════════

Galeri index sekarang berada di dalam layout sidebar baru. Karena beranda sudah jadi
feed, galeri bisa difokuskan sebagai halaman "Jelajah" dengan filter lengkap
(kategori, wilayah, sort) + dukungan filter tipe. Hapus dark/light mode toggle lama
karena seluruh public sekarang konsisten Light Gallery.

## F.1 — UPDATE PublicController::galeri()
FILE: `app/Http/Controllers/PublicController.php`
ACTION: GANTI method `galeri()` dengan versi tanpa mode video/galeri (semua tipe,
filter via `tipe`):

```php
public function galeri(Request $request)
{
    $tipe = $request->tipe;

    return inertia('galeri/index', [
        'konten' => KontenBudaya::published()
            ->with(['category', 'wilayah', 'primaryMedia', 'firstVideo', 'user'])
            ->withCount('ratings')
            ->withAvg('ratings', 'skor')
            ->when($request->search,      fn($q) => $q->where('judul', 'like', "%{$request->search}%"))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->wilayah_id,  fn($q) => $q->where('wilayah_id', $request->wilayah_id))
            ->when($tipe, fn($q) => $q->whereHas('mediaFiles', fn($m) => $m->where('tipe', $tipe)))
            ->when($request->sort === 'popular', fn($q) => $q->orderByDesc('view_count'))
            ->when($request->sort !== 'popular', fn($q) => $q->latest('approved_at'))
            ->paginate(24)
            ->withQueryString(),

        'kategoris' => Category::whereNull('parent_id')->orderBy('urutan')->get(),
        'wilayahs'  => Wilayah::orderBy('nama')->get(),
        'filters'   => $request->only('search', 'category_id', 'wilayah_id', 'sort', 'tipe'),
    ]);
}
```

## F.2 — GANTI galeri/index.tsx total
FILE: `resources/js/pages/galeri/index.tsx`
ACTION: GANTI SELURUH ISI dengan versi Light Gallery + DropdownMenu shadcn untuk filter:

```tsx
import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: { search?: string; category_id?: string; wilayah_id?: string; sort?: string; tipe?: string };
}

const TIPE_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Foto' },
    { value: 'document', label: 'Artikel' },
];

export default function GaleriIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const activeTipe = filters.tipe ?? '';

    const apply = (key: string, value: string) =>
        router.get('/galeri', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const clear = () => router.get('/galeri', {}, { preserveState: true, replace: true });

    const selectedKat = kategoris.find((k) => String(k.id) === filters.category_id);
    const selectedWil = wilayahs.find((w) => String(w.id) === filters.wilayah_id);
    const hasFilter = !!(filters.search || filters.category_id || filters.wilayah_id || filters.tipe);

    return (
        <PublicLayout title="Jelajah Budaya">
            <div className="px-4 py-4 sm:px-6">

                {/* Tipe pills */}
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {TIPE_FILTERS.map((f) => {
                        const active = activeTipe === f.value;
                        return (
                            <button key={f.value} onClick={() => apply('tipe', f.value)}
                                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                                    active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}>
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Dropdown filters — kategori, wilayah, sort */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {selectedKat?.nama ?? 'Semua Kategori'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            <DropdownMenuItem onClick={() => apply('category_id', '')}>Semua Kategori</DropdownMenuItem>
                            {kategoris.map((k) => (
                                <DropdownMenuItem key={k.id} onClick={() => apply('category_id', String(k.id))}>
                                    {k.nama}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {selectedWil?.nama ?? 'Semua Wilayah'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            <DropdownMenuItem onClick={() => apply('wilayah_id', '')}>Semua Wilayah</DropdownMenuItem>
                            {wilayahs.map((w) => (
                                <DropdownMenuItem key={w.id} onClick={() => apply('wilayah_id', String(w.id))}>
                                    {w.nama}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {filters.sort === 'popular' ? 'Terpopuler' : 'Terbaru'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => apply('sort', 'latest')}>Terbaru</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => apply('sort', 'popular')}>Terpopuler</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasFilter && (
                        <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-stone-500">
                            <X className="size-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {/* Grid */}
                {konten.data.length === 0 ? (
                    <div className="py-32 text-center text-sm font-medium text-stone-400">
                        Tidak ada konten yang sesuai
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {konten.data.map((item) => <KontenCard key={item.id} konten={item} />)}
                        </div>
                        <div className="mt-10 flex justify-center">
                            <PaginationLinks links={konten.links} />
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
```

CATATAN: Jika `dropdown-menu` belum ada di ui/, jalankan `npx shadcn@latest add dropdown-menu`.

# ════════════════════════════════════════════════════════════════════
# SECTION G — GALERI SHOW (INLINE MEDIA + LIGHTBOX + STYLE BARU)
# ════════════════════════════════════════════════════════════════════

Halaman detail diubah ke Light Gallery DAN semua media tampil inline. Video pakai
Plyr (sudah ada), tapi sekarang SEMUA file (video, audio, gambar) di-render inline
lewat MediaPreview. Gambar tetap bisa diklik untuk lightbox (Dialog shadcn).

## G.1 — GANTI galeri/show.tsx total
FILE: `resources/js/pages/galeri/show.tsx`
ACTION: GANTI SELURUH ISI dengan:

```tsx
import MediaPreview from '@/components/media-preview';
import StarRating from '@/components/star-rating';
import LevelBadge from '@/components/level-badge';
import KontenCard from '@/components/konten-card';
import PublicLayout from '@/layouts/public-layout';
import { Comment, KontenBudaya } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, Eye, MapPin, Send, Star } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: KontenBudaya & { ratings_count: number; ratings_avg_skor: number | null };
    relatedKonten: KontenBudaya[];
    userRating: number | null;
}

function CommentItem({ comment, kontenSlug }: { comment: Comment; kontenSlug: string }) {
    const [showReply, setShowReply] = useState(false);
    const [reply, setReply] = useState('');
    const { auth } = usePage<any>().props;

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
    const { auth } = usePage<any>().props;
    const [comment, setComment] = useState('');
    const [currentRating, setCurrentRating] = useState(userRating ?? 0);

    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const totalRatings = konten.ratings_count ?? 0;

    const submitComment = () => {
        if (!comment.trim()) return;
        router.post(`/galeri/${konten.slug}/komentar`, { isi: comment }, { onSuccess: () => setComment('') });
    };

    const submitRating = (skor: number) => {
        setCurrentRating(skor);
        router.post(`/galeri/${konten.slug}/rating`, { skor }, { preserveScroll: true });
    };

    const visibleComments = (konten.comments ?? []).filter((c) => c.status === 'aktif');

    // Semua media → format utk MediaPreview (inline, langsung tampil)
    const previewItems = (konten.media_files ?? []).map((f) => ({
        tipe: f.tipe as 'image' | 'video' | 'audio' | 'document',
        url: f.url,
        filename: f.filename,
        ukuran_kb: f.ukuran_kb,
        durasi_detik: f.durasi_detik,
    }));

    return (
        <PublicLayout title={konten.judul}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

                {/* Back */}
                <Link href="/galeri" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-stone-500 transition-colors hover:text-[#c2410c]">
                    <ChevronLeft className="size-4" /> Jelajah
                </Link>

                {/* MEDIA INLINE — semua file langsung tampil & bisa diputar */}
                <div className="mb-6">
                    <MediaPreview items={previewItems} />
                </div>

                {/* Title + meta */}
                {konten.category && (
                    <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
                        {konten.category.nama}
                    </span>
                )}
                <h1 className="mt-3 text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">{konten.judul}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-b border-black/[0.07] pb-5 text-sm text-stone-500">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-4" />
                        {new Date(konten.approved_at ?? konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5"><Eye className="size-4" />{konten.view_count.toLocaleString('id-ID')} dilihat</span>
                    {konten.wilayah && <span className="flex items-center gap-1.5"><MapPin className="size-4" />{konten.wilayah.nama}</span>}
                    {avg && <span className="flex items-center gap-1"><Star className="size-4 fill-amber-400 text-amber-400" />{avg} ({totalRatings})</span>}
                </div>

                {/* Kontributor */}
                <div className="mt-5 flex items-center gap-3">
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

                {/* Deskripsi */}
                <div className="mt-6 border-t border-black/[0.07] pt-6">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700">{konten.deskripsi}</p>
                </div>

                {/* Tags */}
                {konten.tags && konten.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {konten.tags.map((tag) => (
                            <Link key={tag.id} href={`/galeri?search=${encodeURIComponent(tag.nama)}`}
                                className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-[#c2410c] hover:text-[#c2410c]">
                                #{tag.nama}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Rating */}
                <div className="mt-8 border-t border-black/[0.07] pt-6">
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

                {/* Komentar */}
                <div className="mt-8 border-t border-black/[0.07] pt-6">
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
                        ? visibleComments.map((c) => <CommentItem key={c.id} comment={c} kontenSlug={konten.slug} />)
                        : <p className="py-8 text-center text-sm text-stone-400">Belum ada komentar</p>
                    }
                </div>

                {/* Konten terkait */}
                {relatedKonten.length > 0 && (
                    <div className="mt-10 border-t border-black/[0.07] pt-6">
                        <p className="mb-4 text-sm font-semibold text-stone-900">Konten Terkait</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {relatedKonten.map((r) => <KontenCard key={r.id} konten={r} />)}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
```

CATATAN: `relatedKonten` perlu `firstVideo` & `primaryMedia` agar KontenCard berfungsi.
Di PublicController::show(), pastikan relatedKonten meng-eager-load: ubah baris
`->with(['primaryMedia', 'wilayah'])` menjadi `->with(['primaryMedia', 'firstVideo', 'wilayah', 'user', 'category'])`.

# ════════════════════════════════════════════════════════════════════
# SECTION H — KONTRIBUSI CREATE (INLINE PREVIEW SAAT UPLOAD)
# ════════════════════════════════════════════════════════════════════

Saat user memilih file untuk upload, preview langsung tampil inline (gambar terlihat,
video & audio bisa diputar) — bukan hanya daftar nama. Ini berlaku di halaman upload
yang ada di dalam AppLayout (dashboard), jadi style tetap mengikuti dashboard (shadcn),
hanya komponen preview-nya yang ditingkatkan.

## H.1 — UPDATE bagian preview file di kontribusi/create.tsx
FILE: `resources/js/pages/kontribusi/create.tsx`

CARI blok preview files (mulai dari `{/* Preview files */}` sampai penutup `)}`-nya):

```tsx
                                {/* Preview files */}
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                                {f.preview ? (
                                                    <img src={f.preview} alt="" className="size-10 rounded object-cover" />
                                                ) : (
                                                    <div className="flex size-10 items-center justify-center rounded bg-background">
                                                        <FileIcon tipe={f.tipe} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{f.file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {f.tipe} · {f.file.size >= 1048576 ? `${(f.file.size / 1048576).toFixed(1)} MB` : `${Math.round(f.file.size / 1024)} KB`}
                                                    </p>
                                                </div>
                                                {i === 0 && (
                                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Cover</span>
                                                )}
                                                <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
```

GANTI dengan versi yang me-render preview inline penuh:

```tsx
                                {/* Preview files — INLINE: gambar tampil, video & audio bisa diputar */}
                                {files.length > 0 && (
                                    <div className="space-y-4">
                                        {files.map((f, i) => (
                                            <div key={i} className="rounded-lg border bg-muted/20 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileIcon tipe={f.tipe} />
                                                        <span className="truncate text-sm font-medium">{f.file.name}</span>
                                                        {i === 0 && (
                                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Cover</span>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                                        <X className="size-4" />
                                                    </button>
                                                </div>

                                                {/* Inline preview per tipe */}
                                                {f.tipe === 'image' && f.preview && (
                                                    <img src={f.preview} alt={f.file.name} className="max-h-80 w-full rounded-md object-contain bg-black/5" />
                                                )}
                                                {f.tipe === 'video' && f.preview && (
                                                    <video src={f.preview} controls className="max-h-80 w-full rounded-md bg-black" />
                                                )}
                                                {f.tipe === 'audio' && f.preview && (
                                                    <audio src={f.preview} controls className="w-full" />
                                                )}
                                                {f.tipe === 'document' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {f.file.size >= 1048576 ? `${(f.file.size / 1048576).toFixed(1)} MB` : `${Math.round(f.file.size / 1024)} KB`} · Dokumen (preview tidak tersedia)
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
```

## H.2 — Perluas blob preview ke video & audio
FILE: `resources/js/pages/kontribusi/create.tsx`

CARI fungsi `addFiles`:
```tsx
    const addFiles = useCallback((newFiles: File[]) => {
        const previews: FilePreview[] = newFiles.map((file) => {
            const tipe = detectTipe(file);
            const preview = tipe === 'image' ? URL.createObjectURL(file) : undefined;
            return { file, preview, tipe };
        });
        setFiles((prev) => [...prev, ...previews].slice(0, 10));
    }, []);
```

GANTI dengan (buat blob URL untuk image, video, DAN audio):
```tsx
    const addFiles = useCallback((newFiles: File[]) => {
        const previews: FilePreview[] = newFiles.map((file) => {
            const tipe = detectTipe(file);
            // Blob URL untuk semua media yang bisa dipratinjau langsung
            const preview = (tipe === 'image' || tipe === 'video' || tipe === 'audio')
                ? URL.createObjectURL(file)
                : undefined;
            return { file, preview, tipe };
        });
        setFiles((prev) => [...prev, ...previews].slice(0, 10));
    }, []);
```

# ════════════════════════════════════════════════════════════════════
# SECTION I — KONTRIBUSI SHOW (INLINE MEDIA)
# ════════════════════════════════════════════════════════════════════

Halaman detail konten milik user (di dashboard) — file media juga ditampilkan inline
menggunakan MediaPreview yang sama. Style tetap mengikuti AppLayout/shadcn.

## I.1 — UPDATE bagian File media di kontribusi/show.tsx
FILE: `resources/js/pages/kontribusi/show.tsx`

Tambahkan import di bagian atas:
```tsx
import MediaPreview from '@/components/media-preview';
```

CARI blok Card "File media" (mulai `{/* File media */}` sampai `</Card>`-nya):

```tsx
                        {/* File media */}
                        {konten.media_files && konten.media_files.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">File Media ({konten.media_files.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {konten.media_files.map((file) => (
                                        <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <MediaTypeIcon tipe={file.tipe} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{file.filename}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {file.ukuran_kb >= 1024 ? `${(file.ukuran_kb / 1024).toFixed(1)} MB` : `${file.ukuran_kb} KB`}
                                                </p>
                                            </div>
                                            {file.is_primary && <Badge variant="secondary" className="text-xs">Cover</Badge>}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
```

GANTI dengan (render inline via MediaPreview):

```tsx
                        {/* File media — INLINE: langsung tampil & bisa diputar */}
                        {konten.media_files && konten.media_files.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">File Media ({konten.media_files.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MediaPreview items={konten.media_files.map((f) => ({
                                        tipe: f.tipe,
                                        url: f.url,
                                        filename: f.filename,
                                        ukuran_kb: f.ukuran_kb,
                                        durasi_detik: f.durasi_detik,
                                    }))} />
                                </CardContent>
                            </Card>
                        )}
```

CATATAN: import `MediaTypeIcon` mungkin jadi tidak terpakai setelah ini. Jika lint
error "unused import", hapus baris `import MediaTypeIcon from '@/components/media-type-icon';`.

# ════════════════════════════════════════════════════════════════════
# SECTION J — TENTANG & KONTAK (STYLE BARU)
# ════════════════════════════════════════════════════════════════════

Kedua halaman ini sekarang berada dalam layout sidebar. Karena PublicLayout sudah
diganti, keduanya otomatis ikut sidebar. Yang perlu disesuaikan hanya isi (font Inter,
warna terakota, hapus styling Montserrat/cream). Karena keduanya membaca dari CMS
(SitePage), strukturnya tetap; cukup ganti class warna & font.

## J.1 — Sesuaikan tentang.tsx
FILE: `resources/js/pages/tentang.tsx`
ACTION: Ganti hero besar editorial dengan layout konten sederhana Light Gallery.
GANTI SELURUH ISI dengan:

```tsx
import PublicLayout from '@/layouts/public-layout';
import { Building } from 'lucide-react';

interface SitePage {
    key: string; title: string | null; subtitle: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}
interface Props { page: SitePage }

export default function Tentang({ page }: Props) {
    const c = page.content ?? {};

    return (
        <PublicLayout title={page.title ?? 'Tentang Kami'}>
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-orange-50">
                    <Building className="size-6 text-[#c2410c]" />
                </div>
                <h1 className="text-3xl font-bold leading-tight text-stone-900">{page.title ?? 'Tentang Budaya Sumsel'}</h1>
                <div className="mt-3 h-1 w-10 rounded bg-[#c2410c]" />

                {page.hero_image_url && (
                    <img src={page.hero_image_url} alt={page.title ?? ''} className="mt-6 w-full rounded-lg object-cover" />
                )}

                <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-stone-700">
                    {c.deskripsi
                        ? <p className="whitespace-pre-wrap">{c.deskripsi}</p>
                        : <p>Budaya Sumsel adalah platform dokumentasi dan pelestarian budaya digital untuk Sumatera Selatan. Setiap warga dapat berkontribusi mengunggah konten budaya dalam bentuk video, audio, foto, maupun artikel.</p>}
                </div>
            </div>
        </PublicLayout>
    );
}
```

## J.2 — Sesuaikan kontak.tsx
FILE: `resources/js/pages/kontak.tsx`
ACTION: GANTI SELURUH ISI dengan versi Light Gallery (form + info kontak):

```tsx
import PublicLayout from '@/layouts/public-layout';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

interface SitePage {
    key: string; title: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}
interface Props { page: SitePage }

export default function Kontak({ page }: Props) {
    const c = page.content ?? {};

    const items = [
        { icon: MapPin, label: 'Alamat', value: c.alamat ?? 'Palembang, Sumatera Selatan' },
        { icon: Phone, label: 'Telepon', value: c.telepon && c.telepon !== '-' ? c.telepon : null },
        { icon: Mail, label: 'Email', value: c.email ?? 'info@budayasumsel.id' },
        { icon: Clock, label: 'Jam Operasional', value: c.jam_operasional ?? 'Senin – Jumat, 08.00 – 17.00 WIB' },
    ].filter((x) => x.value);

    return (
        <PublicLayout title={page.title ?? 'Kontak'}>
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-orange-50">
                    <Mail className="size-6 text-[#c2410c]" />
                </div>
                <h1 className="text-3xl font-bold leading-tight text-stone-900">{page.title ?? 'Hubungi Kami'}</h1>
                <div className="mt-3 h-1 w-10 rounded bg-[#c2410c]" />

                <p className="mt-5 text-[15px] leading-relaxed text-stone-600">
                    Punya pertanyaan, saran, atau ingin berkolaborasi? Hubungi kami melalui informasi di bawah ini.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                        <div key={item.label} className="flex items-start gap-3 rounded-lg border border-black/[0.07] bg-white p-4">
                            <item.icon className="mt-0.5 size-5 shrink-0 text-[#c2410c]" />
                            <div>
                                <p className="text-sm font-semibold text-stone-900">{item.label}</p>
                                <p className="mt-0.5 text-sm text-stone-600">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
```

# ════════════════════════════════════════════════════════════════════
# SECTION K — VERIFIKASI
# ════════════════════════════════════════════════════════════════════

## K.1 — Pastikan komponen shadcn tersedia
Cek folder `resources/js/components/ui/`. Yang dibutuhkan Phase 2:
- sidebar.tsx (sudah ada — dipakai admin)
- dialog.tsx (untuk lightbox — jika belum: `npx shadcn@latest add dialog`)
- dropdown-menu.tsx (filter galeri — jika belum: `npx shadcn@latest add dropdown-menu`)
- avatar.tsx (top bar — jika belum: `npx shadcn@latest add avatar`)
- button.tsx, input.tsx (umumnya sudah ada)

## K.2 — Types
Pastikan `resources/js/types/index.d.ts` interface KontenBudaya punya:
- `first_video?: MediaFile`
- `primary_media?: MediaFile | null`
- `ratings_avg_skor?: number | null`
- `ratings_count?: number`
(Field-field ini sudah ditambahkan di Phase 1. Jika belum, tambahkan.)

## K.3 — Build & jalankan
```bash
npm run build
```

## K.4 — Test checklist
- [ ] Beranda menampilkan feed grid (bukan hero besar)
- [ ] Sidebar muncul di kiri; tombol trigger (atau Cmd/Ctrl+B) men-collapse jadi ikon
- [ ] State collapse sidebar tetap setelah refresh (cookie persistence)
- [ ] Di mobile, sidebar jadi drawer yang muncul dari kiri
- [ ] Tentang Kami & Kontak ada di bagian bawah sidebar
- [ ] Semua tombol/teks TERBACA di state default (tidak ada putih-di-atas-putih)
- [ ] Filter pill: state tidak aktif tetap terbaca (bg stone-100 + teks stone-600)
- [ ] Klik card video → halaman detail, video autoplay
- [ ] Klik card audio → bottom player muncul, bisa terus scroll feed sambil dengar
- [ ] Klik card foto/artikel → halaman detail
- [ ] Di halaman detail: SEMUA media tampil inline — gambar terlihat, video & audio bisa diputar tanpa klik
- [ ] Di halaman upload: setelah pilih file, preview langsung tampil (gambar/video/audio)
- [ ] Di kontribusi/show: media tampil inline
- [ ] Rating & komentar berfungsi di halaman detail
- [ ] Ikon semua dari lucide-react (konsisten dengan dashboard)
- [ ] Tidak ada TypeScript error saat build

## K.5 — Catatan integrasi
- Bottom player pakai `position: fixed` — `main` di PublicLayout sudah diberi `pb-24`
  agar konten tidak tertutup. Jika ada halaman yang kontennya tertutup player,
  cek padding bawah.
- AudioPlayerProvider membungkus seluruh public via PublicLayout, jadi `useAudioPlayer`
  hanya bisa dipakai di komponen yang dirender DI DALAM PublicLayout (KontenCard, dll).
  Jangan panggil useAudioPlayer di luar PublicLayout.
- Search bar di top bar saat ini belum disambungkan ke action — sambungkan ke
  `/galeri?search=...` jika ingin fungsional (opsional, di luar scope Phase 2 inti).
