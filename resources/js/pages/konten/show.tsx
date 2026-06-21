import MediaPreview from '@/components/media-preview';
import StatusBadge from '@/components/status-badge';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, KontenBudaya } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle, ChevronLeft, Eye, FileText, Image as ImageIcon, MapPin, Music, Play, Tag, User, XCircle,
} from 'lucide-react';
import { useState } from 'react';

function isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(url);
}

interface Props { konten: KontenBudaya; flash?: { success?: string } }

const aksiLabel: Record<string, string> = {
    approve: 'Disetujui', reject: 'Ditolak',
    user_revise: 'Pengguna memilih revisi', user_decline: 'Pengguna tidak merevisi',
};

export default function KontenShow({ konten }: Props) {
    const [rejectNote, setRejectNote] = useState('');
    const [rejectError, setRejectError] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Semua Konten', href: '/konten' },
        { title: konten.judul, href: `/konten/${konten.slug}` },
    ];

    const handleApprove = () => {
        router.patch(`/konten/${konten.slug}/approve`);
    };

    const handleReject = () => {
        if (rejectNote.trim().length < 10) {
            setRejectError('Alasan penolakan minimal 10 karakter.');
            return;
        }
        setRejectError('');
        router.patch(`/konten/${konten.slug}/reject`, { catatan: rejectNote });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review: ${konten.judul}`} />

            <div className="p-6">
                <Link href="/konten" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="size-4" /> Kembali ke daftar
                </Link>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Konten utama */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Header konten */}
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <StatusBadge status={konten.status} />
                                {konten.category && <Badge variant="outline">{konten.category.nama}</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold">{konten.judul}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><User className="size-4" />{konten.user?.name}</span>
                                <span className="flex items-center gap-1"><MapPin className="size-4" />{konten.wilayah?.nama}</span>
                                <span className="flex items-center gap-1"><Eye className="size-4" />{konten.view_count} views</span>
                                <span>{new Date(konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Deskripsi</CardTitle></CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{konten.deskripsi}</p>
                            </CardContent>
                        </Card>

                        {/* File media */}
                        {konten.media_files && konten.media_files.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">
                                        File Media ({konten.media_files.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MediaPreview items={konten.media_files.map((f) => ({
                                        tipe: f.tipe as 'image' | 'video' | 'audio' | 'document',
                                        url: f.url,
                                        filename: f.filename,
                                        mime_type: f.mime_type,
                                        ukuran_kb: f.ukuran_kb,
                                        durasi_detik: f.durasi_detik,
                                    }))} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Surat Pernyataan */}
                        {konten.surat_pernyataan_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">Surat Pernyataan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={konten.surat_pernyataan_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:border-primary/40"
                                    >
                                        <FileText className="size-5 text-muted-foreground" />
                                        <span>Lihat surat pernyataan yang sudah kamu unggah</span>
                                    </a>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tags */}
                        {konten.tags && konten.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Tag className="size-4 text-muted-foreground" />
                                {konten.tags.map((tag) => (
                                    <Badge key={tag.id} variant="secondary">{tag.nama}</Badge>
                                ))}
                            </div>
                        )}

                        {/* Riwayat moderasi */}
                        {konten.moderation_logs && konten.moderation_logs.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-sm text-muted-foreground">Riwayat Moderasi</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="relative space-y-4 pl-4 before:absolute before:top-0 before:bottom-0 before:left-[7px] before:w-px before:bg-border">
                                        {konten.moderation_logs.map((log) => (
                                            <div key={log.id} className="relative flex gap-3">
                                                <div className="absolute -left-4 top-1 flex size-3.5 items-center justify-center rounded-full border bg-background">
                                                    <div className={`size-1.5 rounded-full ${log.aksi === 'approve' ? 'bg-emerald-500' : log.aksi === 'reject' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">{aksiLabel[log.aksi] ?? log.aksi}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        oleh {log.user?.name} · {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {log.catatan && (
                                                        <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm italic">"{log.catatan}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Panel moderasi */}
                    <div className="space-y-4">
                        {/* Aksi moderasi */}
                        {konten.status !== 'published' && (
                            <Card className="border-2 border-dashed">
                                <CardHeader><CardTitle className="text-sm">Tindakan Moderasi</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {/* Approve */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                <CheckCircle /> Setujui & Tayangkan
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Setujui konten ini?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Konten akan langsung tayang dan bisa dilihat publik setelah disetujui.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                                                    Ya, Tayangkan
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    {/* Reject */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                <XCircle /> Tolak Konten
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Tolak konten ini?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Kontributor akan menerima alasan penolakan dan bisa memilih untuk merevisi atau tidak.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="px-6">
                                                <label className="mb-1.5 block text-sm font-medium">
                                                    Alasan penolakan <span className="text-destructive">*</span>
                                                </label>
                                                <textarea
                                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                                                    rows={4}
                                                    placeholder="Jelaskan alasan penolakan secara spesifik agar kontributor dapat memperbaikinya..."
                                                    value={rejectNote}
                                                    onChange={(e) => setRejectNote(e.target.value)}
                                                />
                                                {rejectError && <p className="mt-1 text-xs text-destructive">{rejectError}</p>}
                                            </div>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleReject} className="bg-destructive text-white hover:bg-destructive/90">
                                                    Tolak Konten
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        )}

                        {/* Status jika sudah published */}
                        {konten.status === 'published' && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle className="size-4" />
                                    <span className="text-sm font-medium">Konten sedang tayang</span>
                                </div>
                                {konten.approved_at && (
                                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
                                        Disetujui {new Date(konten.approved_at).toLocaleDateString('id-ID')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Cover thumbnail */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Cover Konten</CardTitle></CardHeader>
                            <CardContent>
                                {(() => {
                                    const coverSrc = konten.cover_url && isImageUrl(konten.cover_url) ? konten.cover_url : null;
                                    const primaryFile = konten.media_files?.find((f) => f.is_primary) ?? konten.media_files?.[0];
                                    const tipe = primaryFile?.tipe ?? 'document';
                                    const gradClass = tipe === 'video'
                                        ? 'bg-gradient-to-br from-stone-700 to-stone-900'
                                        : tipe === 'audio'
                                        ? 'bg-gradient-to-br from-[#7c2d12] to-stone-900'
                                        : 'bg-muted';

                                    return coverSrc ? (
                                        <img src={coverSrc} alt={konten.judul} className="w-full rounded-lg object-cover aspect-video" />
                                    ) : (
                                        <div className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg ${gradClass}`}>
                                            {tipe === 'video' && <Play className="size-8 text-white/60" />}
                                            {tipe === 'audio' && <Music className="size-8 text-white/60" />}
                                            {tipe === 'image' && <ImageIcon className="size-8 text-muted-foreground" />}
                                            {tipe === 'document' && <FileText className="size-8 text-muted-foreground" />}
                                            <span className="text-xs text-white/40">Tidak ada cover</span>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* Info konten */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Info Konten</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {[
                                    { label: 'Kategori', value: konten.category?.nama },
                                    { label: 'Wilayah', value: konten.wilayah?.nama },
                                    { label: 'Kontributor', value: konten.user?.name },
                                    { label: 'Diunggah', value: new Date(konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                    { label: 'Total File', value: `${konten.media_files?.length ?? 0} file` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-start justify-between gap-4">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="text-right font-medium">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Catatan admin jika ada */}
                        {konten.catatan_admin && (
                            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                                <CardHeader><CardTitle className="text-sm text-red-700 dark:text-red-400">Catatan Penolakan</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm text-red-700 dark:text-red-400">{konten.catatan_admin}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
