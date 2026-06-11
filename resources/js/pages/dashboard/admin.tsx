import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, KontenBudaya, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, MessageSquare, Users } from 'lucide-react';

interface Props {
    total_users: number; total_konten_pending: number;
    total_konten_published: number; total_konten_rejected: number;
    total_komentar: number; pending_terbaru: KontenBudaya[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function AdminDashboard({ total_users, total_konten_pending, total_konten_published, total_konten_rejected, total_komentar, pending_terbaru }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="space-y-6 p-6">

                {total_konten_pending > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2">
                            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                {total_konten_pending} konten menunggu review
                            </span>
                        </div>
                        <Button size="sm" asChild>
                            <Link href="/konten?status=pending">Review Sekarang</Link>
                        </Button>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Pending Review', value: total_konten_pending, icon: Clock, color: 'amber' },
                        { label: 'Tayang', value: total_konten_published, icon: CheckCircle, color: 'emerald' },
                        { label: 'Pengguna', value: total_users, icon: Users, color: 'blue' },
                        { label: 'Komentar', value: total_komentar, icon: MessageSquare, color: 'slate' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label} className="gap-3 py-5">
                            <CardHeader className="pb-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                                    <div className={`flex size-8 items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
                                        <Icon className={`size-4 text-${color}-600 dark:text-${color}-400`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="gap-0">
                    <CardHeader className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Konten Menunggu Review</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/konten?status=pending">Lihat Semua</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pending_terbaru.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Tidak ada konten yang menunggu review 🎉
                            </div>
                        ) : (
                            <div className="divide-y">
                                {pending_terbaru.map((konten) => (
                                    <div key={konten.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {konten.cover_url ? (
                                                <img src={konten.cover_url} alt={konten.judul} className="size-full object-cover" />
                                            ) : (
                                                <div className="flex size-full items-center justify-center">
                                                    <FileText className="size-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{konten.judul}</p>
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {konten.user?.name} · {konten.category?.nama} · {konten.wilayah?.nama}
                                            </p>
                                        </div>
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/konten/${konten.id}`}>Review</Link>
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
