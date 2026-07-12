import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Plans from './components/Plans';
import HowItWorks from './components/HowItWorks';
import WelcomeMessage from './components/WelcomeMessage';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import AuthPortal from './components/AuthPortal';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { UserState } from './types';
import { Globe, LayoutDashboard, Settings } from 'lucide-react';

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

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');

  // Detect /admin in url, hash, or search to trigger instant demo administrator credentials auto-login
  useEffect(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;

    const isAdminTrigger = 
      pathname === '/admin' || 
      pathname.endsWith('/admin') || 
      hash === '#/admin' || 
      hash === '#admin' || 
      search === '?admin' || 
      search.includes('admin=true');

    if (isAdminTrigger) {
      const adminUser: UserState = {
        isLoggedIn: true,
        name: 'Root Administrator',
        email: 'admin@muskinvestment.com',
        avatarSeed: 'ADMIN'
      };
      setUser(adminUser);
      localStorage.setItem('musk_user', JSON.stringify(adminUser));
      setCurrentView('admin');
      
      // Clear URL state so refresh doesn't trigger loop, and provide premium navigation transition
      try {
        window.history.replaceState({}, '', window.location.origin + '/');
      } catch (e) {
        console.error('URL cleaning failed:', e);
      }
    }
  }, []);

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    tab: 'login' | 'register';
  }>({
    isOpen: false,
    tab: 'login',
  });

  // Redirect to dashboard on login/registration success
  const handleAuthSuccess = (userData: UserState) => {
    setUser(userData);
    localStorage.setItem('musk_user', JSON.stringify(userData));
    handleSetView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('musk_user');
    handleSetView('landing');
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
    // Scroll only works if on landing page view
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSetView = (view: 'landing' | 'dashboard' | 'admin') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        currentView={currentView}
        onChangeView={handleSetView}
      />

      {/* Main Switchable Contents */}
      <main className="space-y-0 min-h-screen">
        {currentView === 'landing' ? (
          <>
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
          </>
        ) : currentView === 'dashboard' ? (
          <div className="pt-24 pb-12">
            <UserDashboard 
              user={user!} 
              onNavigateToPlans={() => handleSetView('landing')} 
            />
          </div>
        ) : (
          <div className="pt-24 pb-12">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Complete Footer */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenAuth={handleOpenAuth}
      />

      {/* Account Auth Portal */}
      <AuthPortal
        isOpen={authModal.isOpen}
        initialView={authModal.tab}
        onClose={handleCloseAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
