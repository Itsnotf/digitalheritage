import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Tag } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props { tag: Tag }

export default function TagEdit({ tag }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tag', href: '/tag' }, { title: 'Edit', href: `/tag/${tag.id}/edit` }];
    const { data, setData, put, errors, processing } = useForm({ nama: tag.nama });
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Tag: ${tag.nama}`} />
            <div className="max-w-lg p-6">
                <Card>
                    <CardHeader><CardTitle>Edit Tag: #{tag.nama}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); put(`/tag/${tag.id}`); }} className="space-y-4">
                            <div><Label>Nama Tag</Label><Input className="mt-1.5" value={data.nama} onChange={(e) => setData('nama', e.target.value)} />{errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama}</p>}</div>
                            <div className="flex gap-2 pt-2"><Button type="submit" disabled={processing}>Simpan</Button><Button type="button" variant="outline" onClick={() => history.back()}>Batal</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
