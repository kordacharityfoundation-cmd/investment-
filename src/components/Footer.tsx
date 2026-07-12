import { MouseEvent } from 'react';
import { Rocket, Mail, Shield, ShieldCheck, Twitter, Github, Linkedin } from 'lucide-react';

interface FooterProps {
  onScrollToSection: (selector: string) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function Footer({ onScrollToSection, onOpenAuth }: FooterProps) {
  const links = [
    { name: 'Home', href: '#home', type: 'scroll' },
    { name: 'About', href: '#about', type: 'scroll' },
    { name: 'Register', tab: 'register', type: 'modal' },
    { name: 'Login', tab: 'login', type: 'modal' },
  ];

  const handleLinkClick = (e: MouseEvent, item: any) => {

    e.preventDefault();
    if (item.type === 'scroll') {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onOpenAuth(item.tab);
    }
  };

  return (
    <footer id="footer" className="bg-[#02020a] border-t border-white/5 py-16 relative overflow-hidden">
      {/* Decorative linear edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative z-10">
        
        {/* Left Column: Brand Bio */}
        <div className="md:col-span-5 space-y-6 text-left">
          <a
            id="footer-logo"
            href="#home"
            onClick={(e) => { e.preventDefault(); onScrollToSection('#home'); }}
            className="flex items-center gap-2.5 font-display text-lg tracking-wider font-extrabold text-white"
          >
            <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 border border-purple-400/30">
              <Rocket className="h-4.5 w-4.5 text-white" />
            </div>
            <span>MUSK INVESTMENT</span>
          </a>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm">
            Exploring technology, spacecraft engineering, neuroscience, sustainable logistics, and digital investment ecosystems inspired by futuristic expansion.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-gray-500">
            <a href="#twitter" onClick={(e) => e.preventDefault()} className="hover:text-purple-400 transition-colors">
              <Twitter className="h-4.5 w-4.5" />
            </a>
            <a href="#linkedin" onClick={(e) => e.preventDefault()} className="hover:text-purple-400 transition-colors">
              <Linkedin className="h-4.5 w-4.5" />
            </a>
            <a href="#github" onClick={(e) => e.preventDefault()} className="hover:text-purple-400 transition-colors">
              <Github className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>

        {/* Center Column: Quick Navigation Links */}
        <div className="md:col-span-3 text-left space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-400 font-mono">
            Navigation Links
          </h4>
          <ul className="space-y-2.5 text-sm">
            {links.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href || '#'}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="text-gray-400 hover:text-white transition-colors duration-150"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Contact info & Security Certificate */}
        <div className="md:col-span-4 text-left space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-purple-400 font-mono">
              Support Center
            </h4>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 max-w-xs">
              <Mail className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Contact Email</p>
                <a
                  id="contact-email-link"
                  href="mailto:support@muskinvestment.com"
                  className="text-sm font-semibold text-white hover:text-purple-400 transition-all"
                >
                  support@muskinvestment.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-mono">
            <ShieldCheck className="h-4 w-4 text-purple-500/50" />
            <span>SSL CERTIFIED • MILITARY-GRADE ESCROW</span>
          </div>
        </div>

      </div>

      {/* Under Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500 relative z-10">
        <p id="copyright-text">
          © 2026 Musk Investment Platform. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-gray-300">Terms of Use</a>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-gray-300">Privacy Policy</a>
          <a href="#disclaimer" onClick={(e) => e.preventDefault()} className="hover:text-gray-300">Disclaimer</a>
        </div>
      </div>
    </footer>
  );
}
