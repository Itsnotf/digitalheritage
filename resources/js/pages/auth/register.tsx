import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';

const FONT = { fontFamily: "'Montserrat', sans-serif" };

const inputClass = "w-full border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-gray-900";
const inputStyle = { fontFamily: "'Open Sans', sans-serif" };
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

export default function Register() {
    return (
        <AuthLayout
            title="Daftar"
            description="Buat akun untuk mulai berkontribusi dalam pelestarian budaya Sumatera Selatan."
        >
            <Head title="Daftar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-0"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-7">

                            {/* Nama */}
                            <div>
                                <label htmlFor="name" style={FONT} className={labelClass}>
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name" type="text" name="name"
                                    required autoFocus tabIndex={1} autoComplete="name"
                                    placeholder="Nama kamu"
                                    className={inputClass} style={inputStyle}
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" style={FONT} className={labelClass}>
                                    Alamat Email
                                </label>
                                <input
                                    id="email" type="email" name="email"
                                    required tabIndex={2} autoComplete="email"
                                    placeholder="kamu@email.com"
                                    className={inputClass} style={inputStyle}
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" style={FONT} className={labelClass}>
                                    Kata Sandi
                                </label>
                                <input
                                    id="password" type="password" name="password"
                                    required tabIndex={3} autoComplete="new-password"
                                    placeholder="Min. 8 karakter"
                                    className={inputClass} style={inputStyle}
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Konfirmasi password */}
                            <div>
                                <label htmlFor="password_confirmation" style={FONT} className={labelClass}>
                                    Konfirmasi Kata Sandi
                                </label>
                                <input
                                    id="password_confirmation" type="password" name="password_confirmation"
                                    required tabIndex={4} autoComplete="new-password"
                                    placeholder="Ulangi kata sandi"
                                    className={inputClass} style={inputStyle}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Catatan */}
                            <p style={FONT} className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-relaxed">
                                Dengan mendaftar, kamu setuju untuk berkontribusi secara positif dalam pelestarian budaya Sumatera Selatan.
                            </p>

                            {/* Submit */}
                            <button
                                type="submit" tabIndex={5}
                                style={FONT}
                                className="flex w-full items-center justify-center gap-2 bg-gray-900 py-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] transition-colors hover:bg-gray-700 disabled:opacity-60"
                            >
                                {processing && <Spinner className="size-3.5" />}
                                Buat Akun
                            </button>
                        </div>

                        <p style={FONT} className="mt-8 border-t border-gray-900/10 pt-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Sudah punya akun?{' '}
                            <Link href={login()} tabIndex={6}
                                className="text-gray-900 underline hover:text-gray-600 transition-colors">
                                Masuk
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
