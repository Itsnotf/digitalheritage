import AppLayout from '@/layouts/app-layout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { Image, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface SitePage {
    id: number; key: string; title: string | null; subtitle: string | null;
    hero_image: string | null; hero_image_url: string | null;
    content: Record<string, any> | null;
}

interface Props { page: SitePage; flash?: { success?: string } }

const PAGE_LABELS: Record<string, string> = {
    'tentang-kami': 'Tentang Kami',
    'kontak': 'Kontak',
};

export default function PageManagerEdit({ page, flash }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Halaman', href: '/halaman' },
        { title: PAGE_LABELS[page.key] ?? page.key, href: `/halaman/${page.key}/edit` },
    ];

    const [content, setContent] = useState<Record<string, any>>(page.content ?? {});
    const [title, setTitle]     = useState(page.title ?? '');
    const [subtitle, setSubtitle] = useState(page.subtitle ?? '');
    const [heroPreview, setHeroPreview] = useState<string | null>(page.hero_image_url);
    const [processing, setProcessing]   = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const updateContent = (key: string, value: any) => setContent((prev) => ({ ...prev, [key]: value }));

    const updateMisiItem = (index: number, value: string) => {
        const items = [...(content.misi_items ?? [])];
        items[index] = value;
        updateContent('misi_items', items);
    };
    const addMisiItem = () => updateContent('misi_items', [...(content.misi_items ?? []), '']);
    const removeMisiItem = (i: number) => updateContent('misi_items', (content.misi_items ?? []).filter((_: any, j: number) => j !== i));

    const saveContent = () => {
        setProcessing(true);
        router.put(`/halaman/${page.key}`, { title, subtitle, content }, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setHeroPreview(URL.createObjectURL(file));
        const data = new FormData();
        data.append('hero_image', file);
        router.post(`/halaman/${page.key}/hero`, data);
    };

    const removeHero = () => {
        setHeroPreview(null);
        router.delete(`/halaman/${page.key}/hero`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-6 max-w-4xl">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {/* ── Hero Image ── */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Image</CardTitle>
                        <CardDescription>Gambar yang tampil di bagian atas halaman. Rekomendasi: 1920×600px, format JPG/PNG/WebP, maks. 5MB.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative overflow-hidden rounded-lg bg-muted" style={{ height: 220 }}>
                            {heroPreview ? (
                                <>
                                    <img src={heroPreview} alt="Hero preview" className="size-full object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                                        <Button size="sm" onClick={() => fileRef.current?.click()}>
                                            <Upload className="size-4" /> Ganti Foto
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="destructive"><Trash2 className="size-4" /> Hapus</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus hero image?</AlertDialogTitle>
                                                    <AlertDialogDescription>Halaman akan menggunakan tampilan default tanpa gambar.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive text-white" onClick={removeHero}>Hapus</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </>
                            ) : (
                                <div className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors" onClick={() => fileRef.current?.click()}>
                                    <Image className="size-12 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">Klik untuk upload hero image</p>
                                </div>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleHeroChange} />
                        {!heroPreview && (
                            <Button variant="outline" onClick={() => fileRef.current?.click()}>
                                <Upload className="size-4" /> Upload Hero Image
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* ── Meta ── */}
                <Card>
                    <CardHeader><CardTitle>Meta Halaman</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Judul Halaman</Label>
                            <Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul untuk tab browser" />
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Input className="mt-1.5" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Deskripsi singkat halaman" />
                        </div>
                    </CardContent>
                </Card>

                {/* ── Konten spesifik per halaman ── */}
                {page.key === 'tentang-kami' && (
                    <Card>
                        <CardHeader><CardTitle>Konten Tentang Kami</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label>Heading Utama</Label>
                                <Input className="mt-1.5" value={content.heading ?? ''} onChange={(e) => updateContent('heading', e.target.value)} />
                            </div>
                            <div>
                                <Label>Paragraf Intro</Label>
                                <textarea rows={4} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    value={content.intro ?? ''} onChange={(e) => updateContent('intro', e.target.value)} />
                            </div>
                            <div className="h-px bg-border" />
                            <div>
                                <Label>Visi</Label>
                                <textarea rows={3} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                    value={content.visi ?? ''} onChange={(e) => updateContent('visi', e.target.value)} />
                            </div>
                            <div>
                                <Label>Misi</Label>
                                <div className="mt-1.5 space-y-2">
                                    {(content.misi_items ?? []).map((item: string, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <Input value={item} onChange={(e) => updateMisiItem(i, e.target.value)} placeholder={`Poin misi ${i + 1}`} />
                                            <Button variant="outline" size="icon" onClick={() => removeMisiItem(i)} className="shrink-0 text-red-500 hover:bg-red-50">✕</Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addMisiItem}>+ Tambah Poin Misi</Button>
                                </div>
                            </div>
                            <div className="h-px bg-border" />
                            {[['section_1', 'Section 1'], ['section_2', 'Section 2']].map(([key, label]) => (
                                <div key={key} className="space-y-3">
                                    <Label className="text-base font-semibold">{label}</Label>
                                    <Input value={content[`${key}_title`] ?? ''} onChange={(e) => updateContent(`${key}_title`, e.target.value)} placeholder="Judul section" />
                                    <textarea rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                        value={content[`${key}_content`] ?? ''} onChange={(e) => updateContent(`${key}_content`, e.target.value)} placeholder="Isi konten section" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {page.key === 'kontak' && (
                    <Card>
                        <CardHeader><CardTitle>Informasi Kontak</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { field: 'heading',         label: 'Heading',           placeholder: 'Hubungi Kami' },
                                { field: 'intro',           label: 'Intro',             placeholder: 'Paragraf pembuka...' },
                                { field: 'alamat',          label: 'Alamat',            placeholder: 'Jl. ..., Palembang' },
                                { field: 'telepon',         label: 'Telepon / WA',      placeholder: '+62 ...' },
                                { field: 'email',           label: 'Email',             placeholder: 'info@budayasumsel.id' },
                                { field: 'jam_operasional', label: 'Jam Operasional',   placeholder: 'Senin–Jumat, 08.00–17.00' },
                                { field: 'instagram',       label: 'Instagram',         placeholder: '@budaya_sumsel' },
                                { field: 'facebook',        label: 'Facebook',          placeholder: 'BudayaSumsel' },
                            ].map(({ field, label, placeholder }) => (
                                <div key={field}>
                                    <Label>{label}</Label>
                                    {field === 'intro' ? (
                                        <textarea rows={3} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                            value={content[field] ?? ''} onChange={(e) => updateContent(field, e.target.value)} placeholder={placeholder} />
                                    ) : (
                                        <Input className="mt-1.5" value={content[field] ?? ''} onChange={(e) => updateContent(field, e.target.value)} placeholder={placeholder} />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-3 pb-6">
                    <Button onClick={saveContent} disabled={processing} className="min-w-32">
                        {processing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                    </Button>
                    <Button variant="outline" onClick={() => history.back()}>Batal</Button>
                </div>
            </div>
        </AppLayout>
    );
}
