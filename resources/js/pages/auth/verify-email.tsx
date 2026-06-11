import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verifikasi Email"
            description="Kami telah mengirimkan tautan verifikasi ke alamat emailmu. Periksa kotak masuk atau folder spam."
        >
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div style={FONT} className="mb-6 border-l-2 border-emerald-500 bg-emerald-50 pl-4 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Tautan verifikasi baru telah dikirim ke emailmu.
                </div>
            )}

            <div className="space-y-6">
                <Form {...send.form()} className="w-full">
                    {({ processing }) => (
                        <button type="submit" disabled={processing} style={FONT}
                            className="flex w-full items-center justify-center gap-2 bg-gray-900 py-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] transition-colors hover:bg-gray-700 disabled:opacity-60">
                            {processing && <Spinner className="size-3.5" />}
                            Kirim Ulang Email Verifikasi
                        </button>
                    )}
                </Form>

                <Form {...logout.form()} className="w-full">
                    {({ processing }) => (
                        <button type="submit" disabled={processing} style={FONT}
                            className="w-full border border-gray-900/20 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900 disabled:opacity-60">
                            Keluar
                        </button>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
