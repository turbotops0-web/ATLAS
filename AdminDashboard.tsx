import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, DollarSign, LogOut, CheckCircle, Clock, Search, Plus, User, Lock, Mail, TrendingUp, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';

interface AdminDashboardProps {
  onBack: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
      active ? 'bg-cyan-900/20 text-cyan-400 border-r-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="hidden md:inline font-medium text-sm">{label}</span>
  </button>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  
  const [activeTab, setActiveTab] = useState<'crm' | 'calendar' | 'finance'>('crm');
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    let interval: number;
    if (lockoutTimer > 0) {
      interval = window.setInterval(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setIsAuthenticating(true);
    setLoginError(false);

    const isValid = await authService.validateCredentials(username, password);

    if (isValid) {
      setIsAuthenticated(true);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Administración Central</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.2em]">Atlas Security Kernel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="ADMIN USER"
                disabled={isAuthenticating || lockoutTimer > 0}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-white/30 uppercase tracking-widest text-xs font-bold"
              />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="SECURITY KEY"
                disabled={isAuthenticating || lockoutTimer > 0}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-red-400 text-[10px] font-black uppercase text-center tracking-widest"
                >
                  Acceso Restringido: Credenciales Inválidas
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isAuthenticating || lockoutTimer > 0}
              className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" /> : 'Sincronizar Acceso'}
            </button>
            <button type="button" onClick={onBack} className="w-full text-slate-600 text-[10px] font-bold uppercase tracking-widest py-2 hover:text-slate-400 transition-colors">Volver al inicio</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      <header className="glass-panel border-b border-white/5 py-4 px-6 flex justify-between items-center bg-[#01040f]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex flex-col">
            <span className="font-black tracking-[0.3em] text-sm text-white">CONTROL CENTRAL</span>
            <span className="text-[10px] text-cyan-500 font-bold uppercase">Atlas Operations v4.0</span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"><LogOut className="w-5 h-5" /></button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-20 md:w-64 glass-panel border-r border-white/5 flex flex-col py-8 bg-[#01040f]/50">
          <SidebarItem icon={<Users className="w-5 h-5" />} label="Leads / Clientes" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
          <SidebarItem icon={<Calendar className="w-5 h-5" />} label="Citas" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={<DollarSign className="w-5 h-5" />} label="Caja y Finanzas" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-[0.02]">
          {activeTab === 'crm' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl font-bold mb-8">Leads Entrantes</h1>
              <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-slate-500 p-12 bg-slate-900/20">
                <Users className="w-16 h-16 mb-4 opacity-5" />
                <p className="font-bold uppercase tracking-widest text-xs">Sin registros nuevos hoy</p>
                <p className="text-[10px] mt-2">La base de datos se actualiza en tiempo real.</p>
              </div>
            </motion.div>
          )}
          {activeTab === 'finance' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl">
              <h1 className="text-3xl font-bold mb-8">Resumen Financiero</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div className="glass-panel p-8 border border-white/10 rounded-3xl bg-cyan-500/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp className="w-24 h-24" /></div>
                   <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Ingresos Mes Actual</p>
                   <p className="text-5xl font-black text-white">0 <span className="text-xl text-slate-500">UF</span></p>
                 </div>
                 <div className="glass-panel p-8 border border-white/10 rounded-3xl bg-slate-900/40">
                   <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">Gastos Proyectados</p>
                   <p className="text-5xl font-black text-slate-700">0 <span className="text-xl text-slate-800">UF</span></p>
                 </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-slate-500" />
                <p className="text-xs text-slate-500 font-medium">Sincroniza tu pasarela de pagos para habilitar el seguimiento automático de flujos de caja.</p>
              </div>
            </motion.div>
          )}
          {activeTab === 'calendar' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center p-20 glass-panel border border-white/5 rounded-[2.5rem] bg-slate-900/10">
              <Calendar className="w-16 h-16 mx-auto mb-6 text-slate-700" />
              <h3 className="text-xl font-bold mb-2">Agenda Digital</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Tu calendario se sincronizará automáticamente con las reservas confirmadas vía WhatsApp.</p>
              <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Sincronizar Calendario</button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};