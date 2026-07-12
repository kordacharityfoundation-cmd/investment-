import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserState } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'login' | 'register';
  onAuthSuccess: (user: UserState) => void;
}

export default function AuthModal({ isOpen, onClose, initialTab, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Synchronize activeTab when modal is re-opened with a specific tab
  React.useEffect(() => {
    setActiveTab(initialTab);
    setError('');
    setSuccess(false);
  }, [initialTab, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (activeTab === 'register' && !name) {
      setError('Please provide your full name.');
      return;
    }

    setLoading(true);

    // Simulate network delay for futuristic feel
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      const mockUser: UserState = {
        isLoggedIn: true,
        name: activeTab === 'register' ? name : email.split('@')[0].toUpperCase(),
        email: email,
        avatarSeed: activeTab === 'register' ? name : 'guest_investor'
      };

      setTimeout(() => {
        onAuthSuccess(mockUser);
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setSuccess(false);
      }, 1500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id="auth-modal-box"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-purple-500/20 bg-[#09071f]/95 p-8 shadow-2xl shadow-purple-500/5 backdrop-blur-xl"
          >
            {/* Ambient background glow inside modal */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-sm text-purple-200/60 mt-1">
                {activeTab === 'login' ? 'Access your futuristic investment portal' : 'Join the frontier of innovative investments'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 mb-6">
              <button
                id="login-tab-btn"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                id="register-tab-btn"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* Success State */}
            {success ? (
              <motion.div
                id="auth-success-alert"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="rounded-full bg-purple-500/10 p-4 border border-purple-500/20 mb-4 glow-purple">
                  <CheckCircle2 className="h-10 w-10 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Authentication Successful</h4>
                <p className="text-sm text-gray-400 mt-2">
                  {activeTab === 'login' ? 'Synchronizing neural nodes...' : 'Setting up your investment account...'}
                </p>
              </motion.div>
            ) : (
              /* Auth Form */
              <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    id="auth-error-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/75">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="register-name-input"
                        type="text"
                        placeholder="Elon Musk"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/75">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="auth-email-input"
                      type="email"
                      placeholder="investor@muskinvestment.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/75">Password</label>
                    {activeTab === 'login' && (
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('Demo link: please contact support for password recovery.'); }} className="text-xs text-purple-400 hover:underline">Forgot?</a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="auth-password-input"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying Account...
                    </span>
                  ) : (
                    activeTab === 'login' ? 'Sign In to Dashboard' : 'Create Account Now'
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  By continuing, you agree to our terms of digital investment services.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
