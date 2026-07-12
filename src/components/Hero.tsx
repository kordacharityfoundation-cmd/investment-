import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Play, Rocket, Shield, Cpu } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (tab: 'login' | 'register') => void;
  onScrollToSection: (selector: string) => void;
}

export default function Hero({ onOpenAuth, onScrollToSection }: HeroProps) {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-[#030310]"
    >
      {/* Background Matrix of Stars & Glowing Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,5,36,0)_0%,#030310_80%)]" />
        
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* Text Area */}
        <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-left">
          {/* Main Title */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
            >
              Welcome to the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 drop-shadow-sm">
                Elon Musk
              </span>{' '}
              Investment Program
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-gray-300/80 font-light leading-relaxed max-w-xl"
            >
              Explore innovation, technology, and investment opportunities inspired by the vision of one of the world's most influential entrepreneurs.
            </motion.p>
          </div>

          {/* Interactive stats overlay */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2"
          >
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Secured Node</p>
                <p className="text-sm font-semibold text-white">Full Encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
              <Cpu className="h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Auto-Trading</p>
                <p className="text-sm font-semibold text-white">Neural Processing</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              id="hero-register-btn"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/25 transition-all duration-250 active:scale-95 group"
            >
              <span>Register</span>
              <ArrowRight className="h-5 w-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-signup-btn"
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-7 py-4 text-base font-semibold text-white transition-all duration-250 active:scale-95"
            >
              <span>Sign Up</span>
            </button>
          </motion.div>
        </div>

        {/* Image Area - Showcase the generated hero_network image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center w-full"
        >
          {/* Holographic Framing */}
          <div className="relative w-full max-w-[450px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-square rounded-2xl overflow-hidden border border-purple-500/30 p-1 bg-gradient-to-tr from-purple-500/20 via-transparent to-indigo-500/20 shadow-2xl shadow-purple-500/10">
            {/* Hologram Overlay Elements */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono font-medium tracking-widest text-purple-300">
              NODE: ACTIVE
            </div>
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-mono font-medium tracking-widest text-blue-300">
              TESLA ROADSTER NODE
            </div>

            {/* Simulated target scan reticle */}
            <div className="absolute inset-4 border border-dashed border-white/5 pointer-events-none rounded-lg" />
            
            <img
              src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
              alt="Futuristic Tesla sports car on a dark neon grid"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
            
            {/* Ambient scanning light */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse pointer-events-none" />
          </div>

          {/* Decorative surrounding nodes for a deep tech feel */}
          <div className="hidden sm:flex absolute -top-6 -left-6 h-12 w-12 rounded-full border border-white/5 items-center justify-center backdrop-blur-md bg-white/[0.01] text-[10px] font-mono text-gray-500">
            01
          </div>
          <div className="hidden sm:flex absolute -bottom-6 -right-6 h-12 w-12 rounded-full border border-white/5 items-center justify-center backdrop-blur-md bg-white/[0.01] text-[10px] font-mono text-gray-500">
            02
          </div>
        </motion.div>

      </div>
    </section>
  );
}
