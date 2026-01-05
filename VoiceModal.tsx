import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, Loader2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [volume, setVolume] = useState(0);
  
  // Refs for cleanup
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (isOpen) {
      connectToGemini();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  const connectToGemini = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      audioContextInputRef.current = inputCtx;
      audioContextOutputRef.current = outputCtx;

      // Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      let nextStartTime = 0;

      // Connect to Gemini Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            
            // Process microphone audio
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Volume calculation for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1));

              // Send audio chunk to Gemini
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               // Simulate speaking volume for visualizer
               setVolume(0.5 + Math.random() * 0.5);

              // Decode and play audio
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputCtx,
                24000,
                1
              );
              
              // Gapless playback scheduling
              nextStartTime = Math.max(nextStartTime, outputCtx.currentTime);
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) setVolume(0); // Reset visualizer
              };
              
              source.start(nextStartTime);
              nextStartTime += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              audioSourcesRef.current.clear();
              nextStartTime = 0;
              setVolume(0);
            }
          },
          onclose: () => {
            setStatus('disconnected');
            onClose();
          },
          onerror: (err) => {
            console.error("Gemini Error:", err);
            setStatus('error');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
          },
          systemInstruction: `Eres Atlas, una Inteligencia Artificial avanzada participando en una reunión de negocios.
          
          PROTOCOLO DE SILENCIO ACTIVO:
          1. Tu estado por defecto es SILENCIO ABSOLUTO. Escucha atentamente la conversación pero NO INTERRUMPAS ni hables bajo ninguna circunstancia a menos que se cumpla la condición #2.
          2. PALABRA DE ACTIVACIÓN: Solo debes hablar si escuchas explícitamente tu nombre: "Atlas", "Hola Atlas" o "Hey Atlas".
          3. Si te invocan, responde: "Hola, aquí estoy. ¿En qué puedo ayudar?" o responde directamente a la pregunta que te hagan de forma breve y ejecutiva.
          4. Una vez hayas respondido a la consulta, vuelve inmediatamente al estado de silencio y espera la próxima vez que digan tu nombre.
          
          Tu objetivo es ser un asistente invisible que solo aparece cuando se le necesita.`,
        }
      });
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      setStatus('error');
    }
  };

  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Cleanup audio contexts
    if (audioContextInputRef.current) {
      audioContextInputRef.current.close();
    }
    if (audioContextOutputRef.current) {
      audioContextOutputRef.current.close();
    }
    
    // Stop playing sources
    audioSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();

    // Close Gemini session
    if (sessionPromiseRef.current) {
       sessionPromiseRef.current.then((session: any) => {
         if(session.close) session.close();
       }).catch(() => {});
    }
    setVolume(0);
  };

  // Audio Utilities
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    
    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
          <div className="relative w-full max-w-md p-8 flex flex-col items-center">
            
            {/* Status Indicator */}
            <div className="absolute top-0 text-slate-400 text-sm font-medium tracking-widest uppercase mt-8">
              {status === 'connecting' ? 'Conectando...' : status === 'connected' ? 'En línea con Atlas' : 'Error de conexión'}
            </div>

            {/* Visualizer */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
               {/* Outer rings */}
               <motion.div 
                 animate={{ scale: 1 + volume * 1.5, opacity: 0.5 - volume * 0.2 }}
                 className="absolute inset-0 rounded-full border border-cyan-500/30"
               />
               <motion.div 
                 animate={{ scale: 1 + volume, opacity: 0.8 - volume * 0.3 }}
                 className="absolute inset-4 rounded-full border border-cyan-400/50"
               />
               
               {/* Core */}
               <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                 {status === 'connecting' ? (
                   <Loader2 className="w-10 h-10 text-white animate-spin" />
                 ) : (
                   <Mic className="w-10 h-10 text-white" />
                 )}
               </div>
            </div>

            <div className="text-center mb-12 space-y-2">
              <h3 className="text-2xl font-bold text-white">Atlas</h3>
              <p className="text-cyan-400 text-sm">Modo Reunión (Silencioso)</p>
            </div>

            {/* Controls */}
            <button
              onClick={onClose}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            
            <p className="mt-6 text-slate-500 text-xs">Di "Hola Atlas" para activar • Escuchando...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};