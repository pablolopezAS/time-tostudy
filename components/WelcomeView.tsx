import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, ListTodo, Timer, Sparkles, LogIn, UserPlus, X, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WelcomeViewProps {
    onAuthSuccess: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onAuthSuccess }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                onAuthSuccess();
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
        setShowAuthModal(false);
        window.location.reload();
    };

    const openAuthModal = (login: boolean) => {
        setIsLogin(login);
        setShowAuthModal(true);
        setError(null);
        setEmail('');
        setPassword('');
    };

    const features = [
        {
            icon: <Timer className="w-8 h-8" />,
            title: 'Registra tu tiempo',
            description: 'Controla cada minuto de estudio con precisión. Pausas, intervalos y sesiones libres.'
        },
        {
            icon: <BookOpen className="w-8 h-8" />,
            title: 'Organiza por asignaturas',
            description: 'Crea asignaturas con colores personalizados y visualiza tu progreso por cada una.'
        },
        {
            icon: <ListTodo className="w-8 h-8" />,
            title: 'Gestiona apartados',
            description: 'Divide cada asignatura en temas o apartados para un seguimiento más detallado.'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50 overflow-x-hidden">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-emerald-200/20 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative flex-1 flex items-center justify-center px-6 py-20 min-h-[70vh]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full max-w-lg glass rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/60 text-center"
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="p-5 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-200">
                            <Clock className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">
                        TimeToStudy
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mb-10">
                        Domina tu tiempo de estudio. Alcanza tus metas.
                    </p>

                    {/* Auth Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => openAuthModal(true)}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <LogIn size={20} />
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => openAuthModal(false)}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white/80 text-indigo-600 border-2 border-indigo-200 rounded-2xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
                        >
                            <UserPlus size={20} />
                            Registrarse
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative px-6 py-16 bg-white/40">
                <div className="max-w-5xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-12"
                    >
                        Todo lo que necesitas para estudiar mejor
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass rounded-3xl p-8 text-center border border-white/60"
                            >
                                <div className="inline-flex p-4 bg-indigo-100 text-indigo-600 rounded-2xl mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative px-6 py-8 bg-slate-800 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold">TimeToStudy</span>
                </div>
                <p className="text-slate-400 text-sm">
                    © {new Date().getFullYear()} TimeToStudy. Todos los derechos reservados.
                </p>
            </footer>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/60"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-6 mb-8">
                                <div className="p-5 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-200">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                        {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                                    </h2>
                                    <p className="text-slate-500 font-medium text-sm">
                                        {isLogin ? 'Tu tiempo es oro, vuelve a enfocarte.' : 'Empieza a dominar tu tiempo hoy mismo.'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-5">
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

                            <div className="mt-8 pt-6 border-t border-white/60 text-center">
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Register Success Modal */}
            <AnimatePresence>
                {showRegisterSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
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
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-2">
                                Te hemos enviado un correo de confirmación desde <span className="text-indigo-600 font-bold">timetostudy@outlook.es</span>.
                            </p>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                Si no encuentras el correo, revisa la carpeta de <span className="text-amber-600 font-bold">SPAM</span>.
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

export default WelcomeView;
