import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: { search?: string; category_id?: string; wilayah_id?: string; sort?: string };
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function GaleriIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (key: string, value: string) =>
        router.get('/galeri', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const clear = () => router.get('/galeri', {}, { preserveState: true, replace: true });

    const hasFilter = !!(filters.search || filters.category_id || filters.wilayah_id);

    const selectedKat = kategoris.find((k) => String(k.id) === filters.category_id);
    const selectedWil = wilayahs.find((w) => String(w.id) === filters.wilayah_id);

    return (
        <PublicLayout title="Galeri Budaya">

            {/* ── Header editorial ── */}
            <section className="border-b border-gray-900/10 bg-[#EDE8DC] pt-16 pb-0">
                <div className="mx-auto max-w-screen-xl px-8 pb-0">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 py-16">
                        <div>
                            <h1 style={FONT} className="text-5xl font-black uppercase leading-none tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                                Galeri Budaya
                            </h1>
                            <div className="mt-5 w-12 border-b-2 border-gray-900" />
                        </div>
                        <div className="flex items-end">
                            <p className="text-sm leading-relaxed text-gray-500">
                                {konten.total.toLocaleString('id-ID')} konten budaya dari seluruh wilayah Sumatera Selatan.
                                Gunakan filter untuk menyempurnakan pencarian.
                            </p>
                        </div>
                    </div>

                    {/* Filter bar — minimal, flat */}
                    <div className="border-t border-gray-900/10 py-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <form onSubmit={(e) => { e.preventDefault(); apply('search', search); }} className="flex items-center gap-0">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari konten..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-9 border border-gray-900/20 bg-transparent pl-9 pr-4 text-xs outline-none focus:border-gray-900 transition-colors w-56"
                                        style={FONT}
                                    />
                                </div>
                                <button type="submit" style={FONT} className="h-9 bg-gray-900 px-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] hover:bg-gray-700 transition-colors">
                                    Cari
                                </button>
                            </form>

                            {/* Category select */}
                            <select
                                value={filters.category_id ?? ''}
                                onChange={(e) => apply('category_id', e.target.value)}
                                style={FONT}
                                className="h-9 border border-gray-900/20 bg-transparent px-3 text-xs text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
                            >
                                <option value="">Semua Kategori</option>
                                {kategoris.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                            </select>

                            {/* Wilayah select */}
                            <select
                                value={filters.wilayah_id ?? ''}
                                onChange={(e) => apply('wilayah_id', e.target.value)}
                                style={FONT}
                                className="h-9 border border-gray-900/20 bg-transparent px-3 text-xs text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
                            >
                                <option value="">Semua Wilayah</option>
                                {wilayahs.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
                            </select>

                            {/* Sort */}
                            <select
                                value={filters.sort ?? 'latest'}
                                onChange={(e) => apply('sort', e.target.value)}
                                style={FONT}
                                className="h-9 border border-gray-900/20 bg-transparent px-3 text-xs text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="popular">Terpopuler</option>
                            </select>

                            {/* Active filters */}
                            {hasFilter && (
                                <div className="ml-auto flex items-center gap-3">
                                    {selectedKat && (
                                        <span style={FONT} className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                            {selectedKat.nama}
                                            <button onClick={() => apply('category_id', '')}><X className="size-3" /></button>
                                        </span>
                                    )}
                                    {selectedWil && (
                                        <span style={FONT} className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                            {selectedWil.nama}
                                            <button onClick={() => apply('wilayah_id', '')}><X className="size-3" /></button>
                                        </span>
                                    )}
                                    <button onClick={clear} style={FONT} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                                        Reset
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Grid konten ── */}
            <section className="bg-[#EDE8DC]">
                <div className="mx-auto max-w-screen-xl px-8 py-16">
                    {konten.data.length === 0 ? (
                        <div className="py-32 text-center">
                            <p style={FONT} className="text-xs font-black uppercase tracking-widest text-gray-400">
                                Tidak ada konten yang sesuai
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                                {konten.data.map((item) => (
                                    <KontenCard key={item.id} konten={item} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-16 border-t border-gray-900/10 pt-8 flex justify-center">
                                <PaginationLinks links={konten.links} />
                            </div>

                            {/* Info */}
                            <p style={FONT} className="mt-4 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                Halaman {konten.current_page} dari {konten.last_page} · {konten.total} konten
                            </p>
                        </>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
