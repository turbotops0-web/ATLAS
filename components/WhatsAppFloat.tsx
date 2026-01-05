import React from 'react';

export const WhatsAppFloat: React.FC = () => {
  const phone = '56927231751';
  const message = encodeURIComponent('Hola! Quisiera información sobre su negocio');
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed right-5 bottom-5 z-[9999]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20b85a] text-white px-4 py-3 rounded-full shadow-lg font-bold transition-transform active:scale-95"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="flex-shrink-0">
          <path fill="#fff" d="M12.04 2C6.48 2 2 6.48 2 12.04c0 2.12.62 4.09 1.7 5.74L2 22l4.44-1.66c1.61 1 3.48 1.6 5.6 1.6C17.6 22 22 17.52 22 11.96 22 6.48 17.6 2 12.04 2z"/>
          <path fill="#25D366" d="M20.47 12.04c0 4.71-3.89 8.6-8.6 8.6-1.78 0-3.44-.51-4.86-1.4l-.35-.22-2.64.98.88-2.58-.23-.36A8.568 8.568 0 0 1 3.57 12.04c0-4.73 3.89-8.62 8.62-8.62 4.72 0 8.61 3.89 8.61 8.62z" opacity="0"/>
        </svg>
        <span className="hidden sm:inline">Escríbenos</span>
        <span className="font-mono text-sm">+56 9 2723 1751</span>
      </a>
    </div>
  );
};
