import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Wilayah } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props { wilayah: Wilayah }

export default function WilayahEdit({ wilayah }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Wilayah', href: '/wilayah' }, { title: 'Edit', href: `/wilayah/${wilayah.id}/edit` }];
    const { data, setData, put, errors, processing } = useForm({ nama: wilayah.nama, tipe: wilayah.tipe });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${wilayah.nama}`} />
            <div className="max-w-lg p-6">
                <Card>
                    <CardHeader><CardTitle>Edit: {wilayah.nama}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); put(`/wilayah/${wilayah.id}`); }} className="space-y-4">
                            <div><Label>Nama</Label><Input className="mt-1.5" value={data.nama} onChange={(e) => setData('nama', e.target.value)} />{errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}</div>
                            <div>
                                <Label>Tipe</Label>
                                <Select value={data.tipe} onValueChange={(v: 'kota' | 'kabupaten') => setData('tipe', v)}>
                                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="kota">Kota</SelectItem><SelectItem value="kabupaten">Kabupaten</SelectItem></SelectContent>
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
