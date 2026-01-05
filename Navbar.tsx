import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewState, sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setIsOpen(false);
    onNavigate('landing', sectionId);
  };

  const navLinks = [
    { name: 'Inicio', id: 'home' },
    { name: 'Servicios', id: 'services' },
    { name: 'Precios', id: 'pricing' },
    { name: 'Demo IA', id: 'demo' },
    { name: 'Contacto', id: 'contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <button 
            onClick={(e) => handleLinkClick(e, 'home')}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Cpu className="h-8 w-8 text-cyan-400 mr-2" />
            <span className="text-2xl font-bold tracking-wider text-white">ATLAS<span className="text-cyan-400">.</span></span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-sm uppercase tracking-widest font-medium"
              >
                {link.name}
              </a>
            ))}
            
            <button
              onClick={() => onNavigate('saas')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Acceso Socios
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-cyan-400 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.id}`}
                onClick={(e) => handleLinkClick(e, link.id)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                {link.name}
              </a>
            ))}
            <button
               onClick={() => { setIsOpen(false); onNavigate('saas'); }}
               className="w-full text-left block px-3 py-2 text-base font-bold text-cyan-400 hover:bg-white/5 rounded-md"
            >
              Acceso Socios
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};