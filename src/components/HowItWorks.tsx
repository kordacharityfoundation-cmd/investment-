import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { UserPlus, ShieldCheck, PieChart, LineChart, ChevronRight } from 'lucide-react';
import { HowItWorksStep } from '../types';

export default function HowItWorks() {
  const steps: (HowItWorksStep & { icon: ReactNode })[] = [

    {
      id: 'step_1',
      stepNumber: 1,
      title: 'Create Account',
      description: 'Register your account using your personal information.',
      icon: <UserPlus className="h-6 w-6 text-purple-400" />,
    },
    {
      id: 'step_2',
      stepNumber: 2,
      title: 'Verify Profile',
      description: 'Complete your account profile.',
      icon: <ShieldCheck className="h-6 w-6 text-indigo-400" />,
    },
    {
      id: 'step_3',
      stepNumber: 3,
      title: 'Choose a Plan',
      description: 'Select an investment package that suits your goals.',
      icon: <PieChart className="h-6 w-6 text-purple-400" />,
    },
    {
      id: 'step_4',
      stepNumber: 4,
      title: 'Track Progress',
      description: 'Monitor your activity through your personal dashboard.',
      icon: <LineChart className="h-6 w-6 text-emerald-400" />,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Background soft light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono block">
            CHRONOLOGICAL PATHWAY
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-gray-400 font-light">
            Start your investment journey in four simple, highly secure technological phases.
          </p>
        </div>

        {/* Steps Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Chronological connecting line behind items (desktop only) */}
          <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-purple-500/10 via-indigo-500/30 to-emerald-500/10 pointer-events-none z-0" />

          {steps.map((step, idx) => {
            return (
              <motion.div
                key={step.id}
                id={`step-card-${step.stepNumber}`}
                whileHover={{ scale: 1.02 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Icon Circle */}
                <div className="relative mb-6">
                  {/* Step index overlay */}
                  <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-purple-600 border border-purple-400/40 text-[10px] font-mono font-bold text-white flex items-center justify-center shadow-lg">
                    {step.stepNumber}
                  </span>

                  <div className="h-16 w-16 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-purple-500/40 flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed px-2">
                    {step.description}
                  </p>
                </div>

                {/* Mobile indicators (desktop only arrows as divider helper) */}
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-[36px] -right-4 translate-x-1/2 z-20 h-5 w-5 items-center justify-center text-gray-600 animate-pulse">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
