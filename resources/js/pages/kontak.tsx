import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone, Clock, Instagram, Facebook, ArrowRight } from 'lucide-react';

interface SitePage {
    key: string; title: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}

interface Props { page: SitePage }

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function Kontak({ page }: Props) {
    const c = page.content ?? {};

    const kontakItems = [
        { icon: MapPin,  label: 'Alamat',           value: c.alamat ?? 'Palembang, Sumatera Selatan' },
        { icon: Phone,   label: 'Telepon / WhatsApp', value: c.telepon && c.telepon !== '-' ? c.telepon : null },
        { icon: Mail,    label: 'Email',              value: c.email ?? 'info@budayasumsel.id' },
        { icon: Clock,   label: 'Jam Operasional',    value: c.jam_operasional ?? 'Senin – Jumat, 08.00 – 17.00 WIB' },
    ].filter((item) => item.value);

    const sosmed = [
        { icon: Instagram, label: 'Instagram', handle: c.instagram, url: c.instagram ? `https://instagram.com/${c.instagram.replace('@', '')}` : null },
        { icon: Facebook,  label: 'Facebook',  handle: c.facebook,  url: c.facebook ? `https://facebook.com/${c.facebook}` : null },
    ].filter((s) => s.handle);

    return (
        <PublicLayout title={page.title ?? 'Kontak'}>

            {/* ── Hero ── */}
            <section className={`h-[40vh] overflow-hidden ${page.hero_image_url ? '' : 'bg-gray-800'}`}>
                {page.hero_image_url ? (
                    <img src={page.hero_image_url} alt="Kontak" className="size-full object-cover" />
                ) : (
                    <div className="size-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
            </section>

            {/* ── Header ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                        <div>
                            <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                                Ada pertanyaan?
                            </p>
                            <h1 style={FONT} className="text-5xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-6xl">
                                {c.heading ?? 'Hubungi Kami'}
                            </h1>
                            <div className="mt-6 w-12 border-b-2 border-gray-900" />
                        </div>
                        <div className="flex items-end">
                            <p className="text-base leading-8 text-gray-600">
                                {c.intro ?? 'Kami terbuka untuk segala bentuk pertanyaan, masukan, dan kerjasama. Jangan ragu untuk menghubungi kami.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Info kontak ── */}
            <section className="bg-[#E5DFD2]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-0 md:grid-cols-2">

                        {/* Info list */}
                        <div className="border-r border-gray-900/10 pr-16">
                            <p style={FONT} className="mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Informasi Kontak
                            </p>
                            <div className="space-y-8">
                                {kontakItems.map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center border border-gray-900/10 bg-[#EDE8DC]">
                                            <Icon className="size-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p style={FONT} className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                                            <p className="text-sm text-gray-900">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Media sosial */}
                            {sosmed.length > 0 && (
                                <div className="mt-12">
                                    <p style={FONT} className="mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Media Sosial</p>
                                    <div className="flex gap-4">
                                        {sosmed.map(({ icon: Icon, label, handle, url }) => (
                                            <a key={label} href={url!} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-2 border border-gray-900/20 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#D9D4C8] transition-colors">
                                                <Icon className="size-4" />
                                                <span style={FONT} className="text-[10px] font-black uppercase tracking-wider">{handle}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pesan singkat / CTA */}
                        <div className="pl-16">
                            <p style={FONT} className="mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Kirim Pesan
                            </p>
                            <p className="mb-8 text-sm leading-relaxed text-gray-600">
                                Untuk pertanyaan, pelaporan konten, atau kerjasama, silakan hubungi kami melalui email. Kami akan membalas dalam 1–3 hari kerja.
                            </p>
                            <a href={`mailto:${c.email ?? 'info@budayasumsel.id'}`}
                                style={FONT}
                                className="inline-flex items-center gap-2 bg-gray-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] hover:bg-gray-700 transition-colors">
                                Kirim Email
                                <ArrowRight className="size-3.5" />
                            </a>

                            <div className="mt-12 border-t border-gray-900/10 pt-10">
                                <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Ingin Berkontribusi?
                                </p>
                                <p className="mb-4 text-sm text-gray-600">
                                    Daftarkan diri dan mulai mengunggah konten budaya Sumatera Selatan. Gratis dan terbuka untuk semua.
                                </p>
                                <Link href="/register" style={FONT}
                                    className="inline-flex items-center gap-2 border border-gray-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-900 hover:text-[#EDE8DC] transition-colors">
                                    Daftar Sekarang <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Navigasi halaman lain ── */}
            <section className="border-t border-gray-900/10 bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-16">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <p style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Jelajahi Platform
                        </p>
                        <div className="flex gap-6">
                            <Link href="/" style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors">
                                Beranda
                            </Link>
                            <Link href="/galeri" style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors">
                                Galeri Budaya
                            </Link>
                            <Link href="/tentang-kami" style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors">
                                Tentang Kami
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
