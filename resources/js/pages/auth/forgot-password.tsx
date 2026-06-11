import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Lupa Kata Sandi"
            description="Masukkan email akunmu. Kami akan mengirimkan tautan untuk membuat kata sandi baru."
        >
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div style={FONT} className="mb-6 border-l-2 border-emerald-500 bg-emerald-50 pl-4 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {status}
                </div>
            )}

            <Form {...store.form()} className="flex flex-col gap-0">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-8">
                            <div>
                                <label htmlFor="email" style={FONT}
                                    className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Alamat Email
                                </label>
                                <input
                                    id="email" type="email" name="email"
                                    required autoFocus autoComplete="email"
                                    placeholder="kamu@email.com"
                                    className="w-full border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-gray-900"
                                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <button type="submit" disabled={processing} style={FONT}
                                className="flex w-full items-center justify-center gap-2 bg-gray-900 py-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] transition-colors hover:bg-gray-700 disabled:opacity-60">
                                {processing && <Spinner className="size-3.5" />}
                                Kirim Tautan Reset
                            </button>
                        </div>

                        <p style={FONT} className="mt-8 border-t border-gray-900/10 pt-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Ingat kata sandi?{' '}
                            <Link href={login()} className="text-gray-900 underline hover:text-gray-600 transition-colors">
                                Kembali Masuk
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
