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

    // Default & large variant — editorial/galeri mode
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

                {/* Play overlay jika konten punya video */}
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
