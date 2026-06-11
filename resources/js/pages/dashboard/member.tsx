import StatusBadge from '@/components/status-badge';
import LevelBadge, { getLevelConfig, getKontenToNextLevel } from '@/components/level-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, KontenBudaya } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle, Clock, Eye, PlusCircle, XCircle } from 'lucide-react';

interface Props {
    roles: string[]; member_since: string;
    total_konten: number; total_konten_pending: number;
    total_konten_published: number; total_konten_rejected: number;
    total_views: number; konten_terbaru: KontenBudaya[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function MemberDashboard({ member_since, total_konten, total_konten_pending, total_konten_published, total_konten_rejected, total_views, konten_terbaru }: Props) {
    const approvedCount = total_konten_published;
    const levelConfig   = getLevelConfig(approvedCount);
    const toNextLevel   = getKontenToNextLevel(approvedCount);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">

                <div className="flex items-start justify-between">
                    <div>
                        <div className="mb-1.5 flex items-center gap-2">
                            <h1 className="text-xl font-semibold">Kontribusi Saya</h1>
                            <LevelBadge approvedCount={approvedCount} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Bergabung sejak {member_since}
                            {toNextLevel !== null && (
                                <span className="ml-2 text-muted-foreground/70">
                                    · {toNextLevel} konten lagi ke level <strong>{levelConfig.level < 5 ? ['', 'Pemuda', 'Penjaga', 'Duta Budaya', 'Maestro'][levelConfig.level] : ''}</strong>
                                </span>
                            )}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/kontribusi/create">
                            <PlusCircle /> Upload Konten
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Konten', value: total_konten, icon: BookOpen, sub: 'diunggah' },
                        { label: 'Menunggu', value: total_konten_pending, icon: Clock, sub: 'pending review' },
                        { label: 'Tayang', value: total_konten_published, icon: CheckCircle, sub: 'aktif' },
                        { label: 'Total Views', value: total_views, icon: Eye, sub: 'semua konten' },
                    ].map(({ label, value, icon: Icon, sub }) => (
                        <Card key={label} className="gap-3 py-5">
                            <CardHeader className="pb-0">
                                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-3xl font-bold">{value}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                                    </div>
                                    <Icon className="size-8 text-muted-foreground/30" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {total_konten_rejected > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                        <div className="flex items-center gap-2">
                            <XCircle className="size-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-400">
                                {total_konten_rejected} konten ditolak — baca alasannya dan pertimbangkan untuk revisi.
                            </span>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/kontribusi?status=rejected">Lihat</Link>
                        </Button>
                    </div>
                )}

                <Card className="gap-0">
                    <CardHeader className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Konten Terbaru</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/kontribusi">Semua Konten</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {konten_terbaru.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-sm text-muted-foreground">Belum ada konten. Mulai kontribusi pertama kamu!</p>
                                <Button className="mt-4" asChild>
                                    <Link href="/kontribusi/create"><PlusCircle /> Upload Konten</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {konten_terbaru.map((konten) => (
                                    <div key={konten.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {konten.cover_url ? (
                                                <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                    <BookOpen className="size-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{konten.judul}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{konten.category?.nama} · {konten.wilayah?.nama}</p>
                                        </div>
                                        <StatusBadge status={konten.status} size="sm" />
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/kontribusi/${konten.id}`}>Detail</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
