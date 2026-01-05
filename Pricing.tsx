import React from 'react';
import { Check, Sparkles, Zap, ArrowRight, Search, Info, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';

interface PricingProps {
  onNavigate: (view: ViewState, sectionId?: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const plans = [
    {
      name: "Plan Discovery",
      price: "0",
      currency: "UF",
      period: "/ consulta",
      subPrice: "100% Gratuito",
      description: "Ideal para empresas que quieren explorar el potencial de la IA sin riesgos.",
      icon: <Search className="w-6 h-6 text-cyan-400" />,
      features: [
        "Sesión de diagnóstico (30 min)",
        "Análisis de viabilidad técnica",
        "Propuesta de automatización básica",
        "Sin compromiso de compra",
        "Ideal para entender el potencial"
      ],
      highlight: false,
      buttonText: "Agendar Diagnóstico"
    },
    {
      name: "Atlas Starter",
      price: "3.5",
      currency: "UF",
      period: "/ mes",
      subPrice: "Sin costo de instalación",
      description: "Modelo SaaS: Acceso inmediato a nuestra plataforma con plantillas listas para usar.",
      icon: <Rocket className="w-6 h-6 text-pink-400" />,
      features: [
        "Acceso a Plataforma Atlas Cloud",
        "3 Plantillas de Chatbots",
        "Conexión WhatsApp & Instagram",
        "Videotutoriales de configuración",
        "Soporte por Email"
      ],
      highlight: false,
      buttonText: "Suscribirse Ahora"
    },
    {
      name: "Pack Aceleración",
      price: "12",
      currency: "UF",
      period: "+ IVA (Setup)",
      subPrice: "+ 4 UF/mes (Soporte)",
      description: "Implementación ágil 'Done-For-You'. Nosotros construimos tu asistente por ti.",
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      features: [
        "Chatbot IA personalizado (Gemini)",
        "Integración con WhatsApp/Web",
        "Automatización de 1 flujo de ventas",
        "Panel de control exclusivo",
        "Soporte post-implementación",
        "Entrega en 1-2 semanas"
      ],
      highlight: true,
      buttonText: "Empezar Ahora"
    }
  ];

  const handlePlanClick = (e: React.MouseEvent, planName: string) => {
    e.preventDefault();
    const event = new CustomEvent('selectPlan', { detail: planName });
    window.dispatchEvent(event);
    onNavigate('landing', 'contact');
  };

  return (
    <section id="pricing" className="py-24 scroll-mt-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Planes de Inversión</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Soluciones escalables diseñadas para potenciar la eficiencia de tu negocio desde el primer día.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 flex flex-col h-full
                ${plan.highlight 
                  ? 'bg-slate-900/80 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-10 scale-105' 
                  : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                  Recomendado
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${
                    plan.highlight ? 'bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 
                    plan.name === "Atlas Starter" ? 'bg-pink-500/20' :
                    'bg-white/5'
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                      <span className="text-xl ml-1">UF</span>
                    </span>
                    <span className="text-slate-500 text-sm font-medium ml-1">{plan.period}</span>
                  </div>
                  {plan.subPrice && (
                    <span className={`font-bold text-xs font-mono mt-3 block p-2 rounded border text-center uppercase tracking-tighter ${
                      plan.name === "Plan Discovery" 
                        ? "text-green-400 bg-green-950/30 border-green-500/20" 
                        : plan.name === "Atlas Starter"
                          ? "text-pink-400 bg-pink-950/30 border-pink-500/20"
                          : "text-cyan-400 bg-cyan-950/30 border-cyan-500/20"
                    }`}>
                      {plan.subPrice}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-6 leading-relaxed min-h-[48px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className={`w-5 h-5 flex-shrink-0 ${
                      plan.highlight ? 'text-cyan-400' : 
                      plan.name === "Plan Discovery" ? 'text-green-500' : 
                      plan.name === "Atlas Starter" ? 'text-pink-400' :
                      'text-slate-500'
                    }`} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => handlePlanClick(e, plan.name)}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer
                  ${plan.highlight 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl hover:shadow-cyan-500/30 active:scale-95' 
                    : plan.name === "Plan Discovery"
                      ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-green-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-pink-500/40'
                  }`}
              >
                {plan.buttonText}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900/50 border border-white/5 text-slate-400 text-sm backdrop-blur-sm">
            <Info className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <p>
              Precios expresados en UF. Se factura en CLP según el valor del día. 
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};