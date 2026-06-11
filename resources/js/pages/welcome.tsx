import KontenCard from '@/components/konten-card';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya } from '@/types';
import { Link } from '@inertiajs/react';

interface Props {
    featured: KontenBudaya[];
    kategoris: (Category & { konten_budayas_count: number })[];
    stats: { total_konten: number; total_kontributor: number; total_wilayah: number };
    berandaPage: { hero_image_url: string | null; content: Record<string, any> | null };
}

const FONT_DISPLAY = { fontFamily: "'Montserrat', sans-serif" };

export default function Welcome({ featured, kategoris, stats, berandaPage }: Props) {
    const [featuredMain, ...featuredRest] = featured;

    return (
        <PublicLayout>

            {/* ── HERO — Full-bleed image dari CMS ── */}
            <section className="relative h-[75vh] overflow-hidden bg-gray-800">
                {berandaPage?.hero_image_url ? (
                    <img src={berandaPage.hero_image_url} alt="Budaya Sumsel" className="size-full object-cover" />
                ) : (
                    <div className="size-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-end">
                        <div className="p-12 pb-16">
                            <p style={FONT_DISPLAY} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">
                                {berandaPage?.content?.tagline ?? 'Platform Dokumentasi Digital'}
                            </p>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </section>

            {/* ── SECTION 1 — Intro editorial ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-16 md:grid-cols-2">

                        {/* Left: Massive heading */}
                        <div>
                            <h1 style={FONT_DISPLAY}
                                className="text-5xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                                Mengenal &amp; Melestarikan Warisan Budaya Sumatera Selatan
                            </h1>
                            <div className="mt-6 w-12 border-b-2 border-gray-900" />
                        </div>

                        {/* Right: 3-column text grid */}
                        <div className="flex flex-col justify-end">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Platform dokumentasi digital untuk mengenal, mendokumentasikan, dan melestarikan kekayaan budaya daerah Sumatera Selatan.
                                </p>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Dari tarian tradisional, musik daerah, rumah adat, kuliner khas, pakaian adat, hingga tradisi lokal dari 17 kabupaten dan kota.
                                </p>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Masyarakat dapat berperan aktif sebagai kontributor dengan mengunggah konten budaya yang kemudian divalidasi oleh tim kurasi.
                                </p>
                            </div>
                            <div className="mt-10 flex gap-6">
                                <Link href="/galeri" style={FONT_DISPLAY}
                                    className="bg-gray-900 text-[#EDE8DC] px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-colors">
                                    Jelajahi Galeri
                                </Link>
                                <Link href="/register" style={FONT_DISPLAY}
                                    className="border border-gray-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                    Ikut Berkontribusi
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 2 — Stats ── */}
            <section className="border-t border-b border-gray-900/10 bg-[#E5DFD2]">
                <div className="mx-auto max-w-screen-xl px-8 py-16">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        {[
                            { value: stats.total_konten, label: 'Konten Budaya' },
                            { value: stats.total_kontributor, label: 'Kontributor' },
                            { value: stats.total_wilayah, label: 'Wilayah' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p style={FONT_DISPLAY} className="text-5xl font-black uppercase tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                                    {value.toLocaleString('id-ID')}
                                </p>
                                <p style={FONT_DISPLAY} className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                                    {label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 3 — Kategori ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="mb-12 flex items-end justify-between border-b border-gray-900/10 pb-6">
                        <h2 style={FONT_DISPLAY} className="text-4xl font-black uppercase tracking-tight text-gray-900 md:text-5xl">
                            Kategori Budaya
                        </h2>
                        <Link href="/galeri" style={FONT_DISPLAY} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-6">
                        {kategoris.map((k, i) => (
                            <Link key={k.id} href={`/galeri?category_id=${k.id}`}
                                className={`group border-r border-gray-900/10 px-6 py-8 hover:bg-[#D9D4C8] transition-colors ${i === kategoris.length - 1 ? 'border-r-0' : ''}`}>
                                <p style={FONT_DISPLAY} className="text-xs font-black uppercase tracking-wider text-gray-900 group-hover:text-gray-600 transition-colors">
                                    {k.nama}
                                </p>
                                {k.konten_budayas_count > 0 && (
                                    <p style={FONT_DISPLAY} className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        {k.konten_budayas_count} konten
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SECTION 4 — Featured konten (editorial split) ── */}
            {featured.length > 0 && (
                <section className="bg-[#E5DFD2]">
                    <div className="mx-auto max-w-screen-xl px-8 py-24">
                        <div className="mb-12 border-b border-gray-900/10 pb-6">
                            <h2 style={FONT_DISPLAY} className="text-4xl font-black uppercase tracking-tight text-gray-900 md:text-5xl">
                                Konten Terbaru
                            </h2>
                            <div className="mt-4 w-12 border-b-2 border-gray-900" />
                        </div>

                        {/* Editorial grid: 1 large + 2-3 smaller */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                            {featuredMain && (
                                <div className="lg:col-span-3">
                                    <KontenCard konten={featuredMain} variant="large" />
                                </div>
                            )}
                            <div className="flex flex-col gap-8 lg:col-span-2">
                                {featuredRest.slice(0, 2).map((k) => (
                                    <KontenCard key={k.id} konten={k} />
                                ))}
                            </div>
                        </div>

                        {featuredRest.length > 2 && (
                            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-gray-900/10 pt-8 sm:grid-cols-3">
                                {featuredRest.slice(2, 5).map((k) => (
                                    <KontenCard key={k.id} konten={k} />
                                ))}
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link href="/galeri" style={FONT_DISPLAY}
                                className="border border-gray-900 px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors inline-block">
                                Lihat Semua Konten
                            </Link>
                        </div>
                    </div>
                </section>
            )}


            {/* ── SECTION 5 — CTA Tentang & Kontak ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                        {/* Tentang Kami */}
                        <div className="border-r border-gray-900/10 pr-16">
                            <p style={FONT_DISPLAY} className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                                Kenali Lebih Dalam
                            </p>
                            <h2 style={FONT_DISPLAY} className="text-4xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-5xl">
                                Tentang Kami
                            </h2>
                            <div className="mt-5 w-12 border-b-2 border-gray-900" />
                            <p className="mt-6 mb-8 text-sm leading-relaxed text-gray-600">
                                Pelajari lebih lanjut tentang platform, misi, dan tim di balik upaya pelestarian budaya Sumatera Selatan ini.
                            </p>
                            <Link href="/tentang-kami" style={FONT_DISPLAY}
                                className="inline-flex items-center gap-2 border border-gray-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                Baca Selengkapnya →
                            </Link>
                        </div>

                        {/* Kontak */}
                        <div className="pl-16 pt-12 md:pt-0">
                            <p style={FONT_DISPLAY} className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                                Ada Pertanyaan?
                            </p>
                            <h2 style={FONT_DISPLAY} className="text-4xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-5xl">
                                Kontak
                            </h2>
                            <div className="mt-5 w-12 border-b-2 border-gray-900" />
                            <p className="mt-6 mb-8 text-sm leading-relaxed text-gray-600">
                                Hubungi kami untuk pertanyaan, pelaporan konten, atau kerjasama dalam pelestarian budaya daerah.
                            </p>
                            <Link href="/kontak" style={FONT_DISPLAY}
                                className="inline-flex items-center gap-2 border border-gray-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                Hubungi Kami →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SECTION 6 — CTA split ── */}
            <section className="bg-gray-900">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                        <div>
                            <h2 style={FONT_DISPLAY} className="text-5xl font-black uppercase leading-none tracking-tight text-[#EDE8DC] md:text-6xl">
                                Jadilah Bagian dari Pelestarian Budaya
                            </h2>
                            <div className="mt-6 w-12 border-b-2 border-[#EDE8DC]/40" />
                        </div>
                        <div className="flex flex-col justify-end gap-8">
                            <p className="text-sm leading-relaxed text-gray-400">
                                Daftarkan diri dan mulai berbagi dokumentasi budaya Sumatera Selatan. Setiap kontribusi membantu melestarikan warisan leluhur kita untuk generasi mendatang.
                            </p>
                            <p style={FONT_DISPLAY} className="text-xs font-black uppercase tracking-widest text-gray-500">
                                Kontribusi dalam bentuk teks, gambar, audio, dan video. Semua konten dikurasi oleh tim editorial sebelum ditayangkan.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/register" style={FONT_DISPLAY}
                                    className="bg-[#EDE8DC] text-gray-900 px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors">
                                    Daftar Gratis
                                </Link>
                                <Link href="/galeri" style={FONT_DISPLAY}
                                    className="border border-[#EDE8DC]/30 text-[#EDE8DC] px-6 py-3 text-xs font-black uppercase tracking-widest hover:border-[#EDE8DC] transition-colors">
                                    Jelajahi Dulu
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </PublicLayout>
    );
}
