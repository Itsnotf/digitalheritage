import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Wilayah', href: '/wilayah' }, { title: 'Tambah', href: '/wilayah/create' }];

export default function WilayahCreate() {
    const { data, setData, post, errors, processing } = useForm({ nama: '', tipe: '' });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Wilayah" />
            <div className="max-w-lg p-6">
                <Card>
                    <CardHeader><CardTitle>Tambah Wilayah</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); post('/wilayah'); }} className="space-y-4">
                            <div><Label>Nama <span className="text-destructive">*</span></Label><Input className="mt-1.5" placeholder="cth: Kabupaten Musi Banyuasin" value={data.nama} onChange={(e) => setData('nama', e.target.value)} />{errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}</div>
                            <div>
                                <Label>Tipe <span className="text-destructive">*</span></Label>
                                <Select value={data.tipe} onValueChange={(v) => setData('tipe', v)}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pilih tipe..." /></SelectTrigger>
                                    <SelectContent><SelectItem value="kota">Kota</SelectItem><SelectItem value="kabupaten">Kabupaten</SelectItem></SelectContent>
                                </Select>
                                {errors.tipe && <p className="mt-1 text-xs text-destructive">{errors.tipe}</p>}
                            </div>
                            <div className="flex gap-2 pt-2"><Button type="submit" disabled={processing}>Simpan</Button><Button type="button" variant="outline" onClick={() => history.back()}>Batal</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
