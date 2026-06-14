import { useAudioPlayer } from '@/contexts/audio-player-context';
import { Music, Pause, Play, Volume2, X } from 'lucide-react';

export default function BottomAudioPlayer() {
    const { current, isPlaying, toggle, close } = useAudioPlayer();

    if (!current) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white px-4 py-2.5">
            <div className="mx-auto flex max-w-screen-2xl items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-orange-100">
                    {current.cover_url
                        ? <img src={current.cover_url} alt="" className="size-full rounded-md object-cover" />
                        : <Music className="size-5 text-orange-700" />}
                </div>

                <div className="w-32 min-w-0 shrink-0">
                    <p className="truncate text-xs font-semibold text-stone-900">{current.judul}</p>
                    <p className="truncate text-[11px] text-stone-400">
                        {current.wilayah}{current.user ? ` · ${current.user}` : ''}
                    </p>
                </div>

                <button onClick={toggle}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
                    aria-label={isPlaying ? 'Jeda' : 'Putar'}>
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                </button>

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
