import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface TermsAndConditionsProps {
    onAccept: () => void;
    onDecline?: () => void;
    canClose?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
    onAccept,
    onDecline,
    canClose = false
}) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [hasAccepted, setHasAccepted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // Consider "scrolled to bottom" if within 50px of the bottom
            if (scrollHeight - scrollTop - clientHeight < 50) {
                setHasScrolledToBottom(true);
            }
        }
    };

    const handleAcceptClick = () => {
        if (hasScrolledToBottom && hasAccepted) {
            onAccept();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-4xl glass rounded-[3rem] border border-white/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-6 border-b border-white/40 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
                                    Términos y Condiciones de Uso
                                </h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    Por favor, lee detenidamente antes de continuar
                                </p>
                            </div>
                        </div>
                        {canClose && onDecline && (
                            <button
                                onClick={onDecline}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-white/50"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
                >
                    <div className="prose prose-slate max-w-none">
                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                1. Identificación y Titularidad
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                TimeToStudy es una aplicación web de gestión de tiempo de estudio. El acceso y uso de esta aplicación
                                implica la aceptación de los presentes Términos y Condiciones.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                2. Objeto y Ámbito de Aplicación
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                Los presentes Términos y Condiciones regulan el acceso y uso de la aplicación TimeToStudy, que tiene
                                como finalidad proporcionar a los usuarios una herramienta para:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li>Registrar y cronometrar sesiones de estudio</li>
                                <li>Organizar asignaturas y temas de estudio</li>
                                <li>Visualizar estadísticas y análisis de tiempo dedicado al estudio</li>
                                <li>Generar reportes de progreso académico</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                3. Condiciones de Uso
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                El usuario se compromete a:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li>Utilizar la aplicación de forma lícita y conforme a la legislación vigente</li>
                                <li>Proporcionar información veraz y actualizada durante el registro</li>
                                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                                <li>No utilizar la aplicación para fines comerciales sin autorización expresa</li>
                                <li>No intentar acceder a áreas restringidas del sistema o datos de otros usuarios</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                4. Registro y Cuenta de Usuario
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Para utilizar TimeToStudy, es necesario crear una cuenta proporcionando una dirección de correo
                                electrónico válida y una contraseña segura. El usuario es responsable de mantener la confidencialidad
                                de sus credenciales y de todas las actividades que se realicen bajo su cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                5. Protección de Datos Personales (RGPD)
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                De conformidad con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril
                                de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos
                                personales (RGPD), y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y
                                garantía de los derechos digitales (LOPDGDD):
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li><strong>Responsable del tratamiento:</strong> Los datos personales son tratados por Supabase como proveedor de servicios</li>
                                <li><strong>Finalidad:</strong> Gestión de la cuenta de usuario y prestación del servicio de seguimiento de estudio</li>
                                <li><strong>Legitimación:</strong> Consentimiento del interesado</li>
                                <li><strong>Conservación:</strong> Los datos se conservarán mientras la cuenta esté activa</li>
                                <li><strong>Derechos:</strong> Acceso, rectificación, supresión, limitación, portabilidad y oposición</li>
                            </ul>
                            <p className="text-sm text-slate-600 leading-relaxed mt-3">
                                Los datos recopilados incluyen: correo electrónico, nombre, edad, nivel educativo, y datos de sesiones
                                de estudio. Estos datos no se compartirán con terceros sin consentimiento expreso, salvo obligación legal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                6. Propiedad Intelectual e Industrial
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Todos los contenidos de la aplicación TimeToStudy, incluyendo pero no limitándose a textos, gráficos,
                                logotipos, iconos, imágenes, clips de audio y software, son propiedad de sus respectivos titulares y
                                están protegidos por las leyes españolas e internacionales de propiedad intelectual e industrial.
                                Queda prohibida su reproducción, distribución o modificación sin autorización expresa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                7. Disponibilidad del Servicio
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                TimeToStudy se esfuerza por mantener la aplicación disponible de forma continua. Sin embargo:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li>No se garantiza la disponibilidad ininterrumpida del servicio</li>
                                <li>Pueden realizarse mantenimientos programados que afecten temporalmente al acceso</li>
                                <li>La aplicación puede ser suspendida o desactivada en cualquier momento por razones técnicas, de seguridad o administrativas</li>
                                <li>Se notificará a los usuarios con antelación razonable en caso de suspensión permanente del servicio</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                8. Limitación de Responsabilidad
                            </h2>
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl mb-3">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 mb-2">CLÁUSULA IMPORTANTE</p>
                                        <p className="text-sm text-amber-800 leading-relaxed">
                                            TimeToStudy se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo,
                                            expresas o implícitas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                En particular, TimeToStudy no se hace responsable de:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li>Pérdida de datos debido a fallos técnicos, errores del sistema o interrupciones del servicio</li>
                                <li>Daños o perjuicios derivados del uso o imposibilidad de uso de la aplicación</li>
                                <li>Errores en el registro de tiempos o estadísticas</li>
                                <li>Resultados académicos del usuario</li>
                                <li>Accesos no autorizados a la cuenta por negligencia del usuario en la custodia de sus credenciales</li>
                                <li>Incompatibilidades con dispositivos o navegadores específicos</li>
                            </ul>
                            <p className="text-sm text-slate-600 leading-relaxed mt-3">
                                Se recomienda encarecidamente a los usuarios realizar copias de seguridad periódicas de sus datos
                                importantes mediante la función de exportación disponible en la aplicación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                9. Modificaciones de los Términos
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                TimeToStudy se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
                                Los cambios serán efectivos desde su publicación en la aplicación. Se notificará a los usuarios
                                registrados de cualquier cambio sustancial mediante correo electrónico. El uso continuado de la
                                aplicación tras la modificación de los términos constituye la aceptación de los mismos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                10. Suspensión y Terminación
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                TimeToStudy se reserva el derecho de:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 leading-relaxed space-y-2 ml-4">
                                <li>Suspender o cancelar cuentas que incumplan estos Términos y Condiciones</li>
                                <li>Desactivar la aplicación temporal o permanentemente por problemas técnicos o de seguridad</li>
                                <li>Eliminar contenido que se considere inapropiado o que viole derechos de terceros</li>
                            </ul>
                            <p className="text-sm text-slate-600 leading-relaxed mt-3">
                                El usuario puede solicitar la eliminación de su cuenta en cualquier momento desde la configuración
                                de la aplicación. La eliminación de la cuenta conlleva la pérdida permanente de todos los datos asociados.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                11. Cookies y Tecnologías Similares
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                TimeToStudy utiliza localStorage del navegador para almacenar preferencias del usuario y mantener
                                sesiones activas. Esta información se almacena localmente en el dispositivo del usuario y no se
                                transmite a terceros. El usuario puede limpiar estos datos desde la configuración de su navegador,
                                aunque esto puede afectar a la funcionalidad de la aplicación.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                12. Enlaces a Terceros
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                La aplicación puede contener enlaces a sitios web de terceros. TimeToStudy no se hace responsable
                                del contenido, políticas de privacidad o prácticas de estos sitios externos. El acceso a enlaces
                                de terceros es bajo la responsabilidad del usuario.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                13. Legislación Aplicable y Jurisdicción
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Los presentes Términos y Condiciones se rigen por la legislación española. Para la resolución de
                                cualquier controversia derivada del uso de TimeToStudy, las partes se someten a los Juzgados y
                                Tribunales de España, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-3">
                                14. Contacto
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Para cualquier consulta relacionada con estos Términos y Condiciones, protección de datos o
                                ejercicio de derechos, el usuario puede contactar a través de la sección de configuración de la aplicación.
                            </p>
                        </section>

                        <section className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                                <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                            <p className="text-xs text-slate-500 italic leading-relaxed mt-2">
                                Al hacer clic en "Acepto los Términos y Condiciones", confirmas que has leído, comprendido y
                                aceptado todos los términos aquí expuestos.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer with acceptance */}
                <div className="p-6 border-t border-white/40 bg-white/30 shrink-0">
                    {!hasScrolledToBottom && (
                        <div className="mb-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                            <AlertTriangle size={18} />
                            <p className="text-xs font-bold">
                                Por favor, desplázate hasta el final del documento para continuar
                            </p>
                        </div>
                    )}

                    <div className="flex items-start gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="accept-terms"
                            checked={hasAccepted}
                            onChange={(e) => setHasAccepted(e.target.checked)}
                            disabled={!hasScrolledToBottom}
                            className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <label
                            htmlFor="accept-terms"
                            className={`text-sm font-bold ${hasScrolledToBottom ? 'text-slate-700 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            He leído y acepto los Términos y Condiciones de Uso de TimeToStudy, incluyendo las cláusulas de
                            limitación de responsabilidad y protección de datos personales.
                        </label>
                    </div>

                    <div className="flex gap-3">
                        {onDecline && (
                            <button
                                onClick={onDecline}
                                className="flex-1 py-4 px-6 bg-white/60 text-slate-600 rounded-2xl font-bold border border-white hover:bg-white transition-all"
                            >
                                Rechazar
                            </button>
                        )}
                        <button
                            onClick={handleAcceptClick}
                            disabled={!hasScrolledToBottom || !hasAccepted}
                            className={`flex-[2] py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${hasScrolledToBottom && hasAccepted
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle2 size={20} />
                            Acepto los Términos y Condiciones
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TermsAndConditions;
