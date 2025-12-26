
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { User, GraduationCap, Calendar, ShieldCheck, Mail, Lock, MessageSquare, Sparkles, Send, CheckCircle2, Loader2, LogOut, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onIntervalPresetsUpdate: (presets: any[]) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdate, onIntervalPresetsUpdate }) => {
  const [supportType, setSupportType] = useState<'support' | 'feature'>('support');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passUpdateStatus, setPassUpdateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const educationLevels = [
    'ESO',
    'Bachillerato',
    'Universidad',
    'Oposiciones',
    'Máster/Doctorado',
    'Otros'
  ];

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newProfile = { ...profile, [name]: value };
    onUpdate(newProfile);

    // Auto-save to Supabase
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: name === 'name' ? value : profile.name,
          age: name === 'age' ? value : profile.age,
          education_level: name === 'educationLevel' ? value : profile.educationLevel,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error auto-saving:', err);
    } finally {
      setTimeout(() => setUpdating(false), 500);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setPassUpdateStatus('loading');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassUpdateStatus('success');
      setNewPassword('');
      setTimeout(() => setPassUpdateStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPassUpdateStatus('error');
      setTimeout(() => setPassUpdateStatus('idle'), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSendSupport = () => {
    if (!supportMessage.trim()) return;

    // Aquí se implementaría la lógica de envío real en el futuro.
    console.log('Enviando solicitud:', { type: supportType, message: supportMessage });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setSupportMessage('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 pb-40">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Ajustes</h1>
          <p className="text-slate-500 font-medium italic text-sm">Personaliza tu perfil de estudiante.</p>
        </div>
        <div className="flex items-center gap-4">
          {updating && (
            <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
              <Loader2 size={12} className="animate-spin" /> Guardando...
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SECCIÓN PERFIL */}
        <section className="glass rounded-[2.5rem] p-8 border border-white/60 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <User size={20} className="text-indigo-500" />
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Información Personal</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Escribe tu nombre..."
                className="w-full px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Correo Electrónico</label>
              <div className="px-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent font-bold text-slate-600 shadow-inner flex items-center justify-between">
                <span>{profile.email || ''}</span>
                <Mail size={16} className="text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Edad</label>
              <input
                type="number"
                name="age"
                value={profile.age}
                onChange={handleChange}
                placeholder="Ej. 20"
                className="w-full px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN ESTUDIOS */}
        <section className="glass rounded-[2.5rem] p-8 border border-white/60 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap size={20} className="text-emerald-500" />
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Trayectoria Académica</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">¿Qué estás estudiando?</label>
              <div className="relative">
                <select
                  name="educationLevel"
                  value={profile.educationLevel}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner appearance-none cursor-pointer"
                >
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <GraduationCap size={18} />
                </div>
              </div>
            </div>

            <div className="pt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tight leading-relaxed">
                Esta información nos ayuda a adaptar tus futuras recomendaciones de estudio y estadísticas.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN SEGURIDAD */}
        <section className="md:col-span-2 glass rounded-[2.5rem] p-8 border border-white/60 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={20} className="text-indigo-500" />
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Seguridad</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-4">
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  Cambiar tu contraseña es una medida de seguridad importante. Asegúrate de usar una contraseña difícil de adivinar.
                </p>
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nueva Contraseña</label>
                <div className="relative group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escribe tu nueva contraseña..."
                    className="w-full px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors p-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={passUpdateStatus === 'loading' || !newPassword}
                className={`w-full py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all flex items-center justify-center gap-3 ${passUpdateStatus === 'success' ? 'bg-emerald-500 text-white shadow-emerald-100' : passUpdateStatus === 'error' ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                  }`}
              >
                {passUpdateStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
                {passUpdateStatus === 'success' && <><CheckCircle2 size={16} /> Contraseña actualizada</>}
                {passUpdateStatus === 'error' && <><ShieldAlert size={16} /> Error al actualizar</>}
                {passUpdateStatus === 'idle' && <>Actualizar Contraseña</>}
              </button>
            </div>
          </div>
        </section>

        {/* SECCIÓN ACTIVACIÓN / LICENCIA */}
        <section className="md:col-span-2 glass rounded-[2.5rem] p-8 border border-white/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Estado de la Suscripción</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información de activación del sistema</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/40 px-8 py-4 rounded-3xl border border-white/60">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fecha de caducidad</span>
                <span className="text-sm font-black text-slate-400 italic">No disponible</span>
              </div>
              <Calendar size={24} className="text-slate-200" />
            </div>
          </div>
        </section>

        {/* SECCIÓN SOPORTE Y SUGERENCIAS */}
        <section className="md:col-span-2 glass rounded-[2.5rem] p-8 border border-white/60 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-700 uppercase tracking-tight">Soporte y Sugerencias</h2>
            </div>
            <Sparkles size={18} className="text-amber-400 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">¿Cómo podemos ayudarte?</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSupportType('support')}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${supportType === 'support' ? 'bg-indigo-500 text-white border-indigo-600 shadow-md' : 'bg-white/40 text-slate-500 border-white/60 hover:bg-white'}`}
                  >
                    Reportar un problema
                  </button>
                  <button
                    onClick={() => setSupportType('feature')}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${supportType === 'feature' ? 'bg-indigo-500 text-white border-indigo-600 shadow-md' : 'bg-white/40 text-slate-500 border-white/60 hover:bg-white'}`}
                  >
                    Sugerir funcionalidad
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Tu mensaje</label>
                <div className="relative">
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder={supportType === 'support' ? "Describe el problema que has encontrado..." : "Cuéntanos qué te gustaría ver en la app..."}
                    className="w-full h-32 px-6 py-4 bg-white/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-300 transition-all font-bold text-slate-700 shadow-inner resize-none"
                  />
                  <AnimatePresence>
                    {isSent ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white p-4"
                      >
                        <CheckCircle2 size={32} className="mb-2" />
                        <p className="font-black uppercase tracking-widest text-[10px]">¡Enviado con éxito!</p>
                        <p className="text-[9px] font-medium opacity-80 mt-1">Gracias por ayudarnos a mejorar.</p>
                      </motion.div>
                    ) : (
                      <button
                        onClick={handleSendSupport}
                        disabled={!supportMessage.trim()}
                        className="absolute bottom-4 right-4 p-3 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-30 group"
                      >
                        <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="text-center pt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Tus cambios se guardan automáticamente.
        </p>
      </footer>
    </div>
  );
};

export default SettingsView;
