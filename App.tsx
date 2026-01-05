import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Pricing } from './components/Pricing';
import { AiDemo } from './components/AiDemo';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { SaaSProduct } from './components/SaaSProduct';
import { Testimonials } from './components/Testimonials';
import { ViewState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  const handleNavigate = (view: ViewState, sectionId?: string) => {
    setCurrentView(view);
    
    if (view === 'landing' && sectionId) {
      // Small timeout to allow render before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (view === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentView === 'admin') {
    return <AdminDashboard onBack={() => handleNavigate('landing')} />;
  }

  if (currentView === 'saas') {
    return <SaaSProduct onBack={() => handleNavigate('landing')} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar onNavigate={handleNavigate} />
      <main>
        <Hero />
        <Services />
        <Testimonials />
        <Pricing onNavigate={handleNavigate} />
        <AiDemo />
        <Contact />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;