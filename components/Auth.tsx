
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, Sparkles, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';

interface AuthProps {
    onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: 'https://time-tostudy.vercel.app/'
                    }
                });
                if (error) {
                    if (error.message.includes('User already registered') || error.message.includes('already exists')) {
                        throw new Error('Este correo ya está registrado en el sistema. Por favor, inicia sesión.');
                    }
                    throw error;
                }
                setShowRegisterSuccess(true);
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const handleDismissSuccess = () => {
        setShowRegisterSuccess(false);
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md glass rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/60"
            >
                <div className="flex flex-col items-center text-center space-y-8 mb-10">
                    <div className="p-5 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-200">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {isLogin ? 'Tu tiempo es oro, vuelve a enfocarte.' : 'Empieza a dominar tu tiempo hoy mismo.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-white/60 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-600"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-4 bg-white/60 border border-white/60 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-600"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-rose-500 text-xs font-bold text-center"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {isLogin ? 'Entrar' : 'Registrarme'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/60 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-slate-500 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-colors"
                    >
                        {isLogin ? (
                            <><UserPlus size={18} /> ¿No tienes cuenta? Registrate</>
                        ) : (
                            <><LogIn size={18} /> ¿Ya tienes cuenta? Inicia sesión</>
                        )}
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showRegisterSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative w-full max-w-sm glass rounded-[2.5rem] p-10 shadow-2xl border border-white/40 text-center"
                        >
                            <button
                                onClick={handleDismissSuccess}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle2 size={40} />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Casi listo!</h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Te hemos enviado un correo de confirmación de <span className="text-indigo-600 font-bold">Supabase</span>. Por favor, revisa tu bandeja de entrada para verificar tu cuenta.
                            </p>

                            <button
                                onClick={handleDismissSuccess}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                            >
                                Continuar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Auth;
