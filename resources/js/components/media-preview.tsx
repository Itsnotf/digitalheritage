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
