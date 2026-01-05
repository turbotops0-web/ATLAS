import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings, ArrowLeft, Wand2, Copy, Check, Lock, User, BrainCircuit, Mic, Square, FileAudio, UploadCloud, X, Loader2, ListTodo, Lightbulb, MessageSquareQuote, History, Sparkles, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { analyzeMeetingAudio } from '../services/geminiService';
import { authService } from '../services/authService';

interface SaaSProductProps {
  onBack: () => void;
}

type Tab = 'parser' | 'crm' | 'reports' | 'settings' | 'meetings';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0], staggerChildren: 0.1 }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const SidebarItem: React.FC<{ id: Tab, icon: React.ReactNode, label: string, activeTab: Tab, setActiveTab: (t: Tab) => void }> = ({ id, icon, label, activeTab, setActiveTab }) => (
  <motion.div 
    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
    onClick={() => setActiveTab(id)}
    className={`p-3 rounded-lg flex items-center gap-3 font-medium cursor-pointer transition-all duration-200 relative overflow-hidden
      ${activeTab === id ? 'bg-cyan-900/20 text-cyan-400' : 'text-slate-400'}`}
  >
    {activeTab === id && <motion.div layoutId="activeTabIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r" />}
    {icon}
    <span>{label}</span>
  </motion.div>
);

export const SaaSProduct: React.FC<SaaSProductProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  
  const [activeTab, setActiveTab] = useState<Tab>('parser');
  
  // Meetings State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [meetingData, setMeetingData] = useState<{transcription: string, summary: string, tasks: string} | null>(null);
  const [resultActiveTab, setResultActiveTab] = useState<'summary' | 'tasks' | 'transcription'>('summary');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadMode, setUploadMode] = useState<'record' | 'upload'>('record');
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lockout logic
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

    // Simulamos un retraso para evitar timing attacks
    await new Promise(r => setTimeout(r, 800));

    const isValid = await authService.validateCredentials(loginUser, loginPass);

    if (isValid) {
      setIsAuthenticated(true);
      setFailedAttempts(0);
    } else {
      setLoginError(true);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setLockoutTimer(30);
        setFailedAttempts(0);
      }
      
      setTimeout(() => setLoginError(false), 3000);
    }
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setLoginUser('');
    setLoginPass('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob, 'audio/webm');
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(v => v + 1), 1000);
    } catch (e) { alert("Error de acceso al micrófono"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { alert("Archivo demasiado grande. Máximo 100MB"); return; }
      processAudio(file, file.type);
    }
  };

  const processAudio = async (blob: Blob | File, mimeType: string) => {
    setIsTranscribing(true);
    setMeetingData(null);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const rawResult = await analyzeMeetingAudio(base64, mimeType);
        
        const transcription = rawResult.split('[TRANSCRIPCION_INICIO]')[1]?.split('[TRANSCRIPCION_FIN]')[0]?.trim() || "No se detectó transcripción.";
        const summary = rawResult.split('[RESUMEN_INICIO]')[1]?.split('[RESUMEN_FIN]')[0]?.trim() || "No se detectó resumen.";
        const tasks = rawResult.split('[TAREAS_INICIO]')[1]?.split('[TAREAS_FIN]')[0]?.trim() || "No se detectaron tareas.";
        
        setMeetingData({ transcription, summary, tasks });
        setResultActiveTab('summary');
      } catch (e) { 
        console.error(e);
      } finally { 
        setIsTranscribing(false); 
      }
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Security Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(6,182,212,0.1)] relative z-10"
        >
          <div className="text-center mb-10">
            <motion.div 
              animate={isAuthenticating ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 transition-colors duration-500 ${loginError ? 'bg-red-500/10 border-red-500/30' : 'bg-cyan-500/10 border-cyan-500/30'}`}
            >
              <ShieldCheck className={`w-10 h-10 ${loginError ? 'text-red-400' : 'text-cyan-400'}`} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight">Portal Seguro</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Atlas Cloud Authentication Engine</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identificador Socio</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="USERNAME" 
                  autoComplete="username"
                  value={loginUser} onChange={e => setLoginUser(e.target.value)}
                  disabled={isAuthenticating || lockoutTimer > 0}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 uppercase tracking-widest text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Código de Acceso</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password"
                  value={loginPass} onChange={e => setLoginPass(e.target.value)}
                  disabled={isAuthenticating || lockoutTimer > 0}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  CREDENCIALES INVÁLIDAS. INTENTO {failedAttempts}/3
                </motion.div>
              )}
              {lockoutTimer > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-900 border border-white/5 p-4 rounded-xl text-center"
                >
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Bloqueo de seguridad activo</p>
                  <p className="text-2xl font-black text-white font-mono">{lockoutTimer}s</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isAuthenticating || lockoutTimer > 0 || !loginUser || !loginPass}
              className={`w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative flex items-center justify-center gap-2
                ${isAuthenticating ? 'cursor-wait' : ''}`}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ESCANEANDO...
                </>
              ) : (
                <>
                  ACCEDER AL NÚCLEO
                </>
              )}
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            </button>
          </form>

          <button onClick={onBack} className="w-full mt-8 text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Cancelar y volver
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#020617] p-6 hidden md:flex flex-col z-20">
        <div className="text-cyan-400 font-bold text-xl mb-10 tracking-widest flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" /> ATLAS CLOUD
        </div>
        <div className="space-y-2 flex-1">
          <SidebarItem id="parser" icon={<Wand2 className="w-5 h-5" />} label="Smart Parser" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="crm" icon={<Users className="w-5 h-5" />} label="CRM Real" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="meetings" icon={<Mic className="w-5 h-5" />} label="Análisis Reunión" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="reports" icon={<FileText className="w-5 h-5" />} label="Métricas" activeTab={activeTab} setActiveTab={setActiveTab} />
          <SidebarItem id="settings" icon={<Settings className="w-5 h-5" />} label="Sistema" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all font-bold">
          <Lock className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-gradient-to-br from-[#0f172a] to-[#020617]">
        <AnimatePresence mode="wait">
          {activeTab === 'meetings' && (
            <motion.div key="meetings" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                  <h1 className="text-4xl font-bold flex items-center gap-3"><BrainCircuit className="w-10 h-10 text-cyan-400" /> Inteligencia de Reuniones</h1>
                  <p className="text-slate-400 mt-2 text-lg">Procesamiento masivo de audio para extracción de compromisos y minutas ejecutivas.</p>
                </div>
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-xl">
                  <button onClick={() => setUploadMode('record')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${uploadMode === 'record' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}><Mic className="w-4 h-4" /> GRABAR VIVO</button>
                  <button onClick={() => setUploadMode('upload')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${uploadMode === 'upload' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}><UploadCloud className="w-4 h-4" /> SUBIR AUDIO</button>
                </div>
              </div>

              {/* Main Interaction Area */}
              <div className="grid grid-cols-1 gap-8 mb-10">
                <div className="relative glass-panel rounded-[2.5rem] p-12 border border-white/10 flex flex-col items-center justify-center bg-slate-900/30 overflow-hidden min-h-[420px] shadow-2xl group">
                  {/* Decorative backgrounds */}
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50 pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                  {isRecording && (
                    <div className="absolute top-8 left-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Capturando Audio Directo</span>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    {uploadMode === 'record' ? (
                      <div className="flex flex-col items-center gap-8">
                        {/* Waveform Visualization Mock */}
                        <div className="flex items-end gap-1.5 h-16 mb-4">
                          {[...Array(20)].map((_, i) => (
                            <motion.div 
                              key={i}
                              animate={isRecording ? { 
                                height: [10, 20 + Math.random() * 40, 10],
                                backgroundColor: ['rgba(34,211,238,0.2)', 'rgba(34,211,238,0.8)', 'rgba(34,211,238,0.2)']
                              } : { height: 6, backgroundColor: 'rgba(255,255,255,0.1)' }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                              className="w-1.5 rounded-full"
                            />
                          ))}
                        </div>

                        <button 
                          onClick={isRecording ? stopRecording : startRecording} 
                          className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)] transition-all duration-500 active:scale-90 relative
                            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-600 hover:bg-cyan-500 hover:scale-110'}`}
                        >
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isRecording ? 'bg-red-500' : 'bg-cyan-400'}`} />
                          {isRecording ? <Square className="w-10 h-10 fill-current" /> : <Mic className="w-12 h-12" />}
                        </button>

                        <div className="text-center">
                          <div className="font-mono text-5xl font-black tracking-tighter text-white mb-2">
                            {Math.floor(recordingTime/60)}:{(recordingTime%60).toString().padStart(2, '0')}
                          </div>
                          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">Tiempo de Sesión</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-lg flex flex-col items-center">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center hover:border-cyan-500/50 cursor-pointer transition-all bg-white/5 hover:bg-white/10 group/drop"
                        >
                          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 group-hover/drop:scale-110 group-hover/drop:border-cyan-500/30 transition-all shadow-xl">
                            <UploadCloud className="w-10 h-10 text-slate-400 group-hover/drop:text-cyan-400" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Subir archivo de reunión</h3>
                          <p className="text-slate-500 text-sm">Arrastra o selecciona MP3, WAV, M4A (Max 100MB)</p>
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {isTranscribing && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-12 flex flex-col items-center gap-4 bg-cyan-500/10 px-8 py-5 rounded-3xl border border-cyan-500/20 backdrop-blur-md"
                        >
                          <div className="flex items-center gap-4">
                            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                            <div className="text-left">
                              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Procesando con Atlas IA</h4>
                              <p className="text-[10px] text-cyan-400 font-mono animate-pulse">ESTRUCTURANDO MINUTA ESTRATÉGICA...</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Corporate Intelligence Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center gap-6 bg-slate-900/20 hover:border-white/20 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Algoritmo de Fidelidad</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">Nuestra IA filtra ruidos de fondo y separa interlocutores para una transcripción fiel al 99%.</p>
                    </div>
                  </div>
                  <div className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center gap-6 bg-slate-900/20 hover:border-white/20 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Síntesis Ejecutiva</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">Transforma horas de conversación en un informe de 1 página listo para ser enviado a Gerencia.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <AnimatePresence>
                {meetingData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 40 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    className="glass-panel rounded-[2.5rem] border border-cyan-500/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.1)]"
                  >
                    <div className="flex border-b border-white/5 bg-slate-900/60 p-2 gap-2">
                      <button 
                        onClick={() => setResultActiveTab('summary')} 
                        className={`flex-1 py-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all
                          ${resultActiveTab === 'summary' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                      >
                        <Lightbulb className="w-5 h-5" /> RESUMEN EJECUTIVO
                      </button>
                      <button 
                        onClick={() => setResultActiveTab('tasks')} 
                        className={`flex-1 py-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all
                          ${resultActiveTab === 'tasks' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                      >
                        <ListTodo className="w-5 h-5" /> PLAN DE ACCIÓN
                      </button>
                      <button 
                        onClick={() => setResultActiveTab('transcription')} 
                        className={`flex-1 py-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 transition-all
                          ${resultActiveTab === 'transcription' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                      >
                        <MessageSquareQuote className="w-5 h-5" /> TRANSCRIPCIÓN
                      </button>
                    </div>

                    <div className="p-10 md:p-14 relative min-h-[500px] bg-slate-900/20">
                      <div className="absolute top-8 right-10 flex items-center gap-3">
                        <button 
                          onClick={() => copyToClipboard(resultActiveTab === 'summary' ? meetingData.summary : resultActiveTab === 'tasks' ? meetingData.tasks : meetingData.transcription)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-cyan-400 transition-all border border-white/10 active:scale-95 text-xs font-bold"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copiado' : 'Copiar Sección'}
                        </button>
                        <button 
                           onClick={() => setMeetingData(null)}
                           className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-all border border-red-500/10"
                           title="Cerrar resultados"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="prose prose-invert max-w-none prose-lg">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={resultActiveTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="whitespace-pre-wrap leading-relaxed text-slate-300 font-light"
                          >
                            {resultActiveTab === 'summary' && (
                              <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">Síntesis Estratégica</h2>
                                {meetingData.summary}
                              </div>
                            )}
                            {resultActiveTab === 'tasks' && (
                              <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-purple-500 pl-4">Compromisos y Tareas</h2>
                                {meetingData.tasks}
                              </div>
                            )}
                            {resultActiveTab === 'transcription' && (
                              <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-slate-500 pl-4">Registro Completo</h2>
                                {meetingData.transcription}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'parser' && (
            <motion.div key="parser" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl">
              <h1 className="text-3xl font-bold mb-4">Estructurador Inteligente</h1>
              <p className="text-slate-400 mb-6">Convierte texto desordenado en datos limpios para tu CRM.</p>
              <div className="glass-panel p-6 rounded-xl border border-white/10">
                <textarea 
                  className="w-full h-64 bg-black/30 border border-white/10 rounded-lg p-4 mb-4 focus:outline-none focus:border-cyan-500/40 transition-colors" 
                  placeholder="Pega aquí el texto que deseas que la IA organice..." 
                />
                <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                  <Wand2 /> Procesar Datos
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'crm' && (
            <motion.div key="crm" variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl">
              <h1 className="text-3xl font-bold mb-4 text-white">Gestión de Clientes Centralizada</h1>
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-widest font-black">
                    <tr><th className="p-6">Empresa / Lead</th><th className="p-6">Estado</th><th className="p-6">Inversión</th><th className="p-6">Acciones</th></tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={4} className="p-32 text-center text-slate-600 italic">Accediendo a la base de datos segura de Atlas Automatizaciones...</td></tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div key="reports" variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl">
              <h1 className="text-3xl font-bold mb-4">Métricas de Rendimiento</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Consultas IA", value: "1,284", trend: "+12%" },
                  { label: "Minutos de Reunión", value: "450min", trend: "+5%" },
                  { label: "Ahorro Estimado", value: "32 hrs", trend: "+24%" }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{stat.value}</span>
                      <span className="text-green-500 text-xs font-bold">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};