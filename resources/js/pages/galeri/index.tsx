import KontenCard from '@/components/konten-card';
import PaginationLinks from '@/components/pagination-links';
import PublicLayout from '@/layouts/public-layout';
import { Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { router } from '@inertiajs/react';
import { LayoutGrid, Play, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: {
        search?: string;
        category_id?: string;
        wilayah_id?: string;
        sort?: string;
        mode?: 'video' | 'galeri';
    };
    galeriPage?: { hero_image_url: string | null; content: Record<string, unknown> | null };
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function GaleriIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const currentMode = filters.mode === 'galeri' ? 'galeri' : 'video';
    const isVideoMode = currentMode === 'video';

    const apply = (key: string, value: string) =>
        router.get('/galeri', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });

    const toggleMode = () => {
        const newMode = isVideoMode ? 'galeri' : 'video';
        router.get('/galeri', { ...filters, mode: newMode, page: undefined }, { preserveState: false });
    };

    const clear = () => router.get('/galeri', { mode: currentMode }, { preserveState: true, replace: true });

    const hasFilter = !!(filters.search || filters.category_id || filters.wilayah_id);
    const selectedKat = kategoris.find((k) => String(k.id) === filters.category_id);
    const selectedWil = wilayahs.find((w) => String(w.id) === filters.wilayah_id);

    // ── Dark mode styles ──────────────────────────────────────────────
    const headerBg    = isVideoMode ? 'bg-gray-900'     : 'bg-[#EDE8DC]';
    const contentBg   = isVideoMode ? 'bg-gray-900'     : 'bg-[#EDE8DC]';
    const titleColor  = isVideoMode ? 'text-gray-100'   : 'text-gray-900';
    const accentLine  = isVideoMode ? 'border-gray-600' : 'border-gray-900';
    const borderColor = isVideoMode ? 'border-white/8'  : 'border-gray-900/10';
    const mutedColor  = isVideoMode ? 'text-gray-500'   : 'text-gray-500';
    const inputBorder = isVideoMode ? 'border-white/15 text-gray-200 placeholder:text-gray-600' : 'border-gray-900/20 text-gray-700 placeholder:text-gray-400';
    const selectStyle = isVideoMode ? 'border-white/15 text-gray-300' : 'border-gray-900/20 text-gray-700';

    return (
        <PublicLayout title="Galeri Budaya" darkMode={isVideoMode}>

            {/* ── Page Header ── */}
            <section className={`${headerBg} border-b ${borderColor} pt-16 pb-0`}>
                <div className="mx-auto max-w-screen-xl px-8 pb-0">
                    <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 py-16 border-b ${borderColor}`}>

                        {/* Left: Title */}
                        <div>
                            <h1 style={FONT}
                                className={`text-5xl font-black uppercase leading-none tracking-tight md:text-6xl lg:text-7xl ${titleColor}`}>
                                Galeri Budaya
                            </h1>
                            <div className={`mt-5 w-12 border-b-2 ${accentLine}`} />
                        </div>

                        {/* Right: desc + mode toggle */}
                        <div className="flex flex-col justify-between gap-6">
                            <p className={`text-sm leading-relaxed ${mutedColor}`}>
                                {konten.total.toLocaleString('id-ID')} {isVideoMode ? 'konten video' : 'konten budaya'} dari seluruh wilayah Sumatera Selatan.
                            </p>

                            {/* Mode Toggle */}
                            <div className="flex items-center gap-0 self-start">
                                <button
                                    onClick={toggleMode}
                                    style={FONT}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        isVideoMode
                                            ? 'bg-[#EDE8DC] text-gray-900 border-[#EDE8DC]'
                                            : 'bg-transparent text-gray-400 border-gray-900/20 hover:border-gray-900 hover:text-gray-900'
                                    }`}
                                >
                                    <Play className="size-3 fill-current" />
                                    Mode Video
                                </button>
                                <button
                                    onClick={toggleMode}
                                    style={FONT}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                        !isVideoMode
                                            ? 'bg-gray-900 text-[#EDE8DC] border-gray-900'
                                            : 'bg-transparent border-white/15 text-gray-500 hover:border-white/30 hover:text-gray-300'
                                    }`}
                                >
                                    <LayoutGrid className="size-3" />
                                    Mode Galeri
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Filter bar ── */}
                    <div className="py-4 flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <form onSubmit={(e) => { e.preventDefault(); apply('search', search); }} className="flex">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari konten..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className={`h-9 border bg-transparent pl-9 pr-4 text-xs outline-none focus:border-gray-500 transition-colors w-52 ${inputBorder}`}
                                    style={FONT}
                                />
                            </div>
                            <button type="submit" style={FONT}
                                className="h-9 bg-gray-900 text-[#EDE8DC] px-4 text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-colors">
                                Cari
                            </button>
                        </form>

                        {/* Category */}
                        <select
                            value={filters.category_id ?? ''}
                            onChange={(e) => apply('category_id', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="">Semua Kategori</option>
                            {kategoris.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>

                        {/* Wilayah */}
                        <select
                            value={filters.wilayah_id ?? ''}
                            onChange={(e) => apply('wilayah_id', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="">Semua Wilayah</option>
                            {wilayahs.map((w) => <option key={w.id} value={w.id}>{w.nama}</option>)}
                        </select>

                        {/* Sort */}
                        <select
                            value={filters.sort ?? 'latest'}
                            onChange={(e) => apply('sort', e.target.value)}
                            style={FONT}
                            className={`h-9 border bg-transparent px-3 text-xs outline-none focus:border-gray-500 cursor-pointer ${selectStyle}`}
                        >
                            <option value="latest">Terbaru</option>
                            <option value="popular">Terpopuler</option>
                        </select>

                        {/* Active filters */}
                        {hasFilter && (
                            <div className="ml-auto flex items-center gap-3">
                                {selectedKat && (
                                    <span style={FONT}
                                        className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {selectedKat.nama}
                                        <button onClick={() => apply('category_id', '')}><X className="size-3" /></button>
                                    </span>
                                )}
                                {selectedWil && (
                                    <span style={FONT}
                                        className="flex items-center gap-1.5 bg-gray-900 text-[#EDE8DC] px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                        {selectedWil.nama}
                                        <button onClick={() => apply('wilayah_id', '')}><X className="size-3" /></button>
                                    </span>
                                )}
                                <button onClick={clear} style={FONT}
                                    className={`text-[10px] font-black uppercase tracking-widest transition-colors ${mutedColor} hover:text-gray-900`}>
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Card Grid ── */}
            <section className={`${contentBg} min-h-[400px]`}>
                <div className="mx-auto max-w-screen-xl px-8 py-12">
                    {konten.data.length === 0 ? (
                        <div className="py-32 text-center">
                            <p style={FONT} className={`text-xs font-black uppercase tracking-widest ${mutedColor}`}>
                                Tidak ada konten yang sesuai
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${isVideoMode ? 'lg:grid-cols-4 gap-y-8' : 'lg:grid-cols-3 gap-10'}`}>
                                {konten.data.map((item) => (
                                    <KontenCard
                                        key={item.id}
                                        konten={item}
                                        variant={isVideoMode ? 'video' : 'default'}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className={`mt-14 border-t pt-8 flex justify-center ${borderColor}`}>
                                <PaginationLinks links={konten.links} />
                            </div>

                            <p style={FONT}
                                className={`mt-4 text-center text-[10px] font-semibold uppercase tracking-widest ${mutedColor}`}>
                                Halaman {konten.current_page} dari {konten.last_page} · {konten.total} konten
                            </p>
                        </>
                    )}
                </div>
            </section>

        </PublicLayout>
    );
}
