import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Edit2, Image, ExternalLink } from 'lucide-react';

interface SitePage {
    id: number; key: string; title: string | null; subtitle: string | null;
    hero_image: string | null; hero_image_url: string | null;
}

interface Props { pages: SitePage[]; flash?: { success?: string } }

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Manajemen Halaman', href: '/halaman' }];

const PAGE_LABELS: Record<string, { label: string; url: string; desc: string }> = {
    'beranda':      { label: 'Beranda',      url: '/',             desc: 'Landing page utama — hero image dan tagline' },
    'galeri':       { label: 'Galeri',       url: '/galeri',       desc: 'Halaman browse konten — hero image' },
    'tentang-kami': { label: 'Tentang Kami', url: '/tentang-kami', desc: 'Profil platform, visi, misi, dan section konten' },
    'kontak':       { label: 'Kontak',       url: '/kontak',       desc: 'Informasi kontak dan media sosial' },
};

export default function PageManagerIndex({ pages }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6 space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Manajemen Halaman</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Kelola konten dan hero image untuk setiap halaman publik.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {pages.map((page) => {
                        const meta = PAGE_LABELS[page.key] ?? { label: page.key, url: '/', desc: '' };
                        return (
                            <div key={page.id} className="overflow-hidden rounded-lg border bg-card">
                                {/* Hero preview */}
                                <div className="relative h-40 overflow-hidden bg-muted">
                                    {page.hero_image_url ? (
                                        <img src={page.hero_image_url} alt="" className="size-full object-cover" />
                                    ) : (
                                        <div className="flex size-full items-center justify-center">
                                            <Image className="size-10 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute bottom-3 left-4">
                                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-800">
                                            {meta.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground">{meta.desc}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Link href={`/halaman/${page.key}/edit`}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                            <Edit2 className="size-3" /> Edit Konten
                                        </Link>
                                        <a href={meta.url} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                                            <ExternalLink className="size-3" /> Lihat Halaman
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
