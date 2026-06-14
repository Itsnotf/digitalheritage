import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: { search?: string; category_id?: string; wilayah_id?: string; sort?: string; tipe?: string };
}

const TIPE_FILTERS = [
    { value: '', label: 'Semua' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'image', label: 'Foto' },
    { value: 'document', label: 'Artikel' },
];

export default function GaleriIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const activeTipe = filters.tipe ?? '';

    const apply = (key: string, value: string) =>
        router.get('/galeri', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const clear = () => router.get('/galeri', {}, { preserveState: true, replace: true });

    const selectedKat = kategoris.find((k) => String(k.id) === filters.category_id);
    const selectedWil = wilayahs.find((w) => String(w.id) === filters.wilayah_id);
    const hasFilter = !!(filters.search || filters.category_id || filters.wilayah_id || filters.tipe);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        apply('search', search);
    };

    const breadcrumbs = [
        { title: 'Beranda', href: '/' },
        { title: 'Jelajah', href: '/galeri' },
    ];

    return (
        <PublicLayout title="Jelajah Budaya" breadcrumbs={breadcrumbs}>
            <div className="px-4 py-4 sm:px-6">

                {/* Tipe pills */}
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {TIPE_FILTERS.map((f) => {
                        const active = activeTipe === f.value;
                        return (
                            <button key={f.value} onClick={() => apply('tipe', f.value)}
                                className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                                    active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}>
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Dropdown filters */}
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <form onSubmit={submitSearch} className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul..."
                            className="bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 w-40"
                        />
                    </form>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {selectedKat?.nama ?? 'Semua Kategori'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            <DropdownMenuItem onClick={() => apply('category_id', '')}>Semua Kategori</DropdownMenuItem>
                            {kategoris.map((k) => (
                                <DropdownMenuItem key={k.id} onClick={() => apply('category_id', String(k.id))}>
                                    {k.nama}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {selectedWil?.nama ?? 'Semua Wilayah'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            <DropdownMenuItem onClick={() => apply('wilayah_id', '')}>Semua Wilayah</DropdownMenuItem>
                            {wilayahs.map((w) => (
                                <DropdownMenuItem key={w.id} onClick={() => apply('wilayah_id', String(w.id))}>
                                    {w.nama}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                {filters.sort === 'popular' ? 'Terpopuler' : 'Terbaru'}
                                <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => apply('sort', 'latest')}>Terbaru</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => apply('sort', 'popular')}>Terpopuler</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasFilter && (
                        <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-stone-500">
                            <X className="size-3.5" /> Reset
                        </Button>
                    )}
                </div>

                {konten.data.length === 0 ? (
                    <div className="py-32 text-center text-sm font-medium text-stone-400">
                        Tidak ada konten yang sesuai
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {konten.data.map((item) => <KontenCard key={item.id} konten={item} />)}
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
