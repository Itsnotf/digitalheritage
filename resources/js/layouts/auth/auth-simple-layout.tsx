import { Head, Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

const FONT_DISPLAY = { fontFamily: "'Montserrat', sans-serif" };
const FONT_BODY    = { fontFamily: "'Open Sans', sans-serif" };

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800;900&family=Open+Sans:wght@300;400;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div style={FONT_BODY} className="flex min-h-screen bg-[#EDE8DC]">

                {/* ── Panel Kiri — Branding ── */}
                <div className="relative hidden lg:flex lg:w-[42%] flex-col justify-between bg-gray-900 px-14 py-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center bg-[#EDE8DC]">
                            <BookOpen className="size-5 text-gray-900" />
                        </div>
                        <span style={FONT_DISPLAY} className="text-sm font-black uppercase tracking-widest text-[#EDE8DC]">
                            Budaya Sumsel
                        </span>
                    </Link>

                    {/* Headline utama */}
                    <div>
                        <p style={FONT_DISPLAY}
                            className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#EDE8DC]/40">
                            Platform Dokumentasi Digital
                        </p>
                        <h2 style={FONT_DISPLAY}
                            className="text-6xl font-black uppercase leading-none tracking-tight text-[#EDE8DC] xl:text-7xl">
                            Warisan Budaya Sumatera Selatan
                        </h2>
                        <div className="mt-8 w-12 border-b-2 border-[#EDE8DC]/30" />
                        <p className="mt-8 max-w-sm text-sm leading-8 text-[#EDE8DC]/50">
                            Bergabunglah bersama ribuan kontributor dalam mendokumentasikan
                            dan melestarikan kekayaan budaya daerah untuk generasi mendatang.
                        </p>
                    </div>

                    {/* Footer link */}
                    <div className="flex items-center gap-6">
                        <Link href="/" style={FONT_DISPLAY}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC]/40 hover:text-[#EDE8DC]/80 transition-colors">
                            <ArrowLeft className="size-3" />
                            Kembali ke Beranda
                        </Link>
                        <Link href="/galeri" style={FONT_DISPLAY}
                            className="text-[10px] font-black uppercase tracking-widest text-[#EDE8DC]/40 hover:text-[#EDE8DC]/80 transition-colors">
                            Jelajahi Galeri
                        </Link>
                    </div>

                    {/* Decorative pattern */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(#EDE8DC 1px, transparent 1px), linear-gradient(to right, #EDE8DC 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                {/* ── Panel Kanan — Form ── */}
                <div className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16 xl:px-24">

                    {/* Mobile logo */}
                    <div className="mb-12 flex items-center gap-3 lg:hidden">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center bg-gray-900">
                                <BookOpen className="size-4 text-[#EDE8DC]" />
                            </div>
                            <span style={FONT_DISPLAY} className="text-sm font-black uppercase tracking-widest text-gray-900">
                                Budaya Sumsel
                            </span>
                        </Link>
                    </div>

                    <div className="w-full max-w-md">
                        {/* Heading */}
                        <div className="mb-10">
                            <h1 style={FONT_DISPLAY}
                                className="text-4xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-5xl">
                                {title}
                            </h1>
                            <div className="mt-4 w-10 border-b-2 border-gray-900" />
                            {description && (
                                <p className="mt-4 text-sm leading-relaxed text-gray-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Form content */}
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
