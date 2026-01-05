import React, { useState } from 'react';
import { Mail, Check, Copy, User, Phone, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const targetEmail = "atlasautomatizaciones540@gmail.com";

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCopy = () => {
    if (!validateEmail(targetEmail)) {
      console.error("El formato del correo electrónico no es válido.");
      return;
    }

    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Nuevo Contacto Web: ${formData.name}`;
    const body = `Nombre: ${formData.name}%0D%0ACorreo: ${formData.email}%0D%0ATeléfono: ${formData.phone}%0D%0A%0D%0AMensaje:%0D%0A${formData.message}`;
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="py-24 scroll-mt-28 relative min-h-[50vh] flex items-center">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-slate-900/50 to-[#020617] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contáctanos
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            ¿Listo para automatizar tu negocio? Escríbenos directamente y te responderemos a la brevedad.
          </p>

          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40 inline-block w-full max-w-2xl relative overflow-hidden group mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="w-20 h-20 bg-cyan-900/30 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                <Mail className="w-10 h-10 text-cyan-400" />
              </div>

              <div className="w-full">
                <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-4">Correo Electrónico Oficial</p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="relative group/email">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight break-all select-all">
                      {targetEmail}
                    </span>
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover/email:w-full"></div>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={handleCopy}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 flex-shrink-0 active:scale-95"
                      title="Copiar correo"
                    >
                      {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6" />}
                    </button>
                    
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-20"
                        >
                          ¡Copiado!
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rotate-45"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form with Dynamic Placeholders */}
          <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-white/5 text-left">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" /> O déjanos tus datos
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder={phoneFocus ? "Ej: +56 9 1234 5678" : "Teléfono"}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    onFocus={() => setPhoneFocus(true)}
                    onBlur={() => setPhoneFocus(false)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder={emailFocus ? "Tu email de contacto" : "nombre@empresa.com"}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all"
                />
              </div>

              <div className="relative group">
                 <textarea
                   rows={3}
                   placeholder="Cuéntanos brevemente qué necesitas..."
                   value={formData.message}
                   onChange={(e) => setFormData({...formData, message: e.target.value})}
                   className="w-full bg-black/30 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all resize-none"
                 ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" /> Enviar Mensaje
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};