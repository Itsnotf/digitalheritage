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
    CheckCircle, ChevronLeft, Clock, Edit, Eye, FileText, Image as ImageIcon, Music, Play, Tag, Trash2, XCircle,
} from 'lucide-react';

function isImageUrl(url: string): boolean {
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(url);
}

interface Props { konten: KontenBudaya; flash?: { success?: string } }

const aksiLabel: Record<string, { label: string; color: string }> = {
    approve: { label: 'Disetujui admin', color: 'text-emerald-600 dark:text-emerald-400' },
    reject: { label: 'Ditolak admin', color: 'text-red-600 dark:text-red-400' },
    user_revise: { label: 'Kamu memilih revisi', color: 'text-amber-600 dark:text-amber-400' },
    user_decline: { label: 'Kamu tidak merevisi', color: 'text-gray-600 dark:text-gray-400' },
};

export default function KontribusiShow({ konten }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Konten Saya', href: '/kontribusi' },
        { title: konten.judul, href: `/kontribusi/${konten.slug}` },
    ];

    const isRejectedAndNeedsResponse = konten.status === 'rejected' &&
        !konten.moderation_logs?.some((l) => l.aksi === 'user_revise' || l.aksi === 'user_decline');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={konten.judul} />

            <div className="p-6">
                <Link href="/kontribusi" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="size-4" /> Konten Saya
                </Link>

                {/* Status banner */}
                {konten.status === 'published' && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                        <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Konten sedang tayang</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">Konten kamu sudah bisa dilihat publik</p>
                        </div>
                    </div>
                )}
                {konten.status === 'pending' && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                        <Clock className="size-5 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Menunggu review admin</p>
                            <p className="text-xs text-amber-600 dark:text-amber-500">Konten sedang diperiksa, kamu akan mendapat notifikasi</p>
                        </div>
                    </div>
                )}
                {konten.status === 'rejected' && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-start gap-3">
                            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-700 dark:text-red-400">Konten ditolak</p>
                                {konten.catatan_admin && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                        <span className="font-medium">Alasan: </span>{konten.catatan_admin}
                                    </p>
                                )}
                                {isRejectedAndNeedsResponse && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Button size="sm" asChild onClick={() => router.patch(`/kontribusi/${konten.slug}/revise`)}>
                                            <span className="cursor-pointer">
                                                <Edit className="size-3.5" /> Saya Ingin Revisi
                                            </span>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                                                    Tidak Akan Direvisi
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Yakin tidak ingin merevisi?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Konten ini akan tetap berstatus ditolak secara permanen. Kamu tidak bisa membatalkan pilihan ini.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-white"
                                                        onClick={() => router.patch(`/kontribusi/${konten.slug}/decline`)}
                                                    >
                                                        Ya, Tidak Direvisi
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {/* Header */}
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <StatusBadge status={konten.status} />
                                {konten.category && <Badge variant="outline">{konten.category.nama}</Badge>}
                            </div>
                            <h1 className="text-2xl font-bold">{konten.judul}</h1>
                            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{konten.wilayah?.nama}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1"><Eye className="size-3.5" />{konten.view_count}</span>
                                <span>·</span>
                                <span>{new Date(konten.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Deskripsi</CardTitle></CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{konten.deskripsi}</p>
                            </CardContent>
                        </Card>

                        {/* File media — INLINE: langsung tampil & bisa diputar */}
                        {konten.media_files && konten.media_files.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm text-muted-foreground">File Media ({konten.media_files.length})</CardTitle>
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

                        {/* Tags */}
                        {konten.tags && konten.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Tag className="size-4 text-muted-foreground" />
                                {konten.tags.map((tag) => <Badge key={tag.id} variant="secondary">{tag.nama}</Badge>)}
                            </div>
                        )}

                        {/* Riwayat moderasi */}
                        {konten.moderation_logs && konten.moderation_logs.length > 0 && (
                            <Card>
                                <CardHeader><CardTitle className="text-sm text-muted-foreground">Riwayat</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="relative space-y-3 pl-4 before:absolute before:top-0 before:bottom-0 before:left-[7px] before:w-px before:bg-border">
                                        {konten.moderation_logs.map((log) => (
                                            <div key={log.id} className="relative flex gap-3">
                                                <div className="absolute -left-4 top-1.5 size-3.5 rounded-full border bg-background flex items-center justify-center">
                                                    <div className={`size-1.5 rounded-full ${log.aksi === 'approve' ? 'bg-emerald-500' : log.aksi === 'reject' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${aksiLabel[log.aksi]?.color ?? ''}`}>
                                                        {aksiLabel[log.aksi]?.label ?? log.aksi}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {log.catatan && <p className="mt-1 rounded-md bg-muted px-3 py-2 text-xs italic">"{log.catatan}"</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Panel aksi */}
                    <div className="space-y-4">
                        {/* Cover preview */}
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Pratinjau Cover</CardTitle></CardHeader>
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
                                            <p className="text-xs text-white/40">Belum ada cover</p>
                                        </div>
                                    );
                                })()}
                                {!konten.cover_url && (
                                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                                        Cover otomatis diambil dari file gambar pertama. Upload konten audio/video bisa menambah cover dari halaman edit.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {konten.status !== 'published' && (
                            <Card>
                                <CardHeader><CardTitle className="text-sm">Kelola Konten</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {konten.status !== 'pending' && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/kontribusi/${konten.slug}/edit`}><Edit /> Edit Konten</Link>
                                        </Button>
                                    )}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                <Trash2 /> Hapus Konten
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus konten ini?</AlertDialogTitle>
                                                <AlertDialogDescription>Semua file media akan ikut dihapus dan tidak bisa dipulihkan.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive text-white" onClick={() => router.delete(`/kontribusi/${konten.slug}`)}>
                                                    Ya, Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader><CardTitle className="text-sm text-muted-foreground">Info</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {[
                                    { label: 'Kategori', value: konten.category?.nama },
                                    { label: 'Wilayah', value: konten.wilayah?.nama },
                                    { label: 'Total File', value: `${konten.media_files?.length ?? 0} file` },
                                    { label: 'Views', value: konten.view_count },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
