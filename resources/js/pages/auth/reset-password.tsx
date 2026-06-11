import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

const FONT = { fontFamily: "'Montserrat', sans-serif" };
const inputClass = "w-full border-b border-gray-300 bg-transparent py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-gray-900";
const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    return (
        <AuthLayout
            title="Reset Kata Sandi"
            description="Buat kata sandi baru untuk akunmu."
        >
            <Head title="Reset Kata Sandi" />

            <Form {...store.form({ token, email })} className="flex flex-col gap-0">
                {({ processing, errors }) => (
                    <div className="space-y-8">
                        <div>
                            <label htmlFor="email" style={FONT} className={labelClass}>Alamat Email</label>
                            <input id="email" type="email" name="email" defaultValue={email}
                                required autoComplete="email" readOnly
                                className={`${inputClass} opacity-50 cursor-not-allowed`}
                                style={{ fontFamily: "'Open Sans', sans-serif" }} />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <label htmlFor="password" style={FONT} className={labelClass}>Kata Sandi Baru</label>
                            <input id="password" type="password" name="password"
                                required autoFocus autoComplete="new-password" placeholder="Min. 8 karakter"
                                className={inputClass} style={{ fontFamily: "'Open Sans', sans-serif" }} />
                            <InputError message={errors.password} />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" style={FONT} className={labelClass}>Konfirmasi Kata Sandi</label>
                            <input id="password_confirmation" type="password" name="password_confirmation"
                                required autoComplete="new-password" placeholder="Ulangi kata sandi baru"
                                className={inputClass} style={{ fontFamily: "'Open Sans', sans-serif" }} />
                            <InputError message={errors.password_confirmation} />
                        </div>
                        <button type="submit" disabled={processing} style={FONT}
                            className="flex w-full items-center justify-center gap-2 bg-gray-900 py-4 text-[10px] font-black uppercase tracking-widest text-[#EDE8DC] transition-colors hover:bg-gray-700 disabled:opacity-60">
                            {processing && <Spinner className="size-3.5" />}
                            Simpan Kata Sandi Baru
                        </button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
