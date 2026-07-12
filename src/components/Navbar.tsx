import { useState, useEffect } from 'react';
import { Menu, X, Rocket, LogOut, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState } from '../types';

interface NavbarProps {
  user: UserState | null;
  onLogout: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function Navbar({ user, onLogout, onOpenAuth }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for glassy styling on header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Investment Plans', href: '#plans' },
    { name: 'How It Works', href: '#how-it-works' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#030310]/80 backdrop-blur-md border-b border-white/5 py-4 shadow-xl'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            id="nav-logo"
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}
            className="flex items-center gap-2.5 font-display text-lg tracking-wider font-extrabold text-white"
          >
            <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 border border-purple-400/30">
              <Rocket className="h-4.5 w-4.5 text-white" />
            </div>
            <span>MUSK INVESTMENT</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
                  className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* CTA Buttons or User State */}
            <div className="flex items-center gap-4">
              {user?.isLoggedIn ? (
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full pl-3 pr-4 py-1.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center border border-white/20 text-xs font-bold text-white">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-gray-200">{user.name}</span>
                  <button
                    id="logout-btn-desktop"
                    onClick={onLogout}
                    title="Log Out"
                    className="text-gray-400 hover:text-red-400 p-1 rounded-full transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    id="login-btn-desktop"
                    onClick={() => onOpenAuth('login')}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2 px-4"
                  >
                    Login
                  </button>
                  <button
                    id="register-btn-desktop"
                    onClick={() => onOpenAuth('register')}
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/10 active:scale-95 transition-all"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none transition-all"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/5 bg-[#030310]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
                      className="text-base font-medium text-gray-300 hover:text-purple-400 transition-colors py-2 flex items-center justify-between border-b border-white/5"
                    >
                      <span>{item.name}</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </a>
                  ))}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  {user?.isLoggedIn ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center border border-white/20 text-sm font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-200">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        id="logout-btn-mobile"
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-3 text-sm font-semibold text-red-400 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        id="login-btn-mobile"
                        onClick={() => { onOpenAuth('login'); setIsOpen(false); }}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                      >
                        Login
                      </button>
                      <button
                        id="register-btn-mobile"
                        onClick={() => { onOpenAuth('register'); setIsOpen(false); }}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/10 transition-all"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
