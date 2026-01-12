import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, ListTodo, Timer, Sparkles, LogIn, UserPlus, X, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, Apple, Smartphone as AndroidPhone, Share, ChevronRight, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TypingText = ({ text }: { text: string }) => {
    const letters = Array.from(text);
    return (
        <div className="flex justify-center flex-wrap">
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 0.05,
                        delay: 1.5 + i * 0.05,
                    }}
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </div>
    );
};

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
    const [pwaDevice, setPwaDevice] = useState<'apple' | 'android' | null>(null);

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
        <div className="min-h-screen flex flex-col bg-[#5D5AFE] overflow-x-hidden pt-16">
            {/* Top Bar Animation */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 h-16 bg-white z-[150] shadow-sm flex items-center px-8"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-indigo-600 tracking-tight uppercase text-lg">TimeToStudy</span>
                </div>
            </motion.div>

            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-400/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] right-[10%] w-[50%] h-[50%] bg-indigo-300/10 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="relative w-full max-w-lg glass rounded-[3rem] p-10 md:p-14 shadow-2xl border border-white/40 text-center mb-12"
                >
                    {/* Logo Animation */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 1, type: "spring" }}
                        className="flex justify-center mb-8"
                    >
                        <div className="p-5 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-900/20">
                            <Clock className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>

                    {/* Title with Typing Animation */}
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4 min-h-[1.2em]">
                        <TypingText text="TimeToStudy" />
                    </h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                        className="text-slate-500 font-medium text-lg mb-10"
                    >
                        Domina tu tiempo de estudio. Alcanza tus metas.
                    </motion.p>

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

                {/* Add to Home Screen Section */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 2.5 }}
                    className="w-full max-w-xl px-4"
                >
                    <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl overflow-hidden relative">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-800">¡Puedes añadirla a tu pantalla de inicio!</h3>
                                <p className="text-slate-500 text-sm mt-1">Úsala como una aplicación nativa en tu móvil.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPwaDevice(pwaDevice === 'apple' ? null : 'apple')}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${pwaDevice === 'apple' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}
                                >
                                    <Apple size={18} />
                                    Soy de Apple
                                </button>
                                <button
                                    onClick={() => setPwaDevice(pwaDevice === 'android' ? null : 'android')}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${pwaDevice === 'android' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'}`}
                                >
                                    <AndroidPhone size={18} />
                                    Soy de Android
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {pwaDevice && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pwaDevice === 'apple' ? (
                                            <>
                                                <div className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                                    <p>Abre esta página en <span className="font-bold">Safari</span></p>
                                                </div>
                                                <div className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                                    <p>Toca el icono de compartir <Share size={14} className="inline mx-1" /></p>
                                                </div>
                                                <div className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                                    <p>Elige <span className="font-bold">"Añadir a la pantalla de inicio"</span></p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                                    <p>Toca los tres puntos <span className="font-bold">(⋮)</span> del navegador</p>
                                                </div>
                                                <div className="flex gap-3 text-sm text-slate-600 items-start">
                                                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                                    <p>Busca <span className="font-bold">"Instalar aplicación"</span> o "Añadir a pantalla de inicio"</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative px-6 py-24 bg-white/60 backdrop-blur-md">
                <div className="max-w-5xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-16"
                    >
                        Todo lo que necesitas para estudiar mejor
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="glass rounded-[2.5rem] p-10 text-center border border-white shadow-xl hover:shadow-2xl transition-all group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="inline-flex p-5 bg-indigo-600 text-white rounded-2xl mb-8 shadow-lg shadow-indigo-200"
                                >
                                    {feature.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                                <p className="text-slate-500 text-base leading-relaxed">{feature.description}</p>
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
