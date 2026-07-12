import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Check, X, ShieldCheck, Zap, Layers, Cpu } from 'lucide-react';

export default function About() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="about" className="relative py-24 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        
        {/* Left column: Text info */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono block">
              WHO WE ARE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your trusted partner for digital investment opportunities
            </h2>
          </div>

          <div className="space-y-6 text-gray-300/80 font-light text-base leading-relaxed">
            <p>
              Elon Musk is a technology entrepreneur known for leading innovative companies including Tesla, SpaceX, xAI, Neuralink and X.
            </p>
            <p>
              SpaceX is an aerospace company founded in 2002 that helped pioneer reusable rocket technology and commercial spaceflight.
            </p>
            <p>
              Our platform is inspired by innovation, technology and financial growth.
            </p>
          </div>

          {/* Quick list features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-1 border border-purple-500/20 text-purple-400">
                <Check className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-medium text-gray-200">Autonomous Neural Trading</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-1 border border-purple-500/20 text-purple-400">
                <Check className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-medium text-gray-200">Orbital Risk Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-1 border border-purple-500/20 text-purple-400">
                <Check className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-medium text-gray-200">Deep AI Analytics Integration</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-1 border border-purple-500/20 text-purple-400">
                <Check className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-medium text-gray-200">Direct Smart Contract Yields</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              id="about-read-more-btn"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-all active:scale-95 group"
            >
              <span>Read More</span>
              <ArrowUpRight className="h-4 w-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right column: Image showcase using about_illustration */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 bg-[#09071f]/60 shadow-2xl shadow-purple-500/5 group">
            {/* Ambient image background shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030310] via-transparent to-transparent z-10 opacity-60" />
            
            <img
              src="/src/assets/images/about_illustration_1783848276337.jpg"
              alt="Futuristic Space and Technology Investment Vector"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

      </div>

      {/* "Read More" Detail Modal */}
      <AnimatePresence>
        {showModal && (
          <div id="about-detail-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-500/20 bg-[#09071f] p-8 shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto"
            >
              <button
                id="close-about-modal-btn"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">Company Vision</span>
                  <h3 className="font-display text-2xl font-bold text-white mt-1">Our Inspiration &amp; Ecosystem</h3>
                </div>

                <div className="space-y-4 text-gray-300 font-light text-sm leading-relaxed">
                  <p>
                    The Musk Investment Platform is inspired by the legendary spirit of pioneer tech entrepreneurship. We believe in bridging the gap between average retail investors and high-frontier technology investments like orbital rocketry, brain-computer interfaces, deep AI cores, and electric transport.
                  </p>

                  {/* Visual grid breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
                        <Zap className="h-4 w-4" />
                        <span>Tesla &amp; Power</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Pioneering pure sustainable energy transition, autonomous driving technology, and grid storage scaling.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
                        <Layers className="h-4 w-4" />
                        <span>SpaceX &amp; Starlink</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Multi-planetary colonization strategy paired with orbital global satellite mesh internet constellation systems.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
                        <Cpu className="h-4 w-4" />
                        <span>Neuralink &amp; xAI</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Next-generation brain-machine telepathic interfacing coupled with powerful cognitive artificial intelligence foundations.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>The Platform Core</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        We leverage these technological milestones as visual inspiration to create decentralized, secure, and optimal digital portfolios.
                      </p>
                    </div>
                  </div>

                  <p className="pt-4">
                    Our fundamental mission is offering modern financial growth avenues for tech-forward visionaries. Join a network that believes the future is bright, expansive, and multi-planetary.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    id="about-close-footer-btn"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-sm font-semibold text-white transition-all active:scale-95"
                  >
                    Close Information
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
