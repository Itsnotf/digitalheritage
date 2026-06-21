# CLAUDE CODE TODO — PHASE 5
# Budaya Sumsel — Perbaikan & Polish Halaman Detail Galeri
# ════════════════════════════════════════════════════════════════════

## RINGKASAN TUJUAN

Semua keputusan di TODO ini sudah final hasil diskusi dengan owner project —
JANGAN didesain ulang, JANGAN ditanyakan ulang. Enam perbaikan independen,
semua sudah ditulis & diverifikasi (`php -l`, `tsc --noEmit`, `eslint` — PASS,
0 error baru):

1. Fix bug video "kadang gak muncul" — root cause: `<source type="video/mp4">`
   di-hardcode, padahal upload juga terima webm/mov. Browser nolak mainkan
   source yang declared type-nya gak cocok sama isi file aslinya.
2. Bug yang sama persis ditemukan di Audio (`type="audio/mpeg"` hardcode,
   padahal wav/ogg/m4a juga valid) — sekalian dibenerin.
3. Sambungkan `?autoplay=1` (dari klik card video) → video di tab Video
   auto-play **muted** begitu halaman dibuka (browser modern cuma izinin
   autoplay kalau muted — ini bukan pilihan desain, ini keterbatasan browser).
4. Gambar full-screen: `object-contain` → `object-cover` (crop biar penuh
   layar, gak ada bar hitam, mirip Instagram Stories).
5. Strip kecil deskripsi (judul + 1 baris deskripsi) muncul di atas tab bar
   untuk Gambar/Video/PDF (BUKAN Audio) — klik strip itu buka Drawer panel
   Deskripsi yang sudah ada.
6. `KontenCard` audio: TETAP klik = langsung play (gak diubah), tambah link
   kecil "Lihat detail →" terpisah biar user bisa akses deskripsi/rating/
   komentar konten audio.

## ATURAN WAJIB
- Ikuti kode yang diberikan PERSIS — sudah final dan terverifikasi.
- JANGAN mengubah desain/fitur yang gak disebut di sini (warna, breakpoint,
  posisi elemen lain).
- HANYA sentuh file yang disebut di SECTION A–E.
- JANGAN install dependency baru.
- File ini independen dari Phase 6 (Surat Pernyataan) — gak ada file yang
  overlap antara dua TODO ini, jadi bisa dieksekusi dalam urutan apa pun
  (disarankan Phase 5 dulu karena lebih kecil & gampang ditest duluan).

## URUTAN EKSEKUSI
- SECTION A — media-preview.tsx (fix MIME video/audio, object-cover, prop autoplay)
- SECTION B — galeri/show.tsx (sambungkan autoplay, strip deskripsi)
- SECTION C — konten-card.tsx (link "Lihat detail" buat audio)
- SECTION D — kontribusi/show.tsx & konten/show.tsx (pass mime_type, fix kecil)
- SECTION E — Verifikasi

# ════════════════════════════════════════════════════════════════════
# SECTION A — media-preview.tsx
# ════════════════════════════════════════════════════════════════════

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
    mime_type?: string;
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

function VideoPlayer({ src, mimeType, autoplay = false }: { src: string; mimeType?: string; autoplay?: boolean }) {
    const ref = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        playerRef.current = new Plyr(ref.current, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
            fullscreen: { enabled: true, fallback: true, iosNative: false },
            autoplay,
            muted: autoplay,
        });
        return () => { playerRef.current?.destroy(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <video ref={ref} className="plyr-video w-full" controls playsInline muted={autoplay} autoPlay={autoplay}>
            {/* Tipe MIME asli dari file yang diupload — bukan hardcode, karena format yang diterima
                bukan cuma mp4 (webm & mov juga valid). Salah declare type bikin browser nolak mainkan
                sumbernya tanpa pesan error apa pun ke user. */}
            <source src={src} type={mimeType || 'video/mp4'} />
            Browser kamu tidak mendukung pemutaran video.
        </video>
    );
}

function AudioPlayer({ src, mimeType }: { src: string; mimeType?: string }) {
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
            {/* Sama seperti video — pakai mime_type asli, bukan hardcode 'audio/mpeg',
                karena wav/ogg/m4a juga format yang diterima saat upload. */}
            <source src={src} type={mimeType || 'audio/mpeg'} />
            Browser kamu tidak mendukung pemutaran audio.
        </audio>
    );
}

export function MediaPreviewItemView({
    item,
    showMeta = true,
    fullscreen = false,
    autoplay = false,
}: {
    item: MediaPreviewItem;
    showMeta?: boolean;
    fullscreen?: boolean;
    autoplay?: boolean;
}) {
    const src = resolveUrl(item);

    if (item.tipe === 'image') {
        if (fullscreen) {
            // object-cover: gambar di-crop biar penuh layar (gak ada bar hitam),
            // sengaja gak pakai object-contain lagi sesuai keputusan desain.
            return <img src={src} alt={item.filename} className="size-full object-cover" loading="lazy" />;
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
                    <VideoPlayer src={src} mimeType={item.mime_type} autoplay={autoplay} />
                </div>
            );
        }
        return (
            <div className="overflow-hidden rounded-lg">
                <VideoPlayer src={src} mimeType={item.mime_type} />
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
                <AudioPlayer src={src} mimeType={item.mime_type} />
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

CATATAN:
- `mime_type` di interface `MediaPreviewItem` OPSIONAL — kalau caller gak
  ngirim, fallback ke `'video/mp4'`/`'audio/mpeg'` (perilaku lama, gak ada
  caller yang rusak).
- Prop `autoplay` HANYA dipakai untuk tipe `video`, dan HANYA di mode
  `fullscreen`. JANGAN tambahkan autoplay ke audio.
- JANGAN tambahkan dependency `useAudioPlayer`/context apa pun ke file ini —
  komponen ini juga dipakai di admin (`konten/show.tsx`) yang gak dibungkus
  `AudioPlayerProvider`.

# ════════════════════════════════════════════════════════════════════
# SECTION B — galeri/show.tsx
# ════════════════════════════════════════════════════════════════════

Perubahan dari versi sebelumnya (Phase 4):
- Baca `?autoplay=1` sekali pas mount (`shouldAutoplay`), force tab awal ke
  'video' kalau query itu ada DAN konten punya tab video.
- Teruskan `mime_type` & `autoplay` ke `MediaPreviewItemView`.
- Cluster kiri-bawah direstruktur: sekarang ada strip deskripsi (di atas tab
  bar) untuk tab Gambar/Video/PDF, klik strip → `setActivePanel('deskripsi')`.

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
    AlignLeft,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Headphones,
    Image as ImageIcon,
    LucideIcon,
    MapPin,
    MessageCircle,
    Music,
    Pause,
    Play,
    Send,
    Star,
    Video,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    Drawer,
    DrawerContent,
    DrawerTitle,
} from '@/components/ui/drawer';

interface Props {
    konten: KontenBudaya & { ratings_count: number; ratings_avg_skor: number | null };
    relatedKonten: KontenBudaya[];
    userRating: number | null;
}

type ContentTab = 'deskripsi' | 'rating' | 'komentar';

interface TabConfig<T extends string> {
    key: T;
    icon: LucideIcon;
    label: string;
}

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

        router.post(
            `/galeri/${kontenSlug}/komentar`,
            {
                isi: reply,
                parent_id: comment.id,
            },
            {
                onSuccess: () => {
                    setReply('');
                    setShowReply(false);
                },
            },
        );
    };

    return (
        <div className="border-b border-black/[0.07] py-4">
            <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                            {comment.user?.name}
                        </span>

                        <span className="text-xs text-stone-400">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    <p className="text-sm leading-relaxed text-stone-600">
                        {comment.isi}
                    </p>

                    {auth?.user && (
                        <button
                            onClick={() => setShowReply(!showReply)}
                            className="mt-2 text-xs font-semibold text-stone-400 transition-colors hover:text-[#c2410c]"
                        >
                            {showReply ? 'Batal' : 'Balas'}
                        </button>
                    )}

                    {showReply && (
                        <div className="mt-2 flex gap-2">
                            <input
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                placeholder="Tulis balasan..."
                                className="flex-1 border-b border-black/20 bg-transparent py-1.5 text-sm outline-none focus:border-[#c2410c]"
                            />

                            <button
                                onClick={submit}
                                className="text-stone-600 transition-colors hover:text-[#c2410c]"
                            >
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
                                        <span className="text-xs font-semibold text-stone-900">
                                            {r.user?.name}
                                        </span>

                                        <p className="mt-0.5 text-sm text-stone-600">
                                            {r.isi}
                                        </p>
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

function GaleriShowViewer({ konten, relatedKonten, userRating }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { current, isPlaying, play, toggle } = useAudioPlayer();

    // Dibaca sekali pas mount — true kalau halaman ini dibuka dari klik card video (?autoplay=1)
    const [shouldAutoplay] = useState(() => {
        if (typeof window === 'undefined') return false;
        return new URLSearchParams(window.location.search).get('autoplay') === '1';
    });

    const [comment, setComment] = useState('');
    const [currentRating, setCurrentRating] = useState(userRating ?? 0);

    const mediaByTipe = useMemo(() => {
        const groups: Partial<Record<MediaTipe, MediaFile[]>> = {};

        (konten.media_files ?? []).forEach((f) => {
            (groups[f.tipe] ??= []).push(f);
        });

        Object.values(groups).forEach((arr) => {
            arr?.sort((a, b) => a.urutan - b.urutan);
        });

        return groups;
    }, [konten.media_files]);

    const availableMediaTabs = MEDIA_TABS.filter(
        (t) => (mediaByTipe[t.key]?.length ?? 0) > 0,
    );

    const defaultMediaTab = useMemo<MediaTipe | null>(() => {
        if (shouldAutoplay && availableMediaTabs.some((t) => t.key === 'video')) {
            return 'video';
        }

        const primary = (konten.media_files ?? []).find((f) => f.is_primary);

        if (primary && availableMediaTabs.some((t) => t.key === primary.tipe)) {
            return primary.tipe;
        }

        return availableMediaTabs[0]?.key ?? null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [konten.media_files]);

    const [activeMediaTab, setActiveMediaTab] = useState<MediaTipe | null>(defaultMediaTab);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [activePanel, setActivePanel] = useState<ContentTab | null>(null);

    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const totalRatings = konten.ratings_count ?? 0;
    const visibleComments = (konten.comments ?? []).filter(
        (c: Comment) => c.status === 'aktif',
    );

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

        router.post(
            `/galeri/${konten.slug}/komentar`,
            { isi: comment },
            { onSuccess: () => setComment('') },
        );
    };

    const submitRating = (skor: number) => {
        setCurrentRating(skor);

        router.post(
            `/galeri/${konten.slug}/rating`,
            { skor },
            { preserveScroll: true },
        );
    };

    const audioOffset = current ? 76 : 0;

    const activeFiles = activeMediaTab ? mediaByTipe[activeMediaTab] ?? [] : [];
    const showCarouselNav = activeFiles.length > 1 && activeMediaTab !== 'document';

    const activePanelLabel =
        CONTENT_TABS.find((tab) => tab.key === activePanel)?.label ?? 'Panel konten';

    // Strip kecil deskripsi cuma muncul di Gambar/Video/PDF — audio punya tampilan sendiri
    const showDescPeek = activeMediaTab === 'image' || activeMediaTab === 'video' || activeMediaTab === 'document';

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
                        {konten.cover_url ? (
                            <img
                                src={konten.cover_url}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            <Music className="size-10 text-white/70" />
                        )}
                    </div>

                    <div>
                        <p className="max-w-xs truncate text-sm font-medium text-white">
                            {file.filename}
                        </p>

                        {file.durasi_detik && (
                            <p className="mt-1 text-xs text-white/50">
                                {formatDur(file.durasi_detik)}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() =>
                            isThisPlaying
                                ? toggle()
                                : play({
                                      judul: konten.judul,
                                      url: file.url,
                                      user: konten.user?.name,
                                      wilayah: konten.wilayah?.nama,
                                      durasi_detik: file.durasi_detik,
                                      cover_url: konten.cover_url,
                                  })
                        }
                        className="flex size-14 items-center justify-center rounded-full bg-[#c2410c] text-white transition-transform hover:scale-105"
                        aria-label={isThisPlaying ? 'Jeda' : 'Putar'}
                    >
                        {isThisPlaying ? (
                            <Pause className="size-6" />
                        ) : (
                            <Play className="ml-0.5 size-6" />
                        )}
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
                    <iframe
                        src={src}
                        title={file.filename}
                        className="flex-1"
                    />

                    <div className="flex items-center justify-between border-t border-black/10 px-4 py-2 text-xs text-stone-500">
                        <span className="truncate">{file.filename}</span>

                        <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 font-semibold text-[#c2410c] hover:underline"
                        >
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
                item={{
                    tipe: file.tipe,
                    url: file.url,
                    filename: file.filename,
                    mime_type: file.mime_type,
                    ukuran_kb: file.ukuran_kb,
                    durasi_detik: file.durasi_detik,
                }}
                showMeta={false}
                fullscreen
                autoplay={shouldAutoplay && activeMediaTab === 'video'}
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

                        <h1 className="mt-3 text-xl font-bold leading-tight text-stone-900 sm:text-2xl">
                            {konten.judul}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="size-4" />
                                {new Date(konten.approved_at ?? konten.created_at).toLocaleDateString(
                                    'id-ID',
                                    {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    },
                                )}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <Eye className="size-4" />
                                {konten.view_count.toLocaleString('id-ID')} dilihat
                            </span>

                            {konten.wilayah && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="size-4" />
                                    {konten.wilayah.nama}
                                </span>
                            )}

                            {avg && (
                                <span className="flex items-center gap-1">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    {avg} ({totalRatings})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-black/[0.07] pt-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                            {konten.user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-stone-900">
                                {konten.user?.name}
                            </p>

                            {typeof konten.user?.approved_konten_count === 'number' && (
                                <div className="mt-0.5">
                                    <LevelBadge
                                        approvedCount={konten.user.approved_konten_count}
                                        size="sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="whitespace-pre-wrap border-t border-black/[0.07] pt-5 text-[15px] leading-relaxed text-stone-700">
                        {konten.deskripsi}
                    </p>

                    {konten.tags && konten.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {konten.tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/galeri?search=${encodeURIComponent(tag.nama)}`}
                                    className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-[#c2410c] hover:text-[#c2410c]"
                                >
                                    #{tag.nama}
                                </Link>
                            ))}
                        </div>
                    )}

                    {relatedKonten.length > 0 && (
                        <div className="border-t border-black/[0.07] pt-5">
                            <p className="mb-4 text-sm font-semibold text-stone-900">
                                Konten Terkait
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {relatedKonten.map((r) => (
                                    <KontenCard
                                        key={r.id}
                                        konten={r}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activePanel === 'rating') {
            return (
                <div>
                    <p className="mb-3 text-sm font-semibold text-stone-900">
                        Beri Penilaian
                    </p>

                    {auth?.user ? (
                        konten.user_id !== auth.user.id ? (
                            <div>
                                <StarRating
                                    value={currentRating}
                                    onChange={submitRating}
                                    size="lg"
                                />

                                <p className="mt-2 text-xs text-stone-400">
                                    {currentRating > 0
                                        ? `${currentRating} bintang — klik untuk mengubah`
                                        : 'Klik bintang untuk memberi nilai'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400">
                                Tidak bisa menilai konten sendiri
                            </p>
                        )
                    ) : (
                        <p className="text-sm text-stone-600">
                            <Link
                                href="/login"
                                className="font-semibold text-[#c2410c] underline"
                            >
                                Masuk
                            </Link>{' '}
                            untuk memberi penilaian
                        </p>
                    )}

                    {avg && totalRatings > 0 && (
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-3xl font-bold text-stone-900">
                                {avg}
                            </span>

                            <div>
                                <StarRating
                                    value={Math.round(Number(avg))}
                                    readonly
                                    size="sm"
                                />

                                <p className="mt-0.5 text-xs text-stone-400">
                                    dari {totalRatings} penilaian
                                </p>
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
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    placeholder="Tulis komentar..."
                                    className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#c2410c]"
                                />

                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={submitComment}
                                        disabled={!comment.trim()}
                                        className="rounded-lg bg-[#c2410c] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#9a330a] disabled:opacity-40"
                                    >
                                        Kirim Komentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-6 text-sm text-stone-500">
                            <Link
                                href="/login"
                                className="font-semibold text-[#c2410c] underline"
                            >
                                Masuk
                            </Link>{' '}
                            untuk berkomentar
                        </p>
                    )}

                    {visibleComments.length > 0 ? (
                        visibleComments.map((c: Comment) => (
                            <CommentItem
                                key={c.id}
                                comment={c}
                                kontenSlug={konten.slug}
                            />
                        ))
                    ) : (
                        <p className="py-8 text-center text-sm text-stone-400">
                            Belum ada komentar
                        </p>
                    )}
                </div>
            );
        }

        return null;
    }

    return (
        <div className="relative h-full w-full overflow-hidden bg-stone-950">
            {/* Media full-screen */}
            <div className="absolute inset-0 flex items-center justify-center">
                {renderMediaCenter()}
            </div>

            {/* Navigasi prev/next, kalau ada >1 file di tipe yang sama */}
            {showCarouselNav && (
                <>
                    <button
                        onClick={() =>
                            setMediaIndex((i) => (i - 1 + activeFiles.length) % activeFiles.length)
                        }
                        className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                        aria-label="Sebelumnya"
                    >
                        <ChevronLeft className="size-5" />
                    </button>

                    <button
                        onClick={() => setMediaIndex((i) => (i + 1) % activeFiles.length)}
                        className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                        aria-label="Berikutnya"
                    >
                        <ChevronRight className="size-5" />
                    </button>

                    <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white">
                        {mediaIndex + 1} / {activeFiles.length}
                    </span>
                </>
            )}

            {/* Strip deskripsi + tab bar kiri-bawah */}
            <div
                className="absolute inset-x-3 z-20 flex flex-col items-start gap-2 transition-[bottom] duration-200"
                style={{ bottom: 14 + audioOffset }}
            >
                {showDescPeek && (
                    <button
                        onClick={() => setActivePanel('deskripsi')}
                        className="max-w-[78%] rounded-xl bg-black/45 px-3 py-2 text-left backdrop-blur-sm transition-colors hover:bg-black/55"
                    >
                        <p className="truncate text-xs font-semibold text-white">{konten.judul}</p>
                        <p className="line-clamp-1 text-xs text-white/70">{konten.deskripsi}</p>
                    </button>
                )}

                <div className="flex items-center gap-1 rounded-full bg-black/55 p-1.5">
                    {availableMediaTabs.map((tab) => {
                        const isActive = activeMediaTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => selectMediaTab(tab.key)}
                                aria-label={tab.label}
                                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                                    isActive
                                        ? 'bg-[#c2410c] text-white'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <tab.icon className="size-4" />
                            </button>
                        );
                    })}

                    {availableMediaTabs.length > 0 && (
                        <span className="mx-0.5 h-5 w-px bg-white/20" />
                    )}

                    {CONTENT_TABS.map((tab) => {
                        const isActive = activePanel === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => togglePanel(tab.key)}
                                aria-label={tab.label}
                                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                                    isActive
                                        ? 'bg-[#c2410c] text-white'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                <tab.icon className="size-4" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Drawer konten */}
            <Drawer
                open={!!activePanel}
                onOpenChange={(open) => {
                    if (!open) {
                        setActivePanel(null);
                    }
                }}
            >
                <DrawerContent
                    className="max-h-[70dvh] overflow-hidden border-0 bg-white p-0"
                    style={{ bottom: audioOffset }}
                >
                    <DrawerTitle className="sr-only">
                        {activePanelLabel}
                    </DrawerTitle>

                    <div className="mx-auto flex max-h-[70dvh] w-full max-w-2xl flex-col overflow-hidden">
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-5">
                            {renderPanel()}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default function GaleriShow({ konten, relatedKonten, userRating }: Props) {
    const breadcrumbs = [
        { title: 'Beranda', href: '/' },
        { title: 'Jelajah', href: '/galeri' },
        { title: konten.judul, href: `/galeri/${konten.slug}` },
    ];

    return (
        <PublicLayout
            title={konten.judul}
            breadcrumbs={breadcrumbs}
            fullBleed
        >
            <GaleriShowViewer
                konten={konten}
                relatedKonten={relatedKonten}
                userRating={userRating}
            />
        </PublicLayout>
    );
}
```

JANGAN lakukan ini:
- JANGAN ubah offset audio (`audioOffset = current ? 76 : 0`) — itu udah pas
  buat ngehindarin BottomAudioPlayer.
- JANGAN tambahkan strip deskripsi buat tab Audio — disengaja dikecualikan
  (`showDescPeek` cuma true untuk image/video/document).
- JANGAN ubah perilaku: switch tab re-autoplay video kalau balik ke tab video
  dan `shouldAutoplay` masih true — ini perilaku yang diterima, bukan bug.

# ════════════════════════════════════════════════════════════════════
# SECTION C — konten-card.tsx
# ════════════════════════════════════════════════════════════════════

Tambah link kecil "Lihat detail →" KHUSUS untuk card audio, di dalam `meta`
(bukan di luar `cardInner`, biar tinggi card tetap konsisten dengan card
video/gambar di grid yang sama). `stopPropagation` WAJIB ada di onClick link
ini — tanpa itu, klik link bakal ke-bubble ke parent `onClick` yang muter
audio, jadi user klik link malah ke-trigger play DAN navigasi bersamaan.

FILE: `resources/js/components/konten-card.tsx`
ACTION: EDIT TARGETED

Cari blok ini (persis, di akhir komponen `meta`):

```tsx
                {avg && (
                    <>
                        <span className="text-stone-300">·</span>

                        <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                            <Star className="size-3 fill-current" />
                            {avg}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
```

Ganti jadi:

```tsx
                {avg && (
                    <>
                        <span className="text-stone-300">·</span>

                        <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                            <Star className="size-3 fill-current" />
                            {avg}
                        </span>
                    </>
                )}
            </div>

            {tipe === 'audio' && (
                <Link
                    href={`/galeri/${konten.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 text-[11px] font-semibold text-stone-400 transition-colors hover:text-[#c2410c]"
                >
                    Lihat detail →
                </Link>
            )}
        </div>
    );
```

`Link` sudah di-import di file ini (`import { Link } from '@inertiajs/react';`),
JANGAN tambah import baru. JANGAN ubah perilaku klik utama card audio — tetap
langsung `play()`, link ini cuma tambahan terpisah.

# ════════════════════════════════════════════════════════════════════
# SECTION D — kontribusi/show.tsx & konten/show.tsx (fix mime_type)
# ════════════════════════════════════════════════════════════════════

Kedua halaman ini juga manggil `MediaPreview` dengan pola yang sama, kena
bug MIME yang sama (Section A). Cukup tambah 1 baris `mime_type` di masing-
masing mapping-nya.

## D.1 — kontribusi/show.tsx
FILE: `resources/js/pages/kontribusi/show.tsx`
ACTION: EDIT TARGETED

Cari blok ini (persis):

```tsx
                                    <MediaPreview items={konten.media_files.map((f) => ({
                                        tipe: f.tipe as 'image' | 'video' | 'audio' | 'document',
                                        url: f.url,
                                        filename: f.filename,
                                        ukuran_kb: f.ukuran_kb,
                                        durasi_detik: f.durasi_detik,
                                    }))} />
```

Ganti jadi:

```tsx
                                    <MediaPreview items={konten.media_files.map((f) => ({
                                        tipe: f.tipe as 'image' | 'video' | 'audio' | 'document',
                                        url: f.url,
                                        filename: f.filename,
                                        mime_type: f.mime_type,
                                        ukuran_kb: f.ukuran_kb,
                                        durasi_detik: f.durasi_detik,
                                    }))} />
```

## D.2 — konten/show.tsx
FILE: `resources/js/pages/konten/show.tsx`
ACTION: EDIT TARGETED

Cari blok yang PERSIS SAMA seperti di atas (ada di file ini juga), ganti
dengan cara yang sama — tambah baris `mime_type: f.mime_type,`.

# ════════════════════════════════════════════════════════════════════
# SECTION E — VERIFIKASI
# ════════════════════════════════════════════════════════════════════

## E.1 — Type check & lint
```bash
npm run types
npx eslint resources/js/pages/galeri/show.tsx resources/js/components/media-preview.tsx resources/js/components/konten-card.tsx resources/js/pages/kontribusi/show.tsx resources/js/pages/konten/show.tsx
```
HARUS 0 error baru dari file-file di atas. Total error `tsc` keseluruhan
HARUS tetap 38 (baseline gak berubah — semua error itu modul Wayfinder yang
belum digenerate, bukan bug, JANGAN diperbaiki).

## E.2 — Build
```bash
npm run build
```

## E.3 — Test manual di browser
- [ ] Upload/cek konten video format WEBM atau MOV — videonya HARUS muncul &
  bisa diputar (sebelumnya blank)
- [ ] Sama buat audio format WAV/OGG/M4A
- [ ] Klik card video di galeri → halaman detail kebuka, video langsung play
  TAPI MUTED, ada tombol unmute di kontrol Plyr
- [ ] Buka tab Gambar di halaman detail — gambar penuh layar, gak ada bar
  hitam di kiri-kanan (boleh sedikit terpotong kalau rasio beda jauh)
- [ ] Di tab Gambar/Video/PDF — ada strip kecil judul+deskripsi di atas tab
  bar, klik strip itu buka panel Deskripsi
- [ ] Di tab Audio — strip deskripsi itu TIDAK muncul
- [ ] Card audio di galeri — klik tetap langsung muter audio; ada link kecil
  "Lihat detail →" di card, klik link itu navigasi ke halaman detail TANPA
  ikut muter audio

## E.4 — Kalau ada yang gagal
STOP, jangan improvisasi sendiri. Laporkan ke user persis test mana yang
gagal dan kondisinya.

# ════════════════════════════════════════════════════════════════════
# LOG PERUBAHAN — dieksekusi 2026-06-22
# ════════════════════════════════════════════════════════════════════

## Status: SELESAI ✓

Semua 5 file diubah sesuai instruksi. `tsc --noEmit` → 0 error.

### SECTION A — media-preview.tsx (GANTI TOTAL)
- Tambah `mime_type?: string` ke interface `MediaPreviewItem`
- Tambah prop `mimeType?: string` dan `autoplay?: boolean` ke `VideoPlayer`
- Tambah prop `mimeType?: string` ke `AudioPlayer`
- `<source type>` video: dari hardcode `"video/mp4"` → `mimeType || 'video/mp4'`
- `<source type>` audio: dari hardcode `"audio/mpeg"` → `mimeType || 'audio/mpeg'`
- Image fullscreen: dari `max-h-full max-w-full object-contain` dalam div → `size-full object-cover` langsung di `<img>`
- Tambah prop `autoplay?: boolean` ke `MediaPreviewItemView`, diteruskan ke `VideoPlayer` (hanya di mode fullscreen)

### SECTION B — galeri/show.tsx (GANTI TOTAL)
- Tambah `shouldAutoplay` state (baca `?autoplay=1` sekali saat mount)
- `defaultMediaTab`: force ke `'video'` kalau `shouldAutoplay && ada tab video`
- Tambah `showDescPeek` (true untuk image/video/document, false untuk audio)
- Restruktur cluster kiri-bawah: dari div tunggal flat → `flex-col` dengan strip deskripsi di atas tab bar
- Strip deskripsi: `button` klik → `setActivePanel('deskripsi')`
- `MediaPreviewItemView` call: tambah `mime_type: file.mime_type` dan `autoplay={shouldAutoplay && activeMediaTab === 'video'}`

### SECTION C — konten-card.tsx (EDIT TARGETED)
- Tambah link "Lihat detail →" di dalam `meta`, khusus untuk `tipe === 'audio'`
- `onClick={(e) => e.stopPropagation()}` untuk mencegah bubble ke parent `play()` handler
- Menggunakan `Link` yang sudah di-import dari `@inertiajs/react`

### SECTION D.1 — kontribusi/show.tsx (EDIT TARGETED)
- Tambah `mime_type: f.mime_type,` di mapping `MediaPreview items`

### SECTION D.2 — konten/show.tsx (EDIT TARGETED)
- Tambah `mime_type: f.mime_type,` di mapping `MediaPreview items`

### Verifikasi E.1
- `npm run types` (`tsc --noEmit`): **0 error** (Wayfinder sudah di-generate, baseline 0)
- IDE diagnostic stale (error `mime_type` di galeri/show.tsx) hilang setelah TS server reload

