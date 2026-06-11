import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, KontenBudaya, MediaFile, Wilayah } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Star, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Props { konten: KontenBudaya; kategoris: Category[]; wilayahs: Wilayah[] }

export default function KontribusiEdit({ konten, kategoris, wilayahs }: Props) {
    const [form, setForm] = useState({
        judul: konten.judul,
        deskripsi: konten.deskripsi,
        category_id: String(konten.category_id),
        wilayah_id: String(konten.wilayah_id),
    });
    const [tags, setTags] = useState<string[]>(konten.tags?.map((t) => t.nama) ?? []);
    const [tagInput, setTagInput] = useState('');
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [deleteMediaIds, setDeleteMediaIds] = useState<number[]>([]);
    const [primaryMediaId, setPrimaryMediaId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Konten Saya', href: '/kontribusi' },
        { title: konten.judul, href: `/kontribusi/${konten.id}` },
        { title: 'Edit', href: `/kontribusi/${konten.id}/edit` },
    ];

    const existingMedia = (konten.media_files ?? []).filter((m) => !deleteMediaIds.includes(m.id));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const data = new FormData();
        data.append('_method', 'PUT');
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        tags.forEach((t) => data.append('tags[]', t));
        newFiles.forEach((f) => data.append('files[]', f));
        deleteMediaIds.forEach((id) => data.append('delete_media[]', String(id)));
        if (primaryMediaId) data.append('primary_media', String(primaryMediaId));
        router.post(`/kontribusi/${konten.id}`, data, { onError: () => setProcessing(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${konten.judul}`} />
            {konten.status === 'rejected' && (
                <div className="mx-6 mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                    <strong>Sedang merevisi konten yang ditolak.</strong> Setelah kamu simpan, konten akan otomatis masuk ke antrian review ulang.
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 p-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader><CardTitle>Informasi Konten</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul</Label>
                                    <Input id="judul" className="mt-1.5" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <textarea id="deskripsi" rows={5} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Kategori</Label>
                                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{kategoris.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Wilayah</Label>
                                        <Select value={form.wilayah_id} onValueChange={(v) => setForm({ ...form, wilayah_id: v })}>
                                            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                                            <SelectContent>{wilayahs.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Tag</Label>
                                    <div className="mt-1.5 flex gap-2">
                                        <Input placeholder="Tambah tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(''); } } }} />
                                        <Button type="button" variant="outline" onClick={() => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }}>+</Button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {tags.map((t) => (<span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">{t}<button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}><X className="size-3" /></button></span>))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>File Media</CardTitle><CardDescription>Kelola file yang sudah ada atau tambah file baru.</CardDescription></CardHeader>
                            <CardContent className="space-y-3">
                                {existingMedia.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">File saat ini</p>
                                        {existingMedia.map((file) => (
                                            <div key={file.id} className={`flex items-center gap-3 rounded-lg border p-3 ${primaryMediaId === file.id || (!primaryMediaId && file.is_primary) ? 'border-primary bg-primary/5' : ''}`}>
                                                <FileText className="size-8 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm">{file.filename}</p>
                                                    <p className="text-xs text-muted-foreground">{file.tipe}</p>
                                                </div>
                                                <button type="button" title="Jadikan cover" onClick={() => setPrimaryMediaId(file.id)} className={`text-amber-500 ${primaryMediaId === file.id || (!primaryMediaId && file.is_primary) ? 'opacity-100' : 'opacity-30 hover:opacity-70'}`}>
                                                    <Star className="size-4" />
                                                </button>
                                                <button type="button" onClick={() => setDeleteMediaIds([...deleteMediaIds, file.id])} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="cursor-pointer rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Klik untuk tambah file baru</p>
                                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf" className="hidden" onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files ?? [])])} />
                                </div>
                                {newFiles.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">File baru yang akan ditambahkan</p>
                                        {newFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                                                <span className="truncate">{f.name}</span>
                                                <button type="button" onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))}><X className="size-4 text-muted-foreground" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="sticky top-6">
                            <CardContent className="space-y-3 pt-6">
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {konten.status === 'rejected' ? 'Simpan & Kirim Ulang' : 'Simpan Perubahan'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => history.back()}>Batal</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
