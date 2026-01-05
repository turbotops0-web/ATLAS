import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Sofía Martinez",
    role: "CEO, Clínica Dental Smile",
    text: "Desde que implementamos el bot de WhatsApp de Atlas, hemos recuperado un 40% de pacientes que antes perdíamos por no responder a tiempo. La inversión se pagó sola en 2 semanas.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Javier Rojas",
    role: "Gerente de Ventas, Inmobiliaria Cumbre",
    text: "La automatización del CRM es increíble. El sistema califica los leads automáticamente y mi equipo solo habla con los que están listos para comprar. Ahorramos 20 horas a la semana.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
  },
  {
    name: "Camila Varas",
    role: "Fundadora, E-commerce Moda",
    text: "Atlas nos ayudó a conectar nuestro stock con las ventas en Instagram. Ya no vendemos productos agotados por error y la experiencia del cliente es impecable.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Resultados reales de empresas que ya automatizaron sus operaciones con nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-8 rounded-2xl border border-white/5 relative group hover:border-cyan-500/30 transition-all"
            >
              <Quote className="w-10 h-10 text-cyan-500/20 absolute top-6 right-6" />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/20"
                />
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};