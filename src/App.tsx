import { useState, useEffect, FormEvent } from 'react';
import { supabase } from './utils/supabaseClient';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Plans from './components/Plans';
import DepositPage from './components/DepositPage';
import WelcomeMessage from './components/WelcomeMessage';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import AuthPortal from './components/AuthPortal';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthCallback from './components/AuthCallback';
import { UserState, InvestmentPlan } from './types';
import { 
  Globe, LayoutDashboard, Settings, Mail, Lock, ShieldAlert, ArrowLeft, Eye, EyeOff 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserState | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'deposit'>('landing');
  const [selectedPlanForDeposit, setSelectedPlanForDeposit] = useState<InvestmentPlan | null>(null);

  // Auth callback routing state
  const [isAuthCallback, setIsAuthCallback] = useState(() => {
    const pathname = window.location.pathname;
    return pathname === '/auth/callback' || pathname.endsWith('/auth/callback');
  });

  // Admin routing state
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    return pathname === '/admin' || pathname.endsWith('/admin') || hash === '#/admin' || hash === '#admin';
  });

  // Admin User state
  const [adminUser, setAdminUser] = useState<UserState | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Monitor location changes
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      
      const isCurrentlyAdmin = pathname === '/admin' || pathname.endsWith('/admin') || hash === '#/admin' || hash === '#admin';
      setIsAdminRoute(isCurrentlyAdmin);

      const isCurrentlyCallback = pathname === '/auth/callback' || pathname.endsWith('/auth/callback');
      setIsAuthCallback(isCurrentlyCallback);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    tab: 'login' | 'register';
  }>({
    isOpen: false,
    tab: 'login',
  });

  // Handles profile mapping and session validation helper
  const handleAuthChange = async (session: any) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          console.error("Error fetching user profile from Supabase on auth state change:", error);
          setUser(null);
          setAdminUser(null);
          return;
        }

        if (profile.status === 'Suspended') {
          alert('Your account has been suspended by an administrator.');
          await supabase.auth.signOut();
          setUser(null);
          setAdminUser(null);
          handleSetView('landing');
          return;
        }

        const mappedUser: UserState = {
          id: profile.id,
          isLoggedIn: true,
          name: profile.name,
          email: profile.email,
          phone: profile.phone || '',
          address: profile.address || '',
          status: profile.status,
          role: profile.role,
          avatarSeed: profile.avatar_seed || 'default'
        };

        setUser(mappedUser);

        if (profile.role === 'admin') {
          setAdminUser(mappedUser);
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        console.error("Exception during session mapping:", err);
        setUser(null);
        setAdminUser(null);
      }
    } else {
      setUser(null);
      setAdminUser(null);
    }
  };

  // Restore and listen to Supabase Sessions automatically
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthChange(session);
      } catch (err) {
        console.error("Failed to fetch initial Supabase session:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect to dashboard on login/registration success
  const handleAuthSuccess = (userData: UserState) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setAdminUser(userData);
    }
    handleSetView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setAdminUser(null);
    handleSetView('landing');
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setAdminUser(null);
  };


  // Auto logout on inactivity (10 minutes)
  useEffect(() => {
    // Only set up if either a client user or admin user is logged in
    if (!user && !adminUser) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    // Store the start/initial last active time
    localStorage.setItem('musk_last_active', Date.now().toString());

    // Function to update last active timestamp
    const updateActivity = () => {
      localStorage.setItem('musk_last_active', Date.now().toString());
    };

    // Events to monitor for activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodically check if 10 minutes have elapsed since the last activity
    const interval = setInterval(() => {
      const lastActiveRaw = localStorage.getItem('musk_last_active');
      if (lastActiveRaw) {
        const lastActive = parseInt(lastActiveRaw, 10);
        const now = Date.now();
        if (now - lastActive >= INACTIVITY_TIMEOUT) {
          // Time expired! Log out!
          if (user) {
            handleLogout();
            alert('Your investment session has expired due to 10 minutes of inactivity. Please log in again to continue.');
          }
          if (adminUser) {
            handleAdminLogout();
            alert('Your administrative gateway session has expired due to 10 minutes of inactivity.');
          }
        }
      }
    }, 5000); // Check every 5 seconds for precise monitoring

    return () => {
      // Clean up listeners and interval
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [user, adminUser]);

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

  const handleSetView = (view: 'landing' | 'dashboard' | 'deposit') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToPublic = () => {
    // Navigate back to the landing page and clear url to root
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {
      console.error(e);
    }
    setIsAdminRoute(false);
  };

  const handleAdminLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    const trimmedEmail = adminEmail.trim().toLowerCase();
    const trimmedPassword = adminPassword.trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        setAdminError(error.message);
        setAdminLoading(false);
        return;
      }

      if (data.user) {
        // Query profile to check if role is admin
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile) {
          await supabase.auth.signOut();
          setAdminError('Unregistered gateway account or missing profile.');
          setAdminLoading(false);
          return;
        }

        if (profile.role !== 'admin') {
          await supabase.auth.signOut();
          setAdminError('Access denied: Unregistered gateway account.');
          setAdminLoading(false);
          return;
        }

        if (profile.status === 'Suspended') {
          await supabase.auth.signOut();
          setAdminError('Your administrator account has been suspended.');
          setAdminLoading(false);
          return;
        }

        // handleAuthChange will handle setting the state via onAuthStateChange
      }
    } catch (err: any) {
      setAdminError(err.message || 'An unexpected error occurred during gateway link.');
    } finally {
      setAdminLoading(false);
    }
  };

  if (isAuthCallback) {
    return (
      <AuthCallback
        onSuccess={(mappedUser) => {
          handleAuthSuccess(mappedUser);
          setIsAuthCallback(false);
        }}
        onFailure={() => {
          setIsAuthCallback(false);
          handleSetView('landing');
          handleOpenAuth('login');
        }}
      />
    );
  }

  if (isAdminRoute) {
    return (
      <div id="admin-panel-root" className="min-h-screen bg-[#02020a] text-gray-200 overflow-x-hidden relative selection:bg-red-500/35 selection:text-white">
        {/* Sleek red command border bar */}
        <div className="h-1 bg-gradient-to-r from-red-600 via-purple-600 to-red-500 fixed top-0 left-0 right-0 z-50" />
        
        {adminUser ? (
          <div className="pt-6 pb-12">
            {/* Admin Header with exclusive return option */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-red-500" />
                <span className="font-mono text-sm tracking-widest text-gray-300 font-bold uppercase">Starbase Operations Desk</span>
              </div>
              <button
                id="admin-return-btn"
                onClick={handleReturnToPublic}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Public Website</span>
              </button>
            </div>
            
            <AdminDashboard onLogout={handleAdminLogout} adminEmail={adminUser?.email} />
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#02020a] relative">
            {/* Glowing background shapes */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 space-y-6">
              {/* Back Link */}
              <button
                id="admin-return-from-login-btn"
                onClick={handleReturnToPublic}
                className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Public Website</span>
              </button>

              {/* Main Card */}
              <div className="rounded-3xl border border-red-500/10 bg-[#06040c]/90 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                
                {/* Header Info */}
                <div className="text-center space-y-3 pb-6 border-b border-white/5">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-inner">
                    <Settings className="h-6 w-6 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
                      Command Console Login
                    </h2>
                    <p className="text-xs text-gray-400 font-light mt-1">
                      Provide authorization parameters to access administrative state.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form id="admin-login-form" onSubmit={handleAdminLoginSubmit} className="space-y-4 pt-6">
                  {adminError && (
                    <div id="admin-login-error" className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-xs text-red-400">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-red-400">Security Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                      <input
                        id="admin-email-input"
                        type="email"
                        required
                        placeholder="admin@domain.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:border-red-500/30 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-red-400">Compliance Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
                      <input
                        id="admin-password-input"
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-12 py-3.5 text-xs text-white placeholder-gray-600 focus:border-red-500/30 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all min-h-[44px]"
                      />
                      <button
                        id="admin-toggle-password-btn"
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors"
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="admin-submit-btn"
                    type="submit"
                    disabled={adminLoading}
                    className="w-full mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 py-4 text-xs font-bold text-white shadow-lg shadow-red-500/10 active:scale-[0.98] transition-all min-h-[44px]"
                  >
                    {adminLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Establishing Uplink...</span>
                      </span>
                    ) : (
                      'Authenticate Gateway'
                    )}
                  </button>
                </form>

                {/* Secure Notice Footer */}
                <div className="mt-6 border-t border-white/5 pt-4 text-center">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                    SECURED SEED NODES • PROTOCOL L12-MSK
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
            
            <HowItWorks />

            <Plans
              user={user}
              onOpenAuth={handleOpenAuth}
              onSelectPlan={(plan) => {
                setSelectedPlanForDeposit(plan);
                handleSetView('deposit');
              }}
            />
            
            <WelcomeMessage />
            
            <CallToAction
              onOpenAuth={handleOpenAuth}
            />
          </>
        ) : currentView === 'dashboard' ? (
          <div className="pt-24 pb-12">
            <UserDashboard 
              user={user!} 
              onNavigateToPlans={() => {
                setSelectedPlanForDeposit(null);
                handleSetView('deposit');
              }} 
            />
          </div>
        ) : (
          <div className="pt-24 pb-12">
            <DepositPage 
              user={user!} 
              initialSelectedPlan={selectedPlanForDeposit} 
              onBackToDashboard={() => handleSetView('dashboard')} 
            />
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
