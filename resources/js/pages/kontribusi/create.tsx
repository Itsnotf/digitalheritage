import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Category, Wilayah } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FileText, Headphones, ImageIcon, Upload, Video, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface CoverPreview { file: File; preview: string }

interface Props { kategoris: Category[]; wilayahs: Wilayah[] }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konten Saya', href: '/kontribusi' },
    { title: 'Upload Konten', href: '/kontribusi/create' },
];

interface FilePreview { file: File; preview?: string; tipe: string }

function detectTipe(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
}

function FileIcon({ tipe }: { tipe: string }) {
    if (tipe === 'image') return <ImageIcon className="size-5 text-blue-500" />;
    if (tipe === 'video') return <Video className="size-5 text-purple-500" />;
    if (tipe === 'audio') return <Headphones className="size-5 text-orange-500" />;
    return <FileText className="size-5 text-gray-500" />;
}

export default function KontribusiCreate({ kategoris, wilayahs }: Props) {
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [coverImage, setCoverImage] = useState<CoverPreview | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        judul: '', deskripsi: '', category_id: '', wilayah_id: '',
    });

    const addFiles = useCallback((newFiles: File[]) => {
        const previews: FilePreview[] = newFiles.map((file) => {
            const tipe = detectTipe(file);
            const preview = (tipe === 'image' || tipe === 'video' || tipe === 'audio')
                ? URL.createObjectURL(file)
                : undefined;
            return { file, preview, tipe };
        });
        setFiles((prev) => [...prev, ...previews].slice(0, 10));
    }, []);

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const copy = [...prev];
            if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!);
            copy.splice(index, 1);
            return copy;
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(Array.from(e.dataTransfer.files));
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t) && tags.length < 10) {
            setTags((prev) => [...prev, t]);
            setTagInput('');
        }
    };

    const handleCoverChange = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage({ file, preview: URL.createObjectURL(file) });
    };

    const removeCover = () => {
        if (coverImage?.preview) URL.revokeObjectURL(coverImage.preview);
        setCoverImage(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!form.judul) newErrors.judul = 'Judul wajib diisi.';
        if (form.deskripsi.length < 50) newErrors.deskripsi = 'Deskripsi minimal 50 karakter.';
        if (!form.category_id) newErrors.category_id = 'Kategori wajib dipilih.';
        if (!form.wilayah_id) newErrors.wilayah_id = 'Wilayah wajib dipilih.';
        if (files.length === 0) newErrors.files = 'Minimal 1 file media wajib diunggah.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setProcessing(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        tags.forEach((t) => data.append('tags[]', t));
        files.forEach((f) => data.append('files[]', f.file));
        if (coverImage) data.append('cover_image', coverImage.file);

        router.post('/kontribusi', data, {
            onError: (e) => { setErrors(e); setProcessing(false); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Konten Budaya" />

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 p-6 lg:grid-cols-3">
                    {/* Kolom kiri — metadata */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Konten</CardTitle>
                                <CardDescription>Isi detail informasi konten budaya yang akan diunggah.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="judul"
                                        className="mt-1.5"
                                        placeholder="Contoh: Tari Gending Sriwijaya dari Palembang"
                                        value={form.judul}
                                        onChange={(e) => setForm({ ...form, judul: e.target.value })}
                                    />
                                    {errors.judul && <p className="mt-1 text-xs text-destructive">{errors.judul}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="deskripsi">
                                        Deskripsi <span className="text-destructive">*</span>
                                        <span className="ml-1 font-normal text-muted-foreground">(min. 50 karakter)</span>
                                    </Label>
                                    <textarea
                                        id="deskripsi"
                                        rows={5}
                                        className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                                        placeholder="Jelaskan konten budaya ini secara detail — sejarah, asal daerah, makna budaya, cara penyajian, dll."
                                        value={form.deskripsi}
                                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    />
                                    <div className="mt-1 flex justify-between">
                                        {errors.deskripsi
                                            ? <p className="text-xs text-destructive">{errors.deskripsi}</p>
                                            : <span />
                                        }
                                        <span className={`text-xs ${form.deskripsi.length < 50 ? 'text-muted-foreground' : 'text-emerald-600'}`}>
                                            {form.deskripsi.length} karakter
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Kategori <span className="text-destructive">*</span></Label>
                                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                                            <SelectTrigger className="mt-1.5">
                                                <SelectValue placeholder="Pilih kategori..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {kategoris.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="mt-1 text-xs text-destructive">{errors.category_id}</p>}
                                    </div>

                                    <div>
                                        <Label>Wilayah <span className="text-destructive">*</span></Label>
                                        <Select value={form.wilayah_id} onValueChange={(v) => setForm({ ...form, wilayah_id: v })}>
                                            <SelectTrigger className="mt-1.5">
                                                <SelectValue placeholder="Pilih wilayah..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wilayahs.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.wilayah_id && <p className="mt-1 text-xs text-destructive">{errors.wilayah_id}</p>}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <Label>Tag <span className="font-normal text-muted-foreground">(opsional, maks. 10)</span></Label>
                                    <div className="mt-1.5 flex gap-2">
                                        <Input
                                            placeholder="Tambah tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        />
                                        <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 10}>Tambah</Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {tags.map((t) => (
                                                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                                                    {t}
                                                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cover image */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gambar Cover <span className="font-normal text-muted-foreground text-sm">(Opsional)</span></CardTitle>
                                <CardDescription>
                                    Thumbnail yang ditampilkan di daftar konten. Wajib diisi jika file media hanya berupa audio atau video.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {coverImage ? (
                                    <div className="relative w-full max-w-xs">
                                        <img src={coverImage.preview} alt="Cover" className="aspect-video w-full rounded-lg object-cover border" />
                                        <button type="button" onClick={removeCover}
                                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                                            <X className="size-3.5" />
                                        </button>
                                        <p className="mt-1.5 truncate text-xs text-muted-foreground">{coverImage.file.name}</p>
                                    </div>
                                ) : (
                                    <div
                                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        onClick={() => coverInputRef.current?.click()}
                                    >
                                        <ImageIcon className="size-7 text-muted-foreground" />
                                        <p className="text-sm font-medium">Pilih gambar cover</p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Maks. 5MB</p>
                                    </div>
                                )}
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverChange(f); e.target.value = ''; }}
                                />
                                {errors.cover_image && <p className="mt-1 text-xs text-destructive">{errors.cover_image}</p>}
                            </CardContent>
                        </Card>

                        {/* Upload file */}
                        <Card>
                            <CardHeader>
                                <CardTitle>File Media</CardTitle>
                                <CardDescription>
                                    Upload gambar, video, audio, atau dokumen. Maks. 10 file, 200MB per file.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Drop zone */}
                                <div
                                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Klik atau drag & drop file di sini</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        JPG, PNG, WEBP, MP4, MP3, WAV, PDF · Maks. 200MB/file
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,audio/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                                    />
                                </div>

                                {errors.files && <p className="text-xs text-destructive">{errors.files}</p>}

                                {/* Preview files — INLINE: gambar tampil, video & audio bisa diputar */}
                                {files.length > 0 && (
                                    <div className="space-y-4">
                                        {files.map((f, i) => (
                                            <div key={i} className="rounded-lg border bg-muted/20 p-3">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <FileIcon tipe={f.tipe} />
                                                        <span className="truncate text-sm font-medium">{f.file.name}</span>
                                                        {i === 0 && (
                                                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Cover</span>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-muted-foreground hover:text-foreground">
                                                        <X className="size-4" />
                                                    </button>
                                                </div>

                                                {f.tipe === 'image' && f.preview && (
                                                    <img src={f.preview} alt={f.file.name} className="max-h-80 w-full rounded-md object-contain bg-black/5" />
                                                )}
                                                {f.tipe === 'video' && f.preview && (
                                                    <video src={f.preview} controls className="max-h-80 w-full rounded-md bg-black" />
                                                )}
                                                {f.tipe === 'audio' && f.preview && (
                                                    <audio src={f.preview} controls className="w-full" />
                                                )}
                                                {f.tipe === 'document' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {f.file.size >= 1048576 ? `${(f.file.size / 1048576).toFixed(1)} MB` : `${Math.round(f.file.size / 1024)} KB`} · Dokumen (preview tidak tersedia)
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Kolom kanan — submit */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-base">Siap Kirim?</CardTitle>
                                <CardDescription className="text-xs leading-relaxed">
                                    Konten akan masuk ke antrian review admin setelah dikirim. Admin akan memeriksa kesesuaian informasi sebelum konten ditayangkan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">Checklist sebelum kirim:</p>
                                    <ul className="space-y-1 pl-3">
                                        {[
                                            { ok: form.judul.length > 0, text: 'Judul diisi' },
                                            { ok: form.deskripsi.length >= 50, text: 'Deskripsi ≥ 50 karakter' },
                                            { ok: !!form.category_id, text: 'Kategori dipilih' },
                                            { ok: !!form.wilayah_id, text: 'Wilayah dipilih' },
                                            { ok: files.length > 0, text: 'Min. 1 file diunggah' },
                                        ].map(({ ok, text }) => (
                                            <li key={text} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                                <span>{ok ? '✓' : '○'}</span> {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Kirim untuk Review'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
