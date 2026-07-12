import { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Coins, ShieldCheck, ArrowRight, HelpCircle, Check, Sparkles } from 'lucide-react';
import { InvestmentPlan, UserState } from '../types';

interface PlansProps {
  user: UserState | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function Plans({ user, onOpenAuth }: PlansProps) {
  const plans: InvestmentPlan[] = [
    {
      id: 'falcon',
      name: 'Falcon Core Plan',
      apr: 8.0,
      minDeposit: 1000,
      duration: 30,
      description: 'An entry-level package perfect for exploring automated fintech nodes. Short term commitment with consistent low-risk daily yields.',
      badge: 'Popular',
    },
    {
      id: 'neural',
      name: 'Neural Nexus Plan',
      apr: 15.0,
      minDeposit: 10000,
      duration: 90,
      description: 'Advanced automated portfolio allocation managed by neural network models. Balanced optimization for mid-term technology growth.',
      badge: 'Visionary',
    },
    {
      id: 'starship',
      name: 'Starship Venture Plan',
      apr: 24.0,
      minDeposit: 50000,
      duration: 180,
      description: 'Ultra-high-net-worth orbital investment package directed towards long-term foundational assets. Highest direct smart contract yields.',
      badge: 'Orbital Yield',
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan>(plans[1]); // Default to Neural
  const [investmentAmount, setInvestmentAmount] = useState<number>(15000);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investSuccess, setInvestSuccess] = useState(false);

  // Validate and sync investment amount if changing plan
  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    if (investmentAmount < plan.minDeposit) {
      setInvestmentAmount(plan.minDeposit);
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {

    const val = Number(e.target.value);
    setInvestmentAmount(val);
  };

  // Calculations
  const calculatedDailyReturn = (investmentAmount * (selectedPlan.apr / 100)) / 365;
  const calculatedTotalReturn = calculatedDailyReturn * selectedPlan.duration;
  const totalPayout = investmentAmount + calculatedTotalReturn;

  const handleInvestSubmit = () => {
    if (!user?.isLoggedIn) {
      onOpenAuth('register');
      return;
    }

    setIsInvesting(true);
    setTimeout(() => {
      setIsInvesting(false);
      setInvestSuccess(true);
      setTimeout(() => {
        setInvestSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <section id="plans" className="relative py-24 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Background neon orb */}
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono block">
            INVESTMENT OPPORTUNITIES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Select Your Futuristic Growth Route
          </h2>
          <p className="text-base text-gray-400 font-light">
            Each plan is engineered with varying algorithmic priorities, duration nodes, and autonomous risk management ratios.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <motion.div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                whileHover={{ y: -5 }}
                className={`relative rounded-2xl p-5 sm:p-8 border backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/[0.04] shadow-2xl shadow-purple-500/10'
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                }`}
                onClick={() => handlePlanSelect(plan)}
                style={{ cursor: 'pointer' }}
              >
                {/* Badge */}
                <div className="absolute top-6 right-6">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    isSelected ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-white/5'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Duration Node: {plan.duration} Days</p>
                  </div>

                  {/* Pricing Rate */}
                  <div>
                    <span className="text-5xl font-extrabold text-white tracking-tight">{plan.apr}%</span>
                    <span className="text-sm font-semibold text-purple-400 ml-1">APR Yield</span>
                  </div>

                  <p className="text-sm text-gray-400 font-light leading-relaxed">{plan.description}</p>

                  <div className="border-t border-white/5 pt-6 space-y-3 text-xs text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Minimum Deposit</span>
                      <span className="font-semibold text-white">${plan.minDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Algorithmic Priority</span>
                      <span className="font-semibold text-white">{plan.id === 'falcon' ? 'Standard' : plan.id === 'neural' ? 'High Core' : 'Maximum Dual-Node'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Security Standard</span>
                      <span className="font-semibold text-purple-400">Escrow Protected</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    id={`plan-select-btn-${plan.id}`}
                    onClick={(e) => { e.stopPropagation(); handlePlanSelect(plan); }}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{isSelected ? 'Active Plan Selected' : 'Configure This Plan'}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Earnings Calculator */}
        <div id="calculator-section" className="rounded-2xl border border-white/5 bg-[#09071f]/50 p-5 sm:p-8 md:p-10 backdrop-blur-md relative overflow-hidden">
          {/* Ambient light overlay */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Slider */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5 uppercase">
                  <Sparkles className="h-4 w-4" /> Live ROI Simulator
                </span>
                <h3 className="text-2xl font-bold text-white">Project Your Returns Instantly</h3>
                <p className="text-sm text-gray-400 font-light">
                  Drag the slider or adjust your initial stake size to simulate earnings based on the active <strong className="text-white font-medium">{selectedPlan.name}</strong> rate.
                </p>
              </div>

              {/* Slider Input */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-400">Simulated Principal</span>
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-base font-semibold text-white">
                    <span className="text-purple-400 text-sm">$</span>
                    <input
                      id="stake-manual-input"
                      type="number"
                      value={investmentAmount}
                      min={selectedPlan.minDeposit}
                      max={250000}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 250000) val = 250000;
                        setInvestmentAmount(val);
                      }}
                      className="bg-transparent text-white font-semibold focus:outline-none w-24 text-right"
                    />
                  </div>
                </div>

                <input
                  id="stake-slider"
                  type="range"
                  min={selectedPlan.minDeposit}
                  max={250000}
                  step={selectedPlan.id === 'falcon' ? 100 : selectedPlan.id === 'neural' ? 500 : 1000}
                  value={investmentAmount}
                  onChange={handleAmountChange}
                  className="w-full h-1.5 rounded-lg bg-gray-800 appearance-none cursor-pointer accent-purple-500"
                />

                <div className="flex justify-between text-xs font-mono text-gray-500">
                  <span>Min: ${selectedPlan.minDeposit.toLocaleString()}</span>
                  <span>Max: $250,000</span>
                </div>
              </div>
            </div>

            {/* Simulated Calculations output */}
            <div className="lg:col-span-5 p-6 rounded-xl bg-purple-950/20 border border-purple-500/15 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-gray-400">Active Rate Node</span>
                  <span className="text-sm font-bold text-purple-400 font-mono">{selectedPlan.apr}% APR</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-gray-400">Duration Commitment</span>
                  <span className="text-sm font-semibold text-white font-mono">{selectedPlan.duration} Days</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-xs text-gray-400">Calculated Daily Yield</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">+${calculatedDailyReturn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-400">Net Accumulated Return</span>
                  <span className="text-lg font-extrabold text-white font-mono">+${calculatedTotalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Final Return Block */}
              <div className="rounded-xl bg-black/40 p-4 border border-white/5 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Total Account Maturity Balance</p>
                <p className="text-3xl font-extrabold text-white tracking-tight mt-1 font-mono">
                  ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <button
                id="invest-submit-btn"
                onClick={handleInvestSubmit}
                disabled={isInvesting || investmentAmount < selectedPlan.minDeposit}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/10 active:scale-95 transition-all disabled:opacity-50"
              >
                {isInvesting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Initializing Node smart escrow...
                  </span>
                ) : investSuccess ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Check className="h-4.5 w-4.5" /> Simulation Investment Deposited!
                  </span>
                ) : (
                  <>
                    <span>{user?.isLoggedIn ? `Invest $${investmentAmount.toLocaleString()} Now` : 'Register Account to Invest'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
