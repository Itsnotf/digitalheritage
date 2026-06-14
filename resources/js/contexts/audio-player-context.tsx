import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export interface AudioTrack {
    judul: string;
    url: string;
    user?: string;
    wilayah?: string;
    durasi_detik?: number | null;
    cover_url?: string | null;
}

interface AudioPlayerContextType {
    current: AudioTrack | null;
    isPlaying: boolean;
    play: (track: AudioTrack) => void;
    toggle: () => void;
    close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
    const ctx = useContext(AudioPlayerContext);
    if (!ctx) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
    return ctx;
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
    const [current, setCurrent] = useState<AudioTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        const a = audioRef.current;
        a.addEventListener('play', () => setIsPlaying(true));
        a.addEventListener('pause', () => setIsPlaying(false));
        a.addEventListener('ended', () => setIsPlaying(false));
        return () => { a.pause(); };
    }, []);

    const play = (track: AudioTrack) => {
        const a = audioRef.current;
        if (!a) return;
        if (current?.url !== track.url) {
            a.src = `/storage/${track.url}`;
            setCurrent(track);
        }
        a.play();
    };

    const toggle = () => {
        const a = audioRef.current;
        if (!a || !current) return;
        if (a.paused) a.play();
        else a.pause();
    };

    const close = () => {
        const a = audioRef.current;
        if (a) a.pause();
        setCurrent(null);
        setIsPlaying(false);
    };

    return (
        <AudioPlayerContext.Provider value={{ current, isPlaying, play, toggle, close }}>
            {children}
        </AudioPlayerContext.Provider>
    );
}
