import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props { parentOptions: Category[] }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori', href: '/kategori' }, { title: 'Tambah', href: '/kategori/create' }];

export default function KategoriCreate({ parentOptions }: Props) {
    const { data, setData, post, errors, processing } = useForm({ nama: '', deskripsi: '', icon: '', parent_id: '', urutan: '0' });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kategori" />
            <div className="max-w-2xl p-6">
                <Card>
                    <CardHeader><CardTitle>Tambah Kategori</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); post('/kategori'); }} className="space-y-4">
                            <div><Label>Nama <span className="text-destructive">*</span></Label><Input className="mt-1.5" value={data.nama} onChange={(e) => setData('nama', e.target.value)} />{errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}</div>
                            <div><Label>Deskripsi</Label><textarea className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" rows={3} value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} /></div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div><Label>Icon Lucide</Label><Input className="mt-1.5" placeholder="cth: music, home, utensils" value={data.icon} onChange={(e) => setData('icon', e.target.value)} /></div>
                                <div><Label>Urutan</Label><Input className="mt-1.5" type="number" min="0" value={data.urutan} onChange={(e) => setData('urutan', e.target.value)} /></div>
                            </div>
                            <div>
                                <Label>Kategori Induk</Label>
                                <Select value={data.parent_id || 'none'} onValueChange={(v) => setData('parent_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Tidak ada (kategori utama)" /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">Tidak ada (kategori utama)</SelectItem>{parentOptions.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-2"><Button type="submit" disabled={processing}>Simpan</Button><Button type="button" variant="outline" onClick={() => history.back()}>Batal</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
