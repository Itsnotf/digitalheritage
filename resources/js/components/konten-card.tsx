import { KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';
import { Eye, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    konten: KontenBudaya & { ratings_avg_skor?: number | null; ratings_count?: number };
    className?: string;
    variant?: 'default' | 'large';
}

export default function KontenCard({ konten, className, variant = 'default' }: Props) {
    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;

    return (
        <Link href={`/galeri/${konten.slug}`} className={cn('group block', className)}>
            {/* Thumbnail — no rounded corners, flat */}
            <div className={cn('overflow-hidden bg-gray-200 relative', variant === 'large' ? 'aspect-[4/3]' : 'aspect-[16/9]')}>
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
                {/* Category — top left, no pill style */}
                {konten.category && (
                    <span style={{ fontFamily: "'Montserrat', sans-serif" }}
                        className="absolute top-0 left-0 bg-gray-900 text-[#EDE8DC] text-[10px] font-black uppercase tracking-widest px-3 py-1.5">
                        {konten.category.nama}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="pt-4">
                {/* Title */}
                <h3 style={{ fontFamily: "'Montserrat', sans-serif" }}
                    className={cn(
                        'font-bold uppercase leading-tight text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2',
                        variant === 'large' ? 'text-xl' : 'text-base'
                    )}>
                    {konten.judul}
                </h3>

                {/* Meta */}
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
                            <Eye className="size-3" />{konten.view_count}
                        </span>
                    </div>
                </div>

                {/* Contributor */}
                <p className="mt-1.5 text-xs text-gray-400 uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {konten.user?.name}
                </p>
            </div>
        </Link>
    );
}
