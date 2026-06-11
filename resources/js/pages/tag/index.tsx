import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Paginated, Tag } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Hash, PlusCircle, Trash } from 'lucide-react';
import { useState } from 'react';

interface Props { tags: Paginated<Tag>; filters: { search?: string } }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tag', href: '/tag' }];

export default function TagIndex({ tags, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tag" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <form onSubmit={(e) => { e.preventDefault(); router.get('/tag', { search }, { preserveState: true }); }} className="flex gap-2">
                        <Input placeholder="Cari tag..." className="w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>
                    <Button asChild><Link href="/tag/create"><PlusCircle /> Tambah</Link></Button>
                </div>
                {tags.data.length === 0 ? <EmptyState icon={Hash} title="Belum ada tag" description="Tambah tag untuk membantu pencarian konten." /> : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Slug</TableHead><TableHead className="text-center">Konten</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {tags.data.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">#{t.nama}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{t.slug}</TableCell>
                                        <TableCell className="text-center text-sm">{t.konten_budayas_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-1">
                                                <Button size="icon-sm" variant="outline" asChild><Link href={`/tag/${t.id}/edit`}><Edit2 /></Link></Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button size="icon-sm" variant="outline" className="hover:bg-red-50 hover:text-red-600"><Trash /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus tag #{t.nama}?</AlertDialogTitle><AlertDialogDescription>Tag ini akan dihapus dari semua konten yang menggunakannya.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white" onClick={() => router.delete(`/tag/${t.id}`)}>Hapus</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent></AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <PaginationLinks links={tags.links} />
            </div>
        </AppLayout>
    );
}
