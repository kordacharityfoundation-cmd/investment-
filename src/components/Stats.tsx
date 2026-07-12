import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Users, Coins, HeartHandshake } from 'lucide-react';

interface StatProps {
  key?: string;
  label: string;
  target: number;
  decimals?: boolean;
  suffix: string;
  icon: ReactNode;
  subtitle: string;
}

function AnimatedStatCard({ label, target, decimals = false, suffix, icon, subtitle }: StatProps) {

  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000; // 2 seconds
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  const formattedCount = decimals ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <motion.div
      whileHover={{ y: -8, borderColor: 'rgba(168, 85, 247, 0.4)' }}
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#09071f]/40 p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all duration-300"
    >
      {/* Decorative inner corner glow */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />
      
      {/* Icon header */}
      <div className="inline-flex rounded-xl bg-white/5 p-3.5 border border-white/10 text-purple-400 mb-5 sm:mb-6">
        {icon}
      </div>

      {/* Number Value */}
      <div className="space-y-1">
        <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {formattedCount}
          <span className="text-purple-400 font-bold ml-1">{suffix}</span>
        </h3>
        <p className="text-sm sm:text-base font-semibold text-gray-200 mt-2">{label}</p>
        <p className="text-xs sm:text-sm text-gray-500 font-light mt-1">{subtitle}</p>
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const statsData = [
    {
      id: 'active_members',
      label: 'Active Members',
      target: 100,
      suffix: 'K+',
      subtitle: 'Global digital investors registered worldwide',
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: 'total_investments',
      label: 'Total Investments',
      target: 14.9,
      decimals: true,
      suffix: 'M+',
      subtitle: 'Capital securely deployed in technological progress',
      icon: <Coins className="h-6 w-6" />,
    },
    {
      id: 'customer_satisfaction',
      label: 'Customer Satisfaction',
      target: 99,
      suffix: '%',
      subtitle: 'Members highly recommending our premium services',
      icon: <HeartHandshake className="h-6 w-6" />,
    },
  ];

  return (
    <section id="stats" className="relative py-12 bg-[#030310]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {statsData.map((stat) => (
            <AnimatedStatCard
              key={stat.id}
              label={stat.label}
              target={stat.target}
              decimals={stat.decimals}
              suffix={stat.suffix}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
