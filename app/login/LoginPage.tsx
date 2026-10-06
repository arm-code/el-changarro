"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { AuthResponse } from "../types/pos";
import Toast, { ToastType } from "../../components/Toast";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    useEffect(() => {
        const autoDemo = searchParams.get('autoDemo');
        const loggedInUser = localStorage.getItem('user');

        if (autoDemo === 'true' && !loggedInUser) {
            handleDemo();
        }
    }, [searchParams]);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session && data.user) {
                const userMetadata = data.user.user_metadata;
                const mappedUser: AuthResponse['user'] = {
                    id: data.user.id,
                    email: data.user.email || '',
                    firstName: userMetadata.firstName || 'Usuario',
                    lastName: userMetadata.lastName || '',
                    phone: userMetadata.phone || '',
                    address: userMetadata.address || '',
                    role: userMetadata.role || 'USER'
                };

                localStorage.setItem('token', data.session.access_token);
                localStorage.setItem('user', JSON.stringify(mappedUser));

                showToast("¡Bienvenido de nuevo!");
                setTimeout(() => router.push("/tools"), 1000); // Redirect to tools instead of catalog if catalog doesn't exist
            }
        } catch (error: any) {
            showToast(error.message || "Error al iniciar sesión", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async () => {
        showToast("El acceso demo está temporalmente deshabilitado durante la migración.", 'info');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                        <Box className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">El Changarro</h1>
                    <p className="text-slate-500 font-medium lowercase tracking-wide">Gestiona tu negocio de forma simple</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || demoLoading}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Entrar <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 italic">
                        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">O prueba el sistema ahora</p>
                        <button
                            onClick={handleDemo}
                            disabled={loading || demoLoading}
                            className="w-full py-4 bg-violet-50 text-violet-600 rounded-2xl font-black uppercase tracking-widest hover:bg-violet-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {demoLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Probar Demo <Sparkles className="h-5 w-5" /></>
                            )}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500 font-medium">
                    ¿No tienes cuenta? <button onClick={() => router.push("/register")} className="text-primary font-bold hover:underline">Regístrate gratis</button>
                </p>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
