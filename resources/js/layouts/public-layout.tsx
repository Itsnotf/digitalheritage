import { PublicSidebar } from '@/components/public-sidebar';
import BottomAudioPlayer from '@/components/bottom-audio-player';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    /** Halaman immersive (full-screen viewer) — main jadi pas tinggi viewport, tanpa padding/scroll */
    fullBleed?: boolean;
}

export default function PublicLayout({ children, title, breadcrumbs = [], fullBleed = false }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isLoggedIn = !!auth?.user;

    return (
        <>
            <Head>
                <title>{title ? `${title} — Budaya Sumsel` : 'Budaya Sumsel'}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <AudioPlayerProvider>
                <SidebarProvider defaultOpen={false} style={{ fontFamily: "'Inter', sans-serif" }}>
                    <PublicSidebar />
                    <SidebarInset className="bg-texture-dots">

                        {/* Top bar */}
                        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
                            <SidebarTrigger className="text-stone-600" />
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex-1 min-w-0">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>

                            {isLoggedIn ? (
                                <Link href="/dashboard" className="shrink-0">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-[#c2410c] text-xs font-semibold text-white">
                                            {auth.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            ) : (
                                <div className="flex shrink-0 items-center gap-2">
                                    <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100">
                                        Masuk
                                    </Link>
                                    <Link href="/register" className="rounded-lg bg-[#c2410c] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a330a]">
                                        Daftar
                                    </Link>
                                </div>
                            )}
                        </header>

                        <main className={fullBleed ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : 'min-h-[calc(100vh-3.5rem)] pb-24'}>
                            {children}
                        </main>

                        <BottomAudioPlayer />
                    </SidebarInset>
                </SidebarProvider>
            </AudioPlayerProvider>
        </>
    );
}
