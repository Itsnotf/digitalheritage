import MediaTypeIcon from '@/components/media-type-icon';
import StarRating from '@/components/star-rating';
import LevelBadge from '@/components/level-badge';
import KontenCard from '@/components/konten-card';
import PublicLayout from '@/layouts/public-layout';
import { Comment, KontenBudaya, MediaFile } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Eye, Send, Star } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { useEffect, useRef, useState } from 'react';

interface Props {
    konten: KontenBudaya & { ratings_count: number; ratings_avg_skor: number | null };
    relatedKonten: KontenBudaya[];
    userRating: number | null;
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

// ──────────────────────────────────────────────────────────────
// VideoSection — Plyr.js player dengan playlist multi-video
// ──────────────────────────────────────────────────────────────
function VideoSection({ videoFiles, autoplay = false }: { videoFiles: MediaFile[]; autoplay?: boolean }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Plyr | null>(null);
    const activeVideo = videoFiles[activeIndex];

    useEffect(() => {
        if (!videoRef.current || !activeVideo) return;

        playerRef.current?.destroy();

        playerRef.current = new Plyr(videoRef.current, {
            controls: [
                'play-large', 'play', 'progress', 'current-time',
                'duration', 'mute', 'volume', 'captions', 'fullscreen',
            ],
            resetOnEnd: false,
            fullscreen: { enabled: true, fallback: true, iosNative: false },
        });

        if (autoplay) {
            const t = setTimeout(() => playerRef.current?.play(), 400);
            return () => {
                clearTimeout(t);
                playerRef.current?.destroy();
            };
        }

        return () => { playerRef.current?.destroy(); };
    }, [activeIndex]);

    if (!activeVideo) return null;

    const formatDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <section className="bg-gray-950">
            {/* key={activeVideo.id} paksa React remount video element saat video berubah */}
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

            {/* Playlist tab switcher — tampil hanya jika ada lebih dari 1 video */}
            {videoFiles.length > 1 && (
                <div className="px-8 py-4 border-t border-white/6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span style={FONT} className="text-[9px] font-black uppercase tracking-widest text-gray-500 mr-3 shrink-0">
                            Video ({videoFiles.length})
                        </span>
                        {videoFiles.map((v, i) => (
                            <button
                                key={v.id}
                                onClick={() => setActiveIndex(i)}
                                style={FONT}
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

const aksiLabel: Record<string, string> = {
    approve: 'Disetujui', reject: 'Ditolak',
    user_revise: 'Memilih revisi', user_decline: 'Tidak direvisi',
};

function CommentItem({ comment, kontenId }: { comment: Comment; kontenId: string }) {
    const [showReply, setShowReply] = useState(false);
    const [reply, setReply] = useState('');
    const { auth } = usePage<any>().props;

    const submit = () => {
        if (!reply.trim()) return;
        router.post(`/galeri/${kontenId}/komentar`, { isi: reply, parent_id: comment.id }, {
            onSuccess: () => { setReply(''); setShowReply(false); },
        });
    };

    return (
        <div className="border-b border-gray-900/10 py-6">
            <div className="flex items-start gap-4">
                <div style={FONT} className="flex size-8 shrink-0 items-center justify-center bg-gray-900 text-[10px] font-black text-[#EDE8DC] uppercase">
                    {comment.user?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                        <span style={FONT} className="text-xs font-black uppercase tracking-wider text-gray-900">{comment.user?.name}</span>
                        <span style={FONT} className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{comment.isi}</p>
                    {auth?.user && (
                        <button onClick={() => setShowReply(!showReply)} style={FONT}
                            className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                            Balas
                        </button>
                    )}
                    {showReply && (
                        <div className="mt-3 flex gap-3">
                            <input value={reply} onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                placeholder="Tulis balasan..."
                                className="flex-1 border-b border-gray-900/30 bg-transparent py-2 text-sm outline-none focus:border-gray-900" />
                            <button onClick={submit} className="text-gray-900 hover:text-gray-600 transition-colors"><Send className="size-4" /></button>
                        </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4 pl-6 border-l border-gray-900/10">
                            {comment.replies.map((r) => (
                                <div key={r.id} className="flex gap-3">
                                    <div style={FONT} className="flex size-6 shrink-0 items-center justify-center bg-gray-200 text-[10px] font-black text-gray-700 uppercase">
                                        {r.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <span style={FONT} className="text-[10px] font-black uppercase tracking-wider text-gray-900">{r.user?.name}</span>
                                        <p className="mt-1 text-sm text-gray-600">{r.isi}</p>
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

    return (
        <PublicLayout title={konten.judul}>

            {/* ── Hero: Video Player atau Cover Image ── */}
            {(() => {
                const videoFiles = (konten.media_files ?? []).filter(f => f.tipe === 'video');
                const autoplay = typeof window !== 'undefined'
                    && new URLSearchParams(window.location.search).get('autoplay') === '1';

                if (videoFiles.length > 0) {
                    return <VideoSection videoFiles={videoFiles} autoplay={autoplay} />;
                }

                if (konten.cover_url) {
                    return (
                        <section className="h-[55vh] overflow-hidden bg-gray-800">
                            <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
                        </section>
                    );
                }

                return null;
            })()}

            {/* ── Article Header ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-16">
                    {/* Breadcrumb */}
                    <div style={FONT} className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <Link href="/" className="hover:text-gray-900 transition-colors">Beranda</Link>
                        <span>/</span>
                        <Link href="/galeri" className="hover:text-gray-900 transition-colors">Galeri</Link>
                        {konten.category && (
                            <>
                                <span>/</span>
                                <Link href={`/galeri?category_id=${konten.category_id}`} className="hover:text-gray-900 transition-colors">
                                    {konten.category.nama}
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                        {/* Title — spans 2 cols */}
                        <div className="lg:col-span-2">
                            {konten.category && (
                                <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                                    {konten.category.nama}
                                </p>
                            )}
                            <h1 style={FONT} className="text-5xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-6xl">
                                {konten.judul}
                            </h1>
                            <div className="mt-6 w-12 border-b-2 border-gray-900" />

                            {/* Meta */}
                            <div style={FONT} className="mt-6 flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="size-3" />
                                    {new Date(konten.approved_at ?? konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Eye className="size-3" /> {konten.view_count.toLocaleString('id-ID')} penayangan
                                </span>
                                {konten.wilayah && <span>{konten.wilayah.nama}</span>}
                                {avg && (
                                    <span className="flex items-center gap-1">
                                        <Star className="size-3 fill-amber-400 text-amber-400" />
                                        {avg} ({totalRatings})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Contributor — right col */}
                        <div className="border-l border-gray-900/10 pl-12 hidden lg:block">
                            <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Kontributor</p>
                            <div className="flex items-center gap-3">
                                <div style={FONT} className="flex size-10 shrink-0 items-center justify-center bg-gray-900 font-black text-[#EDE8DC]">
                                    {konten.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={FONT} className="text-xs font-black uppercase tracking-wider text-gray-900">{konten.user?.name}</p>
                                    {typeof konten.user?.approved_konten_count === 'number' && (
                                        <div className="mt-1"><LevelBadge approvedCount={konten.user.approved_konten_count} size="sm" /></div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {konten.tags && konten.tags.length > 0 && (
                                <div className="mt-6">
                                    <p style={FONT} className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Tag</p>
                                    <div className="flex flex-wrap gap-2">
                                        {konten.tags.map((tag) => (
                                            <Link key={tag.id} href={`/galeri?search=${encodeURIComponent(tag.nama)}`}
                                                style={FONT} className="border border-gray-900/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                                {tag.nama}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Konten body ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 pb-16">
                    <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
                        <div className="lg:col-span-2">

                            {/* Deskripsi */}
                            <div className="border-t border-gray-900/10 pt-10">
                                <p className="text-base leading-8 text-gray-700" style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: '1.9' }}>
                                    {konten.deskripsi}
                                </p>
                            </div>

                            {/* Media files */}
                            {konten.media_files && konten.media_files.length > 0 && (
                                <div className="mt-12 border-t border-gray-900/10 pt-10">
                                    <p style={FONT} className="mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        File Media ({konten.media_files.length})
                                    </p>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {konten.media_files.map((file) => (
                                            <a key={file.id} href={`/storage/${file.url}`} target="_blank" rel="noreferrer"
                                                className="group flex items-center gap-3 border border-gray-900/10 p-4 hover:bg-[#D9D4C8] transition-colors">
                                                <MediaTypeIcon tipe={file.tipe} size="sm" />
                                                <div className="min-w-0 flex-1">
                                                    <p style={FONT} className="truncate text-xs font-black uppercase tracking-wide text-gray-900 group-hover:text-gray-600">
                                                        {file.filename}
                                                    </p>
                                                    <p style={FONT} className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                        {file.tipe} · {file.ukuran_kb >= 1024 ? `${(file.ukuran_kb/1024).toFixed(1)}MB` : `${file.ukuran_kb}KB`}
                                                        {file.durasi_detik && ` · ${Math.floor(file.durasi_detik/60)}:${String(file.durasi_detik%60).padStart(2,'0')}`}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rating */}
                            <div className="mt-12 border-t border-gray-900/10 pt-10">
                                <p style={FONT} className="mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Beri Penilaian</p>
                                {auth?.user ? (
                                    konten.user_id !== auth.user.id ? (
                                        <div>
                                            <StarRating value={currentRating} onChange={submitRating} size="lg" />
                                            <p style={FONT} className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                                {currentRating > 0 ? `${currentRating} bintang — klik untuk mengubah` : 'Klik bintang untuk memberi nilai'}
                                            </p>
                                        </div>
                                    ) : (
                                        <p style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Tidak bisa menilai konten sendiri
                                        </p>
                                    )
                                ) : (
                                    <p style={FONT} className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                                        <Link href="/login" className="underline hover:text-gray-900">Masuk</Link> untuk memberi penilaian
                                    </p>
                                )}
                                {avg && totalRatings > 0 && (
                                    <div className="mt-4 flex items-center gap-4">
                                        <span style={FONT} className="text-4xl font-black text-gray-900">{avg}</span>
                                        <div>
                                            <StarRating value={Math.round(Number(avg))} readonly size="sm" />
                                            <p style={FONT} className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">dari {totalRatings} penilaian</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Komentar */}
                            <div className="mt-12 border-t border-gray-900/10 pt-10">
                                <p style={FONT} className="mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Komentar {visibleComments.length > 0 && `(${visibleComments.length})`}
                                </p>

                                {auth?.user ? (
                                    <div className="mb-8 flex gap-4">
                                        <div style={FONT} className="flex size-8 shrink-0 items-center justify-center bg-gray-900 text-[10px] font-black text-[#EDE8DC] uppercase">
                                            {auth.user.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                                                placeholder="Tulis komentar..."
                                                className="w-full resize-none border-b border-gray-900/30 bg-transparent py-2 text-sm outline-none focus:border-gray-900 transition-colors"
                                                style={{ fontFamily: "'Open Sans', sans-serif" }} />
                                            <div className="mt-3 flex justify-end">
                                                <button onClick={submitComment} disabled={!comment.trim()} style={FONT}
                                                    className="bg-gray-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] hover:bg-gray-700 disabled:opacity-40 transition-colors">
                                                    Kirim Komentar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={FONT} className="mb-8 text-xs font-semibold uppercase tracking-widest text-gray-500">
                                        <Link href="/login" className="underline hover:text-gray-900">Masuk</Link> untuk berkomentar
                                    </p>
                                )}

                                {visibleComments.length > 0
                                    ? visibleComments.map((c) => <CommentItem key={c.id} comment={c} kontenId={konten.slug} />)
                                    : <p style={FONT} className="py-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Belum ada komentar</p>
                                }
                            </div>
                        </div>

                        {/* Sidebar mobile tags */}
                        <div className="lg:hidden border-t border-gray-900/10 pt-8">
                            {konten.tags && konten.tags.length > 0 && (
                                <>
                                    <p style={FONT} className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Tag</p>
                                    <div className="flex flex-wrap gap-2">
                                        {konten.tags.map((tag) => (
                                            <Link key={tag.id} href={`/galeri?search=${encodeURIComponent(tag.nama)}`} style={FONT}
                                                className="border border-gray-900/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                                {tag.nama}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Related konten ── */}
            {relatedKonten.length > 0 && (
                <section className="border-t border-gray-900/10 bg-[#E5DFD2]">
                    <div className="mx-auto max-w-screen-xl px-8 py-16">
                        <div className="mb-10 border-b border-gray-900/10 pb-6">
                            <p style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Konten Terkait</p>
                            <h3 style={FONT} className="mt-1 text-3xl font-black uppercase tracking-tight text-gray-900">
                                {konten.category?.nama}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedKonten.map((r) => <KontenCard key={r.id} konten={r} />)}
                        </div>
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
