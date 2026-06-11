import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, KontenBudaya, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Eye, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface Props {
    konten: Paginated<KontenBudaya>;
    filters: { search?: string; status?: string };
    flash?: { success?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Konten Saya', href: '/kontribusi' }];

export default function KontribusiIndex({ konten, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        router.get('/kontribusi', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konten Saya" />

            <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Konten Saya</h1>
                    <Button asChild>
                        <Link href="/kontribusi/create"><PlusCircle /> Upload Konten</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <form onSubmit={(e) => { e.preventDefault(); applyFilter('search', search); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Cari konten..." className="w-56 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                </div>

                {konten.data.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="Belum ada konten"
                        description="Mulai kontribusi dengan mengupload konten budaya Sumatera Selatan pertamamu."
                        action={
                            <Button asChild>
                                <Link href="/kontribusi/create"><PlusCircle /> Upload Konten</Link>
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {konten.data.map((item) => (
                            <Link key={item.id} href={`/kontribusi/${item.id}`} className="group block">
                                <div className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
                                    {/* Cover */}
                                    <div className="relative aspect-[16/9] bg-muted">
                                        {item.cover_url ? (
                                            <img src={item.cover_url} alt={item.judul} className="size-full object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <BookOpen className="size-10 text-muted-foreground/40" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2">
                                            <StatusBadge status={item.status} size="sm" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug">{item.judul}</h3>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{item.category?.nama}</span>
                                            <span className="flex items-center gap-1"><Eye className="size-3" />{item.view_count}</span>
                                        </div>
                                        {item.status === 'rejected' && item.catatan_admin && (
                                            <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                Ditolak: {item.catatan_admin.substring(0, 60)}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <PaginationLinks links={konten.links} />
            </div>
        </AppLayout>
    );
}
