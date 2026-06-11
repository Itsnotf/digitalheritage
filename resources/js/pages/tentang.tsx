import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';

interface SitePage {
    key: string; title: string | null; subtitle: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}

interface Props { page: SitePage }

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function Tentang({ page }: Props) {
    const c = page.content ?? {};

    return (
        <PublicLayout title={page.title ?? 'Tentang Kami'}>

            {/* ── Hero ── */}
            <section className={`h-[50vh] overflow-hidden ${page.hero_image_url ? '' : 'bg-gray-800'}`}>
                {page.hero_image_url ? (
                    <img src={page.hero_image_url} alt="Tentang Kami" className="size-full object-cover" />
                ) : (
                    <div className="size-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
            </section>

            {/* ── Intro ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                        <div>
                            <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                                Platform Budaya Sumsel
                            </p>
                            <h1 style={FONT} className="text-5xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-6xl">
                                {c.heading ?? 'Tentang Kami'}
                            </h1>
                            <div className="mt-6 w-12 border-b-2 border-gray-900" />
                        </div>
                        <div className="flex items-end">
                            <p className="text-base leading-8 text-gray-600">
                                {c.intro ?? 'Platform Budaya Sumsel hadir sebagai wadah digital untuk mendokumentasikan dan melestarikan kekayaan budaya Sumatera Selatan.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Visi & Misi ── */}
            <section className="bg-[#E5DFD2]">
                <div className="mx-auto max-w-screen-xl px-8 py-24">
                    <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                        {/* Visi */}
                        <div className="border-r border-gray-900/10 pr-16">
                            <p style={FONT} className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Visi</p>
                            <p style={FONT} className="text-2xl font-bold uppercase leading-snug tracking-tight text-gray-900">
                                {c.visi ?? 'Menjadi platform terdepan dalam dokumentasi dan pelestarian budaya Sumatera Selatan.'}
                            </p>
                        </div>

                        {/* Misi */}
                        <div>
                            <p style={FONT} className="mb-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Misi</p>
                            <ul className="space-y-5">
                                {(c.misi_items ?? [
                                    'Mendokumentasikan kekayaan budaya Sumatera Selatan secara sistematis.',
                                    'Melestarikan warisan leluhur dengan teknologi digital modern.',
                                    'Memberdayakan masyarakat sebagai kontributor aktif.',
                                    'Meningkatkan partisipasi generasi muda.',
                                ]).map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <span style={FONT} className="mt-0.5 shrink-0 text-[10px] font-black text-gray-400">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Sections ── */}
            {(c.section_1_title || c.section_1_content) && (
                <section className="bg-[#EDE8DC]">
                    <div className="mx-auto max-w-screen-xl px-8 py-24">
                        <div className="border-b border-gray-900/10 pb-6 mb-12">
                            <h2 style={FONT} className="text-4xl font-black uppercase tracking-tight text-gray-900">
                                {c.section_1_title ?? 'Siapa Kami'}
                            </h2>
                            <div className="mt-4 w-12 border-b-2 border-gray-900" />
                        </div>
                        <div className="max-w-3xl">
                            <p className="text-base leading-8 text-gray-700">{c.section_1_content}</p>
                        </div>
                    </div>
                </section>
            )}

            {(c.section_2_title || c.section_2_content) && (
                <section className="bg-[#E5DFD2]">
                    <div className="mx-auto max-w-screen-xl px-8 py-24">
                        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                            <div>
                                <h2 style={FONT} className="text-4xl font-black uppercase tracking-tight text-gray-900">
                                    {c.section_2_title ?? 'Mengapa Platform Ini'}
                                </h2>
                                <div className="mt-4 w-12 border-b-2 border-gray-900" />
                            </div>
                            <div>
                                <p className="text-base leading-8 text-gray-700">{c.section_2_content}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ── */}
            <section className="bg-gray-900">
                <div className="mx-auto max-w-screen-xl px-8 py-20 text-center">
                    <h2 style={FONT} className="mb-6 text-4xl font-black uppercase tracking-tight text-[#EDE8DC]">
                        Ikut Melestarikan Budaya
                    </h2>
                    <p className="mb-8 text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
                        Daftarkan diri dan mulai berkontribusi. Setiap konten yang kamu unggah membantu mendokumentasikan kekayaan budaya untuk generasi mendatang.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/register" style={FONT} className="bg-[#EDE8DC] text-gray-900 px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors">
                            Daftar Sekarang
                        </Link>
                        <Link href="/kontak" style={FONT} className="border border-[#EDE8DC]/30 text-[#EDE8DC] px-8 py-3 text-xs font-black uppercase tracking-widest hover:border-[#EDE8DC] transition-colors">
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
