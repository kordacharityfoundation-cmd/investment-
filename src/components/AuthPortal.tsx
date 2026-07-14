import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Star, ArrowRight
} from 'lucide-react';
import { UserState } from '../types';

export type AuthView = 'login' | 'register' | 'forgot' | 'verify' | 'success';

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'login' | 'register';
  onAuthSuccess: (user: UserState) => void;
}

export default function AuthPortal({ isOpen, onClose, initialView, onAuthSuccess }: AuthPortalProps) {
  const [view, setView] = useState<AuthView>('login');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Sync initial view when opening
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setSuccessMsg('');
      setLoading(false);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // Form Validation and submission handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      const savedUsersRaw = localStorage.getItem('musk_users');
      let usersList = [];
      if (savedUsersRaw) {
        try {
          usersList = JSON.parse(savedUsersRaw);
        } catch (err) {
          usersList = [];
        }
      }

      const userFound = usersList.find((u: any) => u.email.trim().toLowerCase() === trimmedEmail);
      if (!userFound) {
        setError('This email address is not registered on our gateway. Please register first.');
        return;
      }

      if (userFound.status === 'Suspended') {
        setError('Your investor account has been suspended by our compliance board. Access denied.');
        return;
      }

      const isValidPassword = !userFound.password || userFound.password.trim() === trimmedPassword;
      if (!isValidPassword) {
        setError('Invalid compliance password signature. Please verify your credentials.');
        return;
      }

      const loggedUser: UserState = {
        isLoggedIn: true,
        name: userFound.name,
        email: userFound.email,
        avatarSeed: userFound.name.toUpperCase()
      };
      
      onAuthSuccess(loggedUser);
      onClose();
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName || !regPhone || !regAddress || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const savedUsersRaw = localStorage.getItem('musk_users');
      let currentUsers = [];
      if (savedUsersRaw) {
        try {
          currentUsers = JSON.parse(savedUsersRaw);
        } catch (err) {
          currentUsers = [];
        }
      }

      const exists = currentUsers.some((u: any) => u.email.toLowerCase() === regEmail.toLowerCase());
      if (exists) {
        setLoading(false);
        setError('This email address is already registered on our gateway.');
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const referralCode = searchParams.get('ref') || '';

      const isFirstUser = currentUsers.length === 0;

      const newUser = {
        id: `user-${Date.now()}`,
        name: regName,
        email: regEmail,
        phone: regPhone,
        address: regAddress,
        status: 'Active' as const,
        dateCreated: new Date().toISOString().substring(0, 10),
        password: regPassword,
        referredBy: referralCode,
        role: isFirstUser ? 'admin' : 'user',
        isAdmin: isFirstUser ? true : false
      };

      currentUsers.push(newUser);
      localStorage.setItem('musk_users', JSON.stringify(currentUsers));

      setLoading(false);
      // Go to email verification screen as requested
      setView('verify');
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Password reset instructions have been sent to your email address.');
    }, 1200);
  };

  const handleResendVerification = () => {
    setError('');
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setSuccessMsg('Verification email has been resent successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  return (
    <div id="auth-portal-root" className="fixed inset-0 z-50 overflow-y-auto bg-[#030310] md:bg-black/80 backdrop-blur-md flex items-center justify-center">
      
      {/* Background grids / glow effects - Mobile-First Layout */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#09071f_1px,transparent_1px),linear-gradient(to_bottom,#09071f_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      </div>

      {/* Main card - Designed Mobile-First (Full screen on mobile, elegant card on desktop) */}
      <div className="relative z-10 w-full min-h-screen md:min-h-0 md:max-w-lg md:rounded-2xl border-0 md:border border-purple-500/20 bg-[#030310] md:bg-[#09071f]/95 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl flex flex-col justify-center">
        
        {/* Close Button - Easily touchable on mobile (minimum 44px) */}
        <button
          id="portal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center z-50"
          aria-label="Close Portal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Brand Banner at the top for mobile layout context */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-300 font-bold">Secure Access Node</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ==================== LOGIN VIEW ==================== */}
          {view === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  Login to access your dashboard.
                </p>
              </div>



              {error && (
                <div id="login-error" className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder="investor@muskinvestment.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                    <button
                      id="login-toggle-password-btn"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="login-remember-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/30"
                    />
                    <span className="text-xs text-gray-400">Remember me</span>
                  </label>
                  <button
                    id="login-forgot-btn"
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all min-h-[48px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="border-t border-white/5 pt-6 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button
                    id="login-to-register-btn"
                    onClick={() => { setView('register'); setError(''); }}
                    className="font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    Create New Account
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ==================== REGISTRATION VIEW ==================== */}
          {view === 'register' && (
            <motion.div
              key="register-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center md:text-left space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Create Your Investment Account
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  Join our growing community and start your journey today.
                </p>
              </div>

              {error && (
                <div id="register-error" className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form id="register-form" onSubmit={handleRegister} className="space-y-4 max-h-[55vh] md:max-h-none overflow-y-auto pr-1">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="reg-name-input"
                      type="text"
                      required
                      placeholder="Elon Musk"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="reg-phone-input"
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Residential Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="reg-address-input"
                      type="text"
                      required
                      placeholder="1 Enterprise Way, Starbase, TX"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <input
                      id="reg-email-input"
                      type="email"
                      required
                      placeholder="investor@muskinvestment.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        id="reg-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                      />
                      <button
                        id="reg-toggle-password-btn"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        id="reg-confirm-password-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-12 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                      />
                      <button
                        id="reg-toggle-confirm-password-btn"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  id="reg-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all min-h-[48px]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="border-t border-white/5 pt-4 text-center">
                <p className="text-sm text-gray-400">
                  Already Have An Account?{' '}
                  <button
                    id="reg-to-login-btn"
                    onClick={() => { setView('login'); setError(''); }}
                    className="font-semibold text-purple-400 hover:text-purple-300 hover:underline font-display"
                  >
                    Login
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* ==================== FORGOT PASSWORD VIEW ==================== */}
          {view === 'forgot' && (
            <motion.div
              key="forgot-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <button
                id="forgot-back-btn"
                onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>

              <div className="space-y-2 text-center md:text-left">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Recover Password
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  Input your registered email to receive verification credentials.
                </p>
              </div>

              {error && (
                <div id="forgot-error" className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg ? (
                <motion.div
                  id="forgot-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 text-center space-y-4"
                >
                  <div className="inline-flex rounded-full bg-purple-500/10 p-3 text-purple-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Reset Instructions Dispatched</h3>
                  <p className="text-sm text-gray-300/80 leading-relaxed">
                    {successMsg}
                  </p>
                  <button
                    id="forgot-success-back-btn"
                    onClick={() => { setView('login'); setSuccessMsg(''); }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 py-3 text-sm font-semibold text-white transition-all"
                  >
                    Return to Login
                  </button>
                </motion.div>
              ) : (
                <form id="forgot-form" onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                      <input
                        id="forgot-email-input"
                        type="email"
                        required
                        placeholder="investor@muskinvestment.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all min-h-[48px]"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending Link...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {/* ==================== EMAIL VERIFICATION VIEW ==================== */}
          {view === 'verify' && (
            <motion.div
              key="verify-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex rounded-full bg-purple-500/10 p-4 border border-purple-500/20 glow-purple">
                <CheckCircle2 className="h-10 w-10 text-purple-400" />
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Verify Your Identity
                </h2>
                <p className="text-sm text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  Your account has been created successfully.
                </p>
                <p className="text-sm text-gray-400 font-light leading-relaxed px-4 pt-2">
                  Please verify your email address before accessing all platform features. We sent a verification node token link to <strong className="text-white font-medium">{regEmail || 'your email'}</strong>.
                </p>
              </div>

              {successMsg && (
                <div id="verify-success-notif" className="flex items-center gap-2 rounded-xl bg-purple-500/10 p-3.5 border border-purple-500/20 text-xs text-purple-300 justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <button
                  id="verify-continue-btn"
                  onClick={() => setView('success')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition-all min-h-[48px]"
                >
                  <span>Continue To Success Page</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  id="verify-resend-btn"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-400 ${resending ? 'animate-spin text-purple-400' : ''}`} />
                  <span>{resending ? 'Resending Token Link...' : 'Resend Verification Email'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Can't find the email? Check your spam/junk folder or contact investor node support.
              </p>
            </motion.div>
          )}

          {/* ==================== ACCOUNT SUCCESS VIEW ==================== */}
          {view === 'success' && (
            <motion.div
              key="success-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex rounded-full bg-purple-500/10 p-4 border border-purple-500/20 glow-purple relative">
                <Star className="h-10 w-10 text-purple-400" />
                {/* Micro-sparkles */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-500 rounded-full animate-ping" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">Node Onboard Complete</span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                  Welcome To The Community
                </h2>
                <p className="text-sm text-gray-300/85 font-light leading-relaxed px-4 pt-2">
                  Your account has been created successfully. You can now login and access your dashboard to configure smart investment plans.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  id="success-login-btn"
                  onClick={() => {
                    // Set default credential to login view for smooth UX
                    setLoginEmail(regEmail);
                    setView('login');
                    setError('');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/20 transition-all min-h-[48px]"
                >
                  <span>Login Now</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  id="success-home-btn"
                  onClick={onClose}
                  className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-sm font-semibold text-white transition-all min-h-[44px]"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
