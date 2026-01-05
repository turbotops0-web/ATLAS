import React from 'react';
import { Cpu, Lock } from 'lucide-react';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#01040f] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center">
          <Cpu className="h-6 w-6 text-cyan-500 mr-2" />
          <span className="text-lg font-bold text-white tracking-wider">ATLAS<span className="text-cyan-500">.</span></span>
        </div>
        
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Atlas Automatizaciones. Todos los derechos reservados.
        </p>

        <div className="flex items-center space-x-6">
          <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm">Privacidad</a>
          <button 
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1 text-slate-700 hover:text-slate-500 transition-colors text-xs"
          >
            <Lock className="w-3 h-3" />
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
};