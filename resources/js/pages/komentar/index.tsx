import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Comment, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, EyeOff, MessageSquare, Trash } from 'lucide-react';
import { useState } from 'react';

interface Props { komentar: Paginated<Comment>; filters: { search?: string; status?: string } }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Komentar', href: '/komentar' }];

export default function KomentarIndex({ komentar, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderasi Komentar" />
            <div className="space-y-4 p-6">
                <h1 className="text-xl font-semibold">Moderasi Komentar</h1>
                <div className="flex flex-wrap gap-2">
                    <form onSubmit={(e) => { e.preventDefault(); router.get('/komentar', { ...filters, search }, { preserveState: true }); }} className="flex gap-2">
                        <Input placeholder="Cari isi komentar..." className="w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>
                    <Select value={filters.status ?? 'all'} onValueChange={(v) => router.get('/komentar', { ...filters, status: v === 'all' ? undefined : v }, { preserveState: true })}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="aktif">Aktif</SelectItem><SelectItem value="tersembunyi">Tersembunyi</SelectItem></SelectContent>
                    </Select>
                </div>
                {komentar.data.length === 0 ? <EmptyState icon={MessageSquare} title="Tidak ada komentar" description="Tidak ada komentar yang sesuai filter." /> : (
                    <div className="divide-y rounded-lg border">
                        {komentar.data.map((c) => (
                            <div key={c.id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-medium">{c.user?.name}</span>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <Link href={`/konten/${c.konten_id}`} className="text-xs text-muted-foreground hover:underline">
                                                {c.konten?.judul ?? `Konten #${c.konten_id}`}
                                            </Link>
                                            <Badge variant={c.status === 'aktif' ? 'default' : 'secondary'} className="text-xs">
                                                {c.status === 'aktif' ? 'Aktif' : 'Tersembunyi'}
                                            </Badge>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${c.status === 'tersembunyi' ? 'text-muted-foreground line-through opacity-60' : ''}`}>{c.isi}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon-sm" variant="outline" title={c.status === 'aktif' ? 'Sembunyikan' : 'Tampilkan'} onClick={() => router.patch(`/komentar/${c.id}/hide`)}>
                                            {c.status === 'aktif' ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </Button>
                                        <AlertDialog><AlertDialogTrigger asChild><Button size="icon-sm" variant="outline" className="hover:bg-red-50 hover:text-red-600"><Trash className="size-3.5" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus komentar?</AlertDialogTitle><AlertDialogDescription>Komentar ini akan dihapus permanen.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white" onClick={() => router.delete(`/komentar/${c.id}`)}>Hapus</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent></AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <PaginationLinks links={komentar.links} />
            </div>
        </AppLayout>
    );
}
