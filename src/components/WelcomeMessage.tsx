import { motion } from 'motion/react';
import { Quote, Sparkles, Award, Shield } from 'lucide-react';

export default function WelcomeMessage() {
  return (
    <section id="welcome-message" className="relative py-20 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Decorative gradient sphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          id="investor-message-card"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl p-8 md:p-14 border border-purple-500/15 bg-gradient-to-br from-purple-500/[0.02] via-[#09071f]/50 to-indigo-500/[0.02] shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Ambient border top indicator */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

          {/* Icon Overlay */}
          <div className="absolute top-6 right-8 text-purple-500/5 pointer-events-none">
            <Quote className="h-32 w-32 rotate-180" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            
            {/* Left Column: Vision Icons & Heading */}
            <div className="space-y-4 max-w-sm text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 font-mono text-[10px] uppercase tracking-wider font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Investor Address
              </div>
              <h3 className="font-display text-2xl md:text-3.5xl font-extrabold text-white tracking-tight leading-tight">
                A Message To Our Investors
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Platform alignment statement from our core digital advisory board, active for fiscal year 2026.
              </p>
            </div>

            {/* Right Column: Address Quote Content */}
            <div className="md:flex-1 max-w-xl text-left space-y-6">
              <p className="text-base md:text-lg text-gray-200/90 font-light leading-relaxed italic">
                "Welcome to our growing community. We are committed to providing a professional experience, transparent operations, and a user-friendly platform designed for members who value innovation and financial growth."
              </p>
              
              <div className="flex items-center gap-4 pt-2">
                {/* Simulated Authority Stamp */}
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">Decentralized Escrow Council</h4>
                  <p className="text-xs text-purple-400 font-mono">MUSK PLATFORM TRUST MATRIX</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
