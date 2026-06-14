import PublicLayout from '@/layouts/public-layout';
import { Building } from 'lucide-react';

interface SitePage {
    key: string; title: string | null; subtitle: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}
interface Props { page: SitePage }

export default function Tentang({ page }: Props) {
    const c = page.content ?? {};

    return (
        <PublicLayout title={page.title ?? 'Tentang Kami'} breadcrumbs={[
            { title: 'Beranda', href: '/' },
            { title: page.title ?? 'Tentang Kami', href: '/tentang-kami' },
        ]}>
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-orange-50">
                    <Building className="size-6 text-[#c2410c]" />
                </div>
                <h1 className="text-3xl font-bold leading-tight text-stone-900">
                    {c.heading || page.title || 'Tentang Budaya Sumsel'}
                </h1>
                <div className="mt-3 h-1 w-10 rounded bg-[#c2410c]" />

                {page.hero_image_url && (
                    <img src={page.hero_image_url} alt={page.title ?? ''} className="mt-6 w-full rounded-lg object-cover" />
                )}

                {/* Intro */}
                {c.intro && (
                    <p className="mt-6 text-[15px] leading-relaxed text-stone-700 whitespace-pre-wrap">{c.intro}</p>
                )}

                {/* Visi */}
                {c.visi && (
                    <div className="mt-8 rounded-lg border border-black/[0.07] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#c2410c]">Visi</p>
                        <p className="mt-2 text-[15px] leading-relaxed text-stone-700">{c.visi}</p>
                    </div>
                )}

                {/* Misi */}
                {c.misi_items && c.misi_items.length > 0 && (
                    <div className="mt-4 rounded-lg border border-black/[0.07] bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#c2410c]">Misi</p>
                        <ul className="mt-3 space-y-2">
                            {c.misi_items.map((item: string, i: number) => item && (
                                <li key={i} className="flex items-start gap-2 text-[15px] text-stone-700">
                                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#c2410c]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Section 1 & 2 */}
                {[['section_1', c.section_1_title, c.section_1_content], ['section_2', c.section_2_title, c.section_2_content]].map(([key, title, body]) =>
                    (title || body) ? (
                        <div key={key as string} className="mt-8 border-t border-black/[0.07] pt-6">
                            {title && <h2 className="text-lg font-semibold text-stone-900">{title}</h2>}
                            {body && <p className="mt-2 text-[15px] leading-relaxed text-stone-700 whitespace-pre-wrap">{body}</p>}
                        </div>
                    ) : null
                )}

                {/* Fallback jika semua kosong */}
                {!c.intro && !c.visi && !c.misi_items && !c.section_1_content && (
                    <p className="mt-6 text-[15px] leading-relaxed text-stone-700">
                        Budaya Sumsel adalah platform dokumentasi dan pelestarian budaya digital untuk Sumatera Selatan.
                        Setiap warga dapat berkontribusi mengunggah konten budaya dalam bentuk video, audio, foto, maupun artikel.
                    </p>
                )}
            </div>
        </PublicLayout>
    );
}
