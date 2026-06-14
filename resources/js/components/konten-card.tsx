import { useAudioPlayer } from '@/contexts/audio-player-context';
import { KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';
import { Eye, FileText, Image as ImageIcon, Music, Play, Star } from 'lucide-react';

interface Props {
    konten: KontenBudaya & { ratings_avg_skor?: number | null };
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

export default function KontenCard({ konten }: Props) {
    const { play } = useAudioPlayer();
    const tipe = tipeKonten(konten);
    const avg = konten.ratings_avg_skor ? Number(konten.ratings_avg_skor).toFixed(1) : null;
    const durasi = konten.first_video?.durasi_detik ?? konten.primary_media?.durasi_detik;
    const initial = konten.user?.name?.charAt(0).toUpperCase() ?? '?';

    const coverSrc = konten.cover_url && isImageUrl(konten.cover_url) ? konten.cover_url : null;

    const placeholderClass =
        tipe === 'video'  ? 'bg-gradient-to-br from-stone-700 to-stone-900' :
        tipe === 'audio'  ? 'bg-gradient-to-br from-[#7c2d12] to-stone-900' :
        tipe === 'image'  ? 'bg-stone-200' :
                            'bg-stone-100';

    const thumb = (
        <div className="relative aspect-video overflow-hidden bg-stone-200">
            {coverSrc ? (
                <img src={coverSrc} alt={konten.judul}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            ) : (
                <div className={`flex size-full flex-col items-center justify-center gap-1.5 ${placeholderClass}`}>
                    {tipe === 'video' && <Play className="size-8 text-white/70" />}
                    {tipe === 'audio' && <Music className="size-8 text-white/70" />}
                    {tipe === 'image' && <ImageIcon className="size-8 text-stone-400" />}
                    {tipe === 'document' && <FileText className="size-8 text-stone-400" />}
                    {konten.category && (tipe === 'video' || tipe === 'audio') && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                            {konten.category.nama}
                        </span>
                    )}
                </div>
            )}

            {(tipe === 'video' || tipe === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-11 items-center justify-center rounded-full bg-black/50">
                        <Play className="size-5 fill-white text-white ml-0.5" />
                    </div>
                </div>
            )}

            {konten.category && (
                <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 backdrop-blur-sm">
                    {konten.category.nama}
                </span>
            )}

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

    const href = tipe === 'video' ? `/galeri/${konten.slug}?autoplay=1` : `/galeri/${konten.slug}`;
    return <Link href={href}>{cardInner}</Link>;
}
