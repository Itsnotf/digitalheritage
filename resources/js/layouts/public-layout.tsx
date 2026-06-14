import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { SharedData } from '@/types';

interface Props {
    children: ReactNode;
    title?: string;
    darkMode?: boolean;
}

export default function PublicLayout({ children, title, darkMode = false }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const isLoggedIn = !!auth?.user;

    return (
        <>
            <Head>
                <title>{title ? `${title} — Budaya Sumsel` : 'Budaya Sumsel'}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
            </Head>

            <div
                style={{ fontFamily: "'Open Sans', sans-serif", backgroundColor: darkMode ? '#111827' : '#EDE8DC' }}
                className={`min-h-screen ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
            >

                {/* Header — minimal, editorial */}
                <header className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm ${
                    darkMode
                        ? 'border-white/8 bg-gray-900/95'
                        : 'border-gray-900/10 bg-[#EDE8DC]/95'
                }`}>
                    <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-8">
                        <Link href="/" style={{ fontFamily: "'Montserrat', sans-serif" }} className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Budaya<span className="ml-1.5 text-gray-500">Sumsel</span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden items-center gap-8 md:flex">
                            {[['Beranda', '/'], ['Galeri', '/galeri'], ['Tentang', '/tentang-kami'], ['Kontak', '/kontak']].map(([label, href]) => (
                                <Link key={href} href={href} style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
                                        darkMode ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
                                    }`}>
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-4 md:flex">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/kontribusi/create" style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-xs font-black uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">
                                        Upload
                                    </Link>
                                    <Link href="/dashboard" style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                                        Masuk
                                    </Link>
                                    <Link href="/register" style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="bg-gray-900 text-[#EDE8DC] px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-colors">
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>

                        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-900">
                            {open ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>

                    {open && (
                        <div className={`border-t px-8 py-6 md:hidden ${darkMode ? 'border-white/8 bg-gray-900' : 'border-gray-900/10 bg-[#EDE8DC]'}`}>
                            <div className="flex flex-col gap-5">
                                {[['Beranda', '/'], ['Galeri', '/galeri'], ['Tentang', '/tentang-kami'], ['Kontak', '/kontak']].map(([label, href]) => (
                                    <Link key={href} href={href} onClick={() => setOpen(false)}
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-xs font-black uppercase tracking-widest text-gray-900">
                                        {label}
                                    </Link>
                                ))}
                                {isLoggedIn
                                    ? <Link href="/dashboard" style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xs font-black uppercase tracking-widest text-gray-500">Dashboard</Link>
                                    : <Link href="/register" style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xs font-black uppercase tracking-widest text-gray-900">Daftar</Link>}
                            </div>
                        </div>
                    )}
                </header>

                <main className="pt-14">{children}</main>

                {/* Footer — editorial */}
                <footer className="border-t border-gray-900/20 bg-[#EDE8DC]">
                    <div className="mx-auto max-w-screen-xl px-8 py-16">
                        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                            <div>
                                <p style={{ fontFamily: "'Montserrat', sans-serif" }} className="mb-4 text-xs font-black uppercase tracking-widest text-gray-900">
                                    Budaya Sumsel
                                </p>
                                <p className="text-sm leading-relaxed text-gray-600 max-w-64">
                                    Platform dokumentasi dan pelestarian budaya Sumatera Selatan secara digital.
                                </p>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Montserrat', sans-serif" }} className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">Navigasi</p>
                                <div className="flex flex-col gap-3">
                                    {[['Beranda', '/'], ['Galeri Budaya', '/galeri'], ['Upload Konten', '/kontribusi/create']].map(([label, href]) => (
                                        <Link key={href} href={href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{label}</Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'Montserrat', sans-serif" }} className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">Kategori</p>
                                <div className="flex flex-col gap-3">
                                    {['Tarian Tradisional', 'Musik Daerah', 'Rumah Adat', 'Kuliner Khas', 'Pakaian Adat'].map((k) => (
                                        <Link key={k} href={`/galeri?search=${encodeURIComponent(k)}`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{k}</Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-gray-900/10 pt-8">
                            <p className="text-xs text-gray-400 uppercase tracking-widest" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                © {new Date().getFullYear()} Budaya Sumsel. Pelestarian budaya daerah Sumatera Selatan.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
