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
