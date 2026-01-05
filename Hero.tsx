import React, { useState } from 'react';
import { ArrowRight, Zap, Phone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoiceModal } from './VoiceModal';

export const Hero: React.FC = () => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[140px]" 
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <Zap className="w-4 h-4 text-cyan-400 mr-2 fill-current animate-pulse" />
            <span className="text-cyan-200 text-sm font-medium tracking-wide">AUTOMATIZACIÓN DE NUEVA GENERACIÓN</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
            El Futuro de tu Negocio <br />
            <span className="gradient-text relative">
              Empieza Hoy
              <motion.svg 
                className="absolute w-full h-3 -bottom-1 left-0 text-cyan-500 opacity-60" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </motion.svg>
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
            Transformamos procesos manuales en flujos de trabajo inteligentes. 
            <span className="text-white font-medium"> Recupera tu tiempo</span>, reduce errores y escala sin límites con Inteligencia Artificial.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <motion.a 
              href="#contact" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleScroll(e, 'contact')}
              className="group cursor-pointer px-8 py-4 bg-white text-black font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Consultar Servicios
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVoiceModalOpen(true)}
              className="cursor-pointer px-8 py-4 bg-[#0B1121]/80 backdrop-blur-sm border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 font-medium rounded-full transition-all hover:bg-cyan-950/30 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] group"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              Hablar con Atlas (Voz)
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent z-20 pointer-events-none"></div>
    </section>
  );
};