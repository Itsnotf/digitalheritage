import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface Surat {
    filename: string | null;
    ukuran_kb: number | null;
    file_url: string | null;
    updated_at: string | null;
}

interface Props {
    surat: Surat;
    flash?: { success?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Surat Pernyataan', href: '/surat-pernyataan' },
];

export default function SuratPernyataanEdit({ surat, flash }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);

        setProcessing(true);
        router.post('/surat-pernyataan', data, {
            forceFormData: true,
            onFinish: () => {
                setProcessing(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Pernyataan" />

            <div className="space-y-6 p-6 max-w-2xl">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Template Surat Pernyataan</CardTitle>
                        <CardDescription>
                            File PDF kosong yang akan diunduh kontributor sebelum mengunggah konten. Mereka akan
                            mencetak, mengisi, menandatangani, lalu mengunggah kembali hasil scan-nya saat submit konten.
                            Tabel ini cuma menyimpan 1 versi — upload file baru akan menggantikan yang lama.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {surat.file_url ? (
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                                <FileText className="size-8 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{surat.filename}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {surat.ukuran_kb ? `${(surat.ukuran_kb / 1024).toFixed(1)} MB` : ''}
                                        {surat.updated_at && ` · Diperbarui ${new Date(surat.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                                    </p>
                                </div>
                                <a href={surat.file_url} target="_blank" rel="noreferrer">
                                    <Button type="button" variant="outline" size="sm">Lihat</Button>
                                </a>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                Belum ada template diunggah. Kontributor tidak akan bisa mengirim konten baru
                                sampai template ini tersedia.
                            </div>
                        )}

                        <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleChange} />
                        <Button onClick={() => fileRef.current?.click()} disabled={processing}>
                            <Upload className="size-4" />
                            {processing ? 'Mengunggah...' : surat.file_url ? 'Ganti Template' : 'Upload Template'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
