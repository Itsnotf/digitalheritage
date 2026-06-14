import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya, Paginated } from '@/types';
import { router } from '@inertiajs/react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: (Category & { konten_budayas_count: number })[];
    filters: { tipe?: string };
}

const TIPE_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Foto' },
    { value: 'document', label: 'Artikel' },
];

export default function Welcome({ konten, filters }: Props) {
    const activeTipe = filters.tipe ?? '';

    const setTipe = (tipe: string) =>
        router.get('/', tipe ? { tipe } : {}, { preserveState: true, preserveScroll: true, replace: true });

    return (
        <PublicLayout title="Beranda" breadcrumbs={[{ title: 'Beranda', href: '/' }]}>
            <div className="px-4 py-4 sm:px-6">

                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {TIPE_FILTERS.map((f) => {
                        const active = activeTipe === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => setTipe(f.value)}
                                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                                    active
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {konten.data.length === 0 ? (
                    <div className="py-32 text-center text-sm font-medium text-stone-400">
                        Belum ada konten
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {konten.data.map((item) => (
                                <KontenCard key={item.id} konten={item} />
                            ))}
                        </div>
                        <div className="mt-10 flex justify-center">
                            <PaginationLinks links={konten.links} />
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
