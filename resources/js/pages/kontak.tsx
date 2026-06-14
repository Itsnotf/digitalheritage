import PublicLayout from '@/layouts/public-layout';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

interface SitePage {
    key: string; title: string | null;
    hero_image_url: string | null; content: Record<string, any> | null;
}
interface Props { page: SitePage }

export default function Kontak({ page }: Props) {
    const c = page.content ?? {};

    const items = [
        { icon: MapPin, label: 'Alamat',          value: c.alamat ?? null },
        { icon: Phone,  label: 'Telepon / WA',    value: c.telepon && c.telepon !== '-' ? c.telepon : null },
        { icon: Mail,   label: 'Email',            value: c.email ?? null },
        { icon: Clock,  label: 'Jam Operasional', value: c.jam_operasional ?? null },
    ].filter((x) => x.value);

    return (
        <PublicLayout title={page.title ?? 'Kontak'} breadcrumbs={[
            { title: 'Beranda', href: '/' },
            { title: page.title ?? 'Kontak', href: '/kontak' },
        ]}>
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-orange-50">
                    <Mail className="size-6 text-[#c2410c]" />
                </div>
                <h1 className="text-3xl font-bold leading-tight text-stone-900">
                    {c.heading || page.title || 'Hubungi Kami'}
                </h1>
                <div className="mt-3 h-1 w-10 rounded bg-[#c2410c]" />

                {c.intro && (
                    <p className="mt-5 text-[15px] leading-relaxed text-stone-600 whitespace-pre-wrap">{c.intro}</p>
                )}

                {!c.intro && (
                    <p className="mt-5 text-[15px] leading-relaxed text-stone-600">
                        Punya pertanyaan, saran, atau ingin berkolaborasi? Hubungi kami melalui informasi di bawah ini.
                    </p>
                )}

                {items.length > 0 && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {items.map((item) => (
                            <div key={item.label} className="flex items-start gap-3 rounded-lg border border-black/[0.07] bg-white p-4">
                                <item.icon className="mt-0.5 size-5 shrink-0 text-[#c2410c]" />
                                <div>
                                    <p className="text-sm font-semibold text-stone-900">{item.label}</p>
                                    <p className="mt-0.5 text-sm text-stone-600">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {(c.instagram || c.facebook) && (
                    <div className="mt-6 border-t border-black/[0.07] pt-5">
                        <p className="mb-3 text-sm font-semibold text-stone-900">Media Sosial</p>
                        <div className="flex flex-wrap gap-3">
                            {c.instagram && (
                                <span className="rounded-lg border border-black/[0.07] bg-white px-4 py-2 text-sm text-stone-700">
                                    Instagram: {c.instagram}
                                </span>
                            )}
                            {c.facebook && (
                                <span className="rounded-lg border border-black/[0.07] bg-white px-4 py-2 text-sm text-stone-700">
                                    Facebook: {c.facebook}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
