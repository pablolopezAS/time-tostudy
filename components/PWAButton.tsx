import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, X, ChevronRight, Apple, Smartphone as Android, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PWAButtonProps {
    className?: string;
}

type DeviceType = 'android' | 'ios' | 'unknown';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const PWAButton: React.FC<PWAButtonProps> = ({ className }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [deviceType, setDeviceType] = useState<DeviceType>('unknown');

    useEffect(() => {
        // Check if already installed as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if on iOS in standalone mode
        if ((window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowModal(false);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        // Detect device
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setDeviceType('ios');
        } else if (/android/.test(userAgent)) {
            setDeviceType('android');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Native prompt for Android/Chrome
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Show custom instruction modal for iOS or manual Android
            setShowModal(true);
        }
    };

    if (isInstalled) return null;

    const InstructionCard = ({ icon: Icon, title, steps }: { icon: any, title: string, steps: string[] }) => (
        <div className="bg-white/50 rounded-2xl p-6 border border-white">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Icon size={20} />
                </div>
                <h4 className="font-bold text-slate-800">{title}</h4>
            </div>
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-600">
                        <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-100">
                            {i + 1}
                        </span>
                        <p>{step}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={handleInstallClick}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 ${className}`}
            >
                <Download size={18} />
                <span className="text-sm font-bold">Añadir a Inicio</span>
            </button>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-md glass rounded-[2.5rem] p-10 overflow-hidden"
                        >
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setShowInstructions(false);
                                }}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4 mb-8">
                                <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">
                                    <Monitor className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                                        Instalar App
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm mt-1">
                                        Lleva TimeToStudy siempre contigo en tu pantalla de inicio
                                    </p>
                                </div>
                            </div>

                            {!showInstructions ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setDeviceType('android');
                                            setShowInstructions(true);
                                        }}
                                        className="w-full flex items-center justify-between p-5 bg-white/60 border border-white hover:bg-white transition-all rounded-2xl group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <Android size={20} />
                                            </div>
                                            <span className="font-bold text-slate-700">Android / Chrome</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setDeviceType('ios');
                                            setShowInstructions(true);
                                        }}
                                        className="w-full flex items-center justify-between p-5 bg-white/60 border border-white hover:bg-white transition-all rounded-2xl group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center">
                                                <Apple size={20} />
                                            </div>
                                            <span className="font-bold text-slate-700">Apple (iPhone/iPad)</span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-4"
                                >
                                    {deviceType === 'ios' ? (
                                        <InstructionCard
                                            icon={Share}
                                            title="Instrucciones para iOS"
                                            steps={[
                                                'Abre TimeToStudy en Safari',
                                                'Toca el botón "Compartir" (el cuadrado con flecha abajo)',
                                                'Desliza hacia abajo y toca "Añadir a la pantalla de inicio"',
                                                'Confirma tocando "Añadir" arriba a la derecha'
                                            ]}
                                        />
                                    ) : (
                                        <InstructionCard
                                            icon={Android}
                                            title="Instrucciones para Android"
                                            steps={[
                                                'Toca los tres puntos (⋮) del navegador',
                                                'Busca la opción "Instalar aplicación" o "Añadir a pantalla de inicio"',
                                                'Confirma la instalación en la ventana emergente'
                                            ]}
                                        />
                                    )}

                                    <button
                                        onClick={() => setShowInstructions(false)}
                                        className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                                    >
                                        Volver a selección
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PWAButton;
