import { useAudioPlayer } from '@/contexts/audio-player-context';
import { KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';
import { Eye, FileText, Image as ImageIcon, Music, Play, Star, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    konten: KontenBudaya & { ratings_avg_skor?: number | null };
    previewSeconds?: number;
}

function tipeKonten(k: KontenBudaya): 'video' | 'audio' | 'image' | 'document' {
    if (k.first_video) return 'video';

    const pm = k.primary_media?.tipe;
    if (pm === 'video' || pm === 'audio' || pm === 'image') return pm;

    const first = k.media_files?.[0]?.tipe;
    if (first === 'video' || first === 'audio' || first === 'image') return first;

    return 'document';
}

function formatDur(s?: number | null): string {
    if (!s) return '';
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Only render <img> for actual image files — guard against cover_url pointing to video/audio
function isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(url);
}

export default function KontenCard({ konten, previewSeconds = 4 }: Props) {
    const { play } = useAudioPlayer();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const timerRef = useRef<number | null>(null);

    const [isVideoPreviewing, setIsVideoPreviewing] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    const tipe = tipeKonten(konten);

    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const initial = konten.user?.name?.charAt(0).toUpperCase() ?? '?';

    const videoFile =
        konten.first_video ??
        (konten.primary_media?.tipe === 'video' ? konten.primary_media : undefined) ??
        konten.media_files?.find((f) => f.tipe === 'video');

    const audioFile =
        konten.primary_media?.tipe === 'audio'
            ? konten.primary_media
            : konten.media_files?.find((f) => f.tipe === 'audio');

    const durasi = videoFile?.durasi_detik ?? audioFile?.durasi_detik ?? konten.primary_media?.durasi_detik;

    const coverSrc = konten.cover_url && isImageUrl(konten.cover_url) ? konten.cover_url : null;
    const videoSrc = videoFile?.url ?? null;
    const canPreviewVideo = tipe === 'video' && !!videoSrc;

    const typeLabel =
        tipe === 'video'
            ? 'Video'
            : tipe === 'audio'
              ? 'Audio'
              : tipe === 'image'
                ? 'Foto'
                : 'Artikel';

    const placeholderClass =
        tipe === 'video'
            ? 'bg-gradient-to-br from-stone-700 to-stone-950'
            : tipe === 'audio'
              ? 'bg-gradient-to-br from-[#7c2d12] via-stone-800 to-stone-950'
              : tipe === 'image'
                ? 'bg-stone-200'
                : 'bg-stone-100';

    const clearPreviewTimer = () => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const stopVideoPreview = () => {
        clearPreviewTimer();

        const video = videoRef.current;
        if (!video) return;

        video.pause();

        try {
            video.currentTime = 0;
        } catch {
            // currentTime can fail if metadata is not loaded yet
        }

        setIsVideoPreviewing(false);
        setIsVideoLoading(false);
    };

    const startVideoPreview = async () => {
        if (!canPreviewVideo) return;

        const video = videoRef.current;
        if (!video) return;

        clearPreviewTimer();

        try {
            setIsVideoLoading(true);
            setIsVideoPreviewing(true);

            video.muted = true;
            video.playsInline = true;

            try {
                video.currentTime = 0;
            } catch {
                // ignore when metadata is not ready
            }

            await video.play();

            setIsVideoLoading(false);

            timerRef.current = window.setTimeout(() => {
                stopVideoPreview();
            }, previewSeconds * 1000);
        } catch {
            setIsVideoPreviewing(false);
            setIsVideoLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            clearPreviewTimer();

            const video = videoRef.current;
            if (video) {
                video.pause();
            }
        };
    }, []);

    const thumb = (
        <div className="relative aspect-video overflow-hidden bg-stone-200">
            {canPreviewVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        muted
                        playsInline
                        preload="metadata"
                        poster={coverSrc ?? undefined}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {coverSrc && !isVideoPreviewing && (
                        <img
                            src={coverSrc}
                            alt={konten.judul}
                            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}
                </>
            ) : coverSrc ? (
                <img
                    src={coverSrc}
                    alt={konten.judul}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className={`flex size-full flex-col items-center justify-center gap-1.5 ${placeholderClass}`}>
                    {tipe === 'video' && <Play className="size-8 text-white/70" />}
                    {tipe === 'audio' && <Music className="size-8 text-white/70" />}
                    {tipe === 'image' && <ImageIcon className="size-8 text-stone-400" />}
                    {tipe === 'document' && <FileText className="size-8 text-stone-400" />}

                    {konten.category && (tipe === 'video' || tipe === 'audio') && (
                        <span className="max-w-[80%] truncate text-[10px] font-semibold uppercase tracking-wider text-white/50">
                            {konten.category.nama}
                        </span>
                    )}
                </div>
            )}

            {/* Overlay khusus video/audio */}
            {(tipe === 'video' || tipe === 'audio') && (
                <>
                    <div
                        className={
                            tipe === 'audio'
                                ? 'absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent'
                                : 'absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent'
                        }
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className={`flex size-11 items-center justify-center rounded-full bg-black/55 backdrop-blur-sm transition-opacity duration-200 ${
                                isVideoPreviewing ? 'opacity-0' : 'opacity-100'
                            }`}
                        >
                            {tipe === 'audio' ? (
                                <Music className="size-5 text-white" />
                            ) : (
                                <Play className="ml-0.5 size-5 fill-white text-white" />
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Overlay saat video sedang preview */}
            {canPreviewVideo && isVideoPreviewing && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            )}

            {/* Badge kategori */}
            {konten.category && (
                <span className="absolute left-2 top-2 max-w-[75%] truncate rounded-md bg-white/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm backdrop-blur-sm">
                    {konten.category.nama}
                </span>
            )}

            {/* Badge loading / preview */}
            {isVideoLoading && (
                <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Loading...
                </span>
            )}

            {isVideoPreviewing && !isVideoLoading && (
                <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Preview
                </span>
            )}

            {/* Badge tipe / durasi */}
            {durasi ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    {formatDur(durasi)}
                </span>
            ) : (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {tipe === 'video' && <Video className="size-3" />}
                    {tipe === 'audio' && <Music className="size-3" />}
                    {tipe === 'image' && <ImageIcon className="size-3" />}
                    {tipe === 'document' && <FileText className="size-3" />}
                    {typeLabel}
                </span>
            )}
        </div>
    );

    const meta = (
        <div className="flex flex-1 flex-col px-2 pt-2.5">
            <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-snug text-stone-900 transition-colors group-hover:text-[#c2410c]">
                {konten.judul}
            </h3>

            <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px]">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[8px] font-bold text-orange-700">
                    {initial}
                </div>

                <span className="min-w-0 flex-1 truncate font-medium text-stone-500">
                    {konten.wilayah?.nama ?? 'Wilayah tidak tersedia'}
                </span>

                <span className="text-stone-300">·</span>

                <span className="flex shrink-0 items-center gap-0.5 text-stone-400">
                    <Eye className="size-3" />
                    {konten.view_count.toLocaleString('id-ID')}
                </span>

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

    const cardInner = (
        <div
            onMouseEnter={startVideoPreview}
            onMouseLeave={stopVideoPreview}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white transition-colors hover:border-black/[0.16]"
        >
            {thumb}
            {meta}
            <div className="h-2 shrink-0" />
        </div>
    );

    if (tipe === 'audio') {
        return (
            <div
                className="h-full"
                onClick={() =>
                    audioFile &&
                    play({
                        judul: konten.judul,
                        url: audioFile.url,
                        user: konten.user?.name,
                        wilayah: konten.wilayah?.nama,
                        durasi_detik: audioFile.durasi_detik,
                        cover_url: konten.cover_url,
                    })
                }
            >
                {cardInner}
            </div>
        );
    }

    const href = tipe === 'video' ? `/galeri/${konten.slug}?autoplay=1` : `/galeri/${konten.slug}`;

    return (
        <Link href={href} className="block h-full">
            {cardInner}
        </Link>
    );
}
