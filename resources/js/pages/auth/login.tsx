import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

const FONT = { fontFamily: "'Montserrat', sans-serif" };

export default function Login({ status, canResetPassword, canRegister }: LoginProps) {
    return (
        <AuthLayout
            title="Masuk"
            description="Masukkan email dan kata sandi untuk mengakses akun kamu."
        >
            <Head title="Masuk" />

            {status && (
                <div style={FONT} className="mb-6 border-l-2 border-emerald-500 bg-emerald-50 pl-4 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-0"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-8">

                            {/* Email */}
                            <div>
                                <label htmlFor="email" style={FONT}
                                    className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    Alamat Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="kamu@email.com"
                                    className="w-full border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-gray-900"
                                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" style={FONT}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        Kata Sandi
                                    </label>
                                    {canResetPassword && (
                                        <Link href={request()} tabIndex={5}
                                            style={FONT}
                                            className="text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors">
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-gray-900"
                                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <label htmlFor="remember" style={FONT}
                                    className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    Ingat saya
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                style={FONT}
                                className="flex w-full items-center justify-center gap-2 bg-gray-900 py-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] transition-colors hover:bg-gray-700 disabled:opacity-60 mt-4"
                            >
                                {processing && <Spinner className="size-3.5" />}
                                Masuk ke Platform
                            </button>
                        </div>

                        {canRegister && (
                            <p style={FONT} className="mt-8 border-t border-gray-900/10 pt-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Belum punya akun?{' '}
                                <Link href={register()} tabIndex={5}
                                    className="text-gray-900 underline hover:text-gray-600 transition-colors">
                                    Daftar Sekarang
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
