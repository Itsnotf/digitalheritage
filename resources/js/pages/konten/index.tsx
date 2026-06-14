import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, KontenBudaya, Paginated, Wilayah } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Music, Play, Search } from 'lucide-react';
import { useState } from 'react';

function isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(url);
}

function ThumbnailCell({ item }: { item: KontenBudaya }) {
    const coverSrc = item.cover_url && isImageUrl(item.cover_url) ? item.cover_url : null;
    const tipe = item.primary_media?.tipe ?? 'document';

    if (coverSrc) {
        return <img src={coverSrc} alt="" className="size-full object-cover" />;
    }
    const cls = tipe === 'video'
        ? 'flex size-full items-center justify-center bg-gradient-to-br from-stone-600 to-stone-900'
        : tipe === 'audio'
        ? 'flex size-full items-center justify-center bg-gradient-to-br from-[#7c2d12] to-stone-900'
        : 'flex size-full items-center justify-center bg-muted';
    return (
        <div className={cls}>
            {tipe === 'video' && <Play className="size-3.5 text-white/70" />}
            {tipe === 'audio' && <Music className="size-3.5 text-white/70" />}
            {(tipe === 'image' || tipe === 'document') && <FileText className="size-4 text-muted-foreground" />}
        </div>
    );
}

interface Props {
    konten: Paginated<KontenBudaya>;
    kategoris: Category[];
    wilayahs: Wilayah[];
    filters: { search?: string; status?: string; category_id?: string; wilayah_id?: string };
    flash?: { success?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Semua Konten', href: '/konten' }];

export default function KontenIndex({ konten, kategoris, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get('/konten', { ...filters, [key]: value || undefined, search }, {
            preserveState: true, replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Semua Konten" />

            <div className="space-y-4 p-6">
                {/* Filter bar */}
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari judul konten..."
                                className="w-64 pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>

                    <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Menunggu Review</SelectItem>
                            <SelectItem value="published">Tayang</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.category_id ?? 'all'} onValueChange={(v) => applyFilter('category_id', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {kategoris.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.wilayah_id ?? 'all'} onValueChange={(v) => applyFilter('wilayah_id', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Semua Wilayah" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Wilayah</SelectItem>
                            {wilayahs.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Info total */}
                <p className="text-sm text-muted-foreground">
                    {konten.total} konten ditemukan
                </p>

                {/* Table */}
                {konten.data.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="Tidak ada konten"
                        description="Tidak ada konten yang sesuai dengan filter yang dipilih."
                    />
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14"></TableHead>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Wilayah</TableHead>
                                    <TableHead>Kontributor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {konten.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="size-10 overflow-hidden rounded-md bg-muted">
                                                <ThumbnailCell item={item} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="max-w-48 truncate text-sm font-medium">{item.judul}</p>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.category?.nama}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.wilayah?.nama}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{item.user?.name}</TableCell>
                                        <TableCell><StatusBadge status={item.status} size="sm" /></TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/konten/${item.slug}`}>Review</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <PaginationLinks links={konten.links} />
            </div>
        </AppLayout>
    );
}
