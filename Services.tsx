import React from 'react';
import { Bot, Workflow, BarChart3, BrainCircuit, MessageSquareCode, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ServiceItem } from '../types';

const services: ServiceItem[] = [
  {
    title: "Chatbots con IA",
    description: "Asistentes virtuales que atienden 24/7, cierran ventas y resuelven dudas complejas sin intervención humana.",
    icon: <Bot className="w-8 h-8 text-cyan-400" />
  },
  {
    title: "Automatización de Flujos",
    description: "Conectamos tus apps favoritas (CRM, Email, Sheets) para que los datos fluyan automáticamente.",
    icon: <Workflow className="w-8 h-8 text-purple-400" />
  },
  {
    title: "Consultoría Estratégica",
    description: "Analizamos tu negocio para identificar cuellos de botella y oportunidades de automatización masiva.",
    icon: <BarChart3 className="w-8 h-8 text-green-400" />
  },
  {
    title: "Integración de Modelos LLM",
    description: "Implementamos Gemini y otros modelos de lenguaje directamente en tus sistemas internos.",
    icon: <BrainCircuit className="w-8 h-8 text-pink-400" />
  },
  {
    title: "Desarrollo a Medida",
    description: "Soluciones de software personalizadas cuando las herramientas 'no-code' no son suficientes.",
    icon: <MessageSquareCode className="w-8 h-8 text-yellow-400" />
  },
  {
    title: "Seguridad y Datos",
    description: "Automatizaciones seguras que protegen la integridad de tu información empresarial.",
    icon: <ShieldCheck className="w-8 h-8 text-blue-400" />
  }
];

export const Services: React.FC = () => {
  return (
    <section id="services" className="py-24 scroll-mt-28 bg-[#020617] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Nuestras Soluciones</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Herramientas diseñadas para eliminar el trabajo repetitivo y potenciar la creatividad humana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-8 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2 group"
            >
              <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-cyan-500/10 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};