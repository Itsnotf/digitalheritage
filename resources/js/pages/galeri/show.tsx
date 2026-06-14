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

    const visibleComments = (konten.comments ?? []).filter((c: Comment) => c.status === 'aktif');

    const previewItems = (konten.media_files ?? []).map((f) => ({
        tipe: f.tipe as 'image' | 'video' | 'audio' | 'document',
        url: f.url,
        filename: f.filename,
        ukuran_kb: f.ukuran_kb,
        durasi_detik: f.durasi_detik,
    }));

    const breadcrumbs = [
        { title: 'Beranda', href: '/' },
        { title: 'Jelajah', href: '/galeri' },
        { title: konten.judul, href: `/galeri/${konten.slug}` },
    ];

    return (
        <PublicLayout title={konten.judul} breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

                <Link href="/galeri" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-stone-500 transition-colors hover:text-[#c2410c]">
                    <ChevronLeft className="size-4" /> Jelajah
                </Link>

                {/* MEDIA INLINE */}
                <div className="mb-6">
                    <MediaPreview items={previewItems} showMeta={false} />
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
                        ? visibleComments.map((c: Comment) => <CommentItem key={c.id} comment={c} kontenSlug={konten.slug} />)
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
