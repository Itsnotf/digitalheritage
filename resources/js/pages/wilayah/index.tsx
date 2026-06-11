import EmptyState from '@/components/empty-state';
import PaginationLinks from '@/components/pagination-links';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Paginated, Wilayah } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, MapPin, PlusCircle, Trash } from 'lucide-react';
import { useState } from 'react';

interface Props { wilayahs: Paginated<Wilayah>; filters: { search?: string } }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Wilayah', href: '/wilayah' }];

export default function WilayahIndex({ wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wilayah" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <form onSubmit={(e) => { e.preventDefault(); router.get('/wilayah', { search }, { preserveState: true }); }} className="flex gap-2">
                        <Input placeholder="Cari wilayah..." className="w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>
                    <Button asChild><Link href="/wilayah/create"><PlusCircle /> Tambah</Link></Button>
                </div>
                {wilayahs.data.length === 0 ? <EmptyState icon={MapPin} title="Belum ada wilayah" description="Tambah kabupaten/kota di Sumatera Selatan." /> : (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Tipe</TableHead><TableHead className="text-center">Konten</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {wilayahs.data.map((w) => (
                                    <TableRow key={w.id}>
                                        <TableCell className="font-medium">{w.nama}</TableCell>
                                        <TableCell><Badge variant="outline" className="capitalize">{w.tipe}</Badge></TableCell>
                                        <TableCell className="text-center text-sm">{w.konten_budayas_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex gap-1">
                                                <Button size="icon-sm" variant="outline" asChild><Link href={`/wilayah/${w.id}/edit`}><Edit2 /></Link></Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button size="icon-sm" variant="outline" className="hover:bg-red-50 hover:text-red-600"><Trash /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus "{w.nama}"?</AlertDialogTitle><AlertDialogDescription>Tindakan ini tidak bisa dibatalkan.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white" onClick={() => router.delete(`/wilayah/${w.id}`)}>Hapus</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent></AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                <PaginationLinks links={wilayahs.links} />
            </div>
        </AppLayout>
    );
}
