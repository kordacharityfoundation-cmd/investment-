/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Plans from './components/Plans';
import HowItWorks from './components/HowItWorks';
import WelcomeMessage from './components/WelcomeMessage';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { UserState } from './types';

export default function App() {
  const [user, setUser] = useState<UserState | null>(() => {
    // Check if user is logged in locally
    const saved = localStorage.getItem('musk_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    tab: 'login' | 'register';
  }>({
    isOpen: false,
    tab: 'login',
  });

  const handleAuthSuccess = (userData: UserState) => {
    setUser(userData);
    localStorage.setItem('musk_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('musk_user');
  };

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthModal({
      isOpen: true,
      tab: tab,
    });
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleScrollToSection = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#030310] overflow-x-hidden selection:bg-purple-600/45 selection:text-white relative">
      {/* Dynamic top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 fixed top-0 left-0 right-0 z-50" />

      {/* Interactive Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Sections */}
      <main className="space-y-0">
        <Hero
          onOpenAuth={handleOpenAuth}
          onScrollToSection={handleScrollToSection}
        />
        
        <Stats />
        
        <About />
        
        <Plans
          user={user}
          onOpenAuth={handleOpenAuth}
        />
        
        <HowItWorks />
        
        <WelcomeMessage />
        
        <CallToAction
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* Complete Footer */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenAuth={handleOpenAuth}
      />

      {/* Account Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.tab}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

