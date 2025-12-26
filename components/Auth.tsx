
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface AuthProps {
    onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Revisa tu correo para confirmar tu cuenta (aunque el administrador lo activará después)');
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
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
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-6 py-4 bg-white/60 border border-white/60 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-600"
                            />
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
                        onClick={() => setIsLogin(!isLogin)}
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
        </div>
    );
};

export default Auth;
