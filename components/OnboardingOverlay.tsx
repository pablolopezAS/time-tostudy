
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Timer, Calendar, ChevronRight, Check, User, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const steps = [
  {
    title: (
      <>
        ¡Bienvenido a <span className="text-indigo-600">T</span>ime<span className="text-indigo-600">T</span>o<span className="text-indigo-600">S</span>tudy!
      </>
    ),
    description: "Tu nuevo aliado para alcanzar el máximo enfoque. Una experiencia diseñada para que disfrutes de cada minuto de estudio.",
    icon: <Sparkles className="w-12 h-12 text-indigo-500" />,
    color: "indigo"
  },
  {
    title: "Organiza tus Materias",
    description: "Crea asignaturas y añade apartados específicos para tener todo bajo control. Tú decides los colores de tu éxito.",
    icon: <BookOpen className="w-12 h-12 text-emerald-500" />,
    color: "emerald"
  },
  {
    title: "Domina el Reloj",
    description: "Usa el modo libre o la técnica Pomodoro con cronómetros estéticos que se adaptan a tu estilo visual.",
    icon: <Timer className="w-12 h-12 text-amber-500" />,
    color: "amber"
  },
  {
    title: "Analiza tu Progreso",
    description: "Visualiza cuánto tiempo dedicas a cada materia con el historial semanal y mensual. Las estadísticas no mienten.",
    icon: <Calendar className="w-12 h-12 text-rose-500" />,
    color: "rose"
  },
  {
    title: "Cuéntanos sobre ti",
    description: "Para darte la mejor experiencia, necesitamos unos pocos detalles.",
    icon: <User className="w-12 h-12 text-indigo-500" />,
    color: "indigo",
    isForm: true
  }
];

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    educationLevel: 'Bachillerato'
  });

  const next = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!formData.name || !formData.age) {
        alert('Por favor, rellena todos los campos.');
        return;
      }

      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: formData.name,
            age: formData.age,
            education_level: formData.educationLevel,
            updated_at: new Date().toISOString()
          });
          if (error) throw error;

          // Also create default settings
          await supabase.from('user_settings').upsert({
            user_id: user.id
          });
        }
        onComplete();
      } catch (err: any) {
        alert('Error al guardar el perfil: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg glass rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-white/40 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="p-6 bg-white/60 rounded-[2rem] shadow-xl">
              {steps[currentStep].icon}
            </div>

            <div className="space-y-4 w-full">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight leading-none">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                {steps[currentStep].description}
              </p>

              {steps[currentStep].isForm && (
                <div className="mt-8 space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre..."
                      className="w-full px-5 py-3.5 bg-white/40 border border-white/60 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Edad</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Tu edad..."
                      className="w-full px-5 py-3.5 bg-white/40 border border-white/60 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nivel de estudios</label>
                    <select
                      value={formData.educationLevel}
                      onChange={e => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white/40 border border-white/60 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-600 appearance-none cursor-pointer"
                    >
                      <option>ESO</option>
                      <option>Bachillerato</option>
                      <option>Universidad</option>
                      <option>Oposiciones</option>
                      <option>Máster/Doctorado</option>
                      <option>Otros</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Check className="animate-pulse" /> : (currentStep === steps.length - 1 ? (
              <>¡Comenzar! <UserCheck size={18} /></>
            ) : (
              <>Siguiente <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            ))}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingOverlay;

