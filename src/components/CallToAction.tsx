import { motion } from 'motion/react';
import { ArrowRight, LogIn } from 'lucide-react';

interface CTAProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function CallToAction({ onOpenAuth }: CTAProps) {
  return (
    <section id="cta" className="relative py-28 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Absolute glow balls */}
      <div className="absolute top-1/2 left-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-8">
        
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono block">
            ONBOARDING PORTAL
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            Ready To Get Started?
          </h2>
          <p className="text-base sm:text-lg text-gray-300/80 font-light max-w-xl mx-auto leading-relaxed">
            Join our community today and take the first step toward exploring new opportunities.
          </p>
        </div>

        {/* Dynamic Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            id="cta-register-btn"
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/20 active:scale-95 transition-all duration-200 group"
          >
            <span>Register Account</span>
            <ArrowRight className="h-5 w-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            id="cta-login-btn"
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-8 py-4 text-base font-semibold text-white transition-all duration-200 active:scale-95"
          >
            <LogIn className="h-4.5 w-4.5 text-gray-400" />
            <span>Login</span>
          </button>
        </div>

        {/* Security / Quality stamp */}
        <p className="text-xs text-gray-500 font-mono">
          SECURE ENCRYPTED VERIFICATION NODE • ZERO PLATFORM ESCROW FEE
        </p>

      </div>
    </section>
  );
}
