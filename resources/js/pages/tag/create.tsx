import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tag', href: '/tag' }, { title: 'Tambah', href: '/tag/create' }];

export default function TagCreate() {
    const { data, setData, post, errors, processing } = useForm({ nama: '' });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Tag" />
            <div className="max-w-lg p-6">
                <Card>
                    <CardHeader><CardTitle>Tambah Tag</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); post('/tag'); }} className="space-y-4">
                            <div><Label>Nama Tag <span className="text-destructive">*</span></Label><Input className="mt-1.5" placeholder="cth: songket, tari tradisional" value={data.nama} onChange={(e) => setData('nama', e.target.value)} />{errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}</div>
                            <div className="flex gap-2 pt-2"><Button type="submit" disabled={processing}>Simpan</Button><Button type="button" variant="outline" onClick={() => history.back()}>Batal</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
