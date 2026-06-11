import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, FolderOpen, PlusCircle, Trash } from 'lucide-react';
import { useState } from 'react';

interface Props { kategoris: Paginated<Category>; filters: { search?: string }; flash?: { success?: string } }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori', href: '/kategori' }];

export default function KategoriIndex({ kategoris, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <form onSubmit={(e) => { e.preventDefault(); router.get('/kategori', { search }, { preserveState: true }); }} className="flex gap-2">
                        <Input placeholder="Cari kategori..." className="w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>
                    <Button asChild><Link href="/kategori/create"><PlusCircle /> Tambah</Link></Button>
                </div>
                {kategoris.data.length === 0 ? (
                    <EmptyState icon={FolderOpen} title="Belum ada kategori" description="Tambah kategori untuk mengorganisir konten budaya." action={<Button asChild><Link href="/kategori/create"><PlusCircle /> Tambah Kategori</Link></Button>} />
                ) : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Induk</TableHead><TableHead className="text-center">Konten</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {kategoris.data.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell><p className="font-medium">{k.nama}</p>{k.deskripsi && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{k.deskripsi}</p>}</TableCell>
                                        <TableCell>{k.parent ? <Badge variant="outline">{k.parent.nama}</Badge> : <span className="text-xs text-muted-foreground">Utama</span>}</TableCell>
                                        <TableCell className="text-center text-sm">{k.konten_budayas_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-1">
                                                <Button size="icon-sm" variant="outline" asChild><Link href={`/kategori/${k.id}/edit`}><Edit2 /></Link></Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button size="icon-sm" variant="outline" className="hover:bg-red-50 hover:text-red-600"><Trash /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus "{k.nama}"?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white" onClick={() => router.delete(`/kategori/${k.id}`)}>Hapus</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent></AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <PaginationLinks links={kategoris.links} />
            </div>
        </AppLayout>
    );
}
