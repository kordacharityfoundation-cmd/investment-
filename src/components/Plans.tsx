import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Coins, ShieldCheck, ArrowRight, Check, Sparkles, 
  Wallet, Copy, Upload, CreditCard, ChevronRight, Calendar, 
  Clock, AlertTriangle, CheckCircle2, History, X, Info, ChevronDown
} from 'lucide-react';
import { InvestmentPlan, UserState } from '../types';

interface PlansProps {
  user: UserState | null;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onSelectPlan?: (plan: InvestmentPlan) => void;
}

export interface DepositTransaction {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  referenceNo: string;
  transactionId?: string;
  notes?: string;
  screenshotUrl?: string;
}

export default function Plans({ user, onOpenAuth, onSelectPlan }: PlansProps) {
  // Loaded dynamic parameters
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>({});
  const [qrConfig, setQrConfig] = useState<any>({});

  // Initialize and load custom deposits list and dynamic configs from Supabase
  useEffect(() => {
    const loadConfigAndPlans = async () => {
      try {
        // Fetch plans
        const { data: plansData } = await supabase
          .from('investment_plans')
          .select('*')
          .order('created_at', { ascending: true });
        if (plansData && plansData.length > 0) {
          setInvestmentPlans(plansData.map(p => ({
            id: p.id,
            name: p.name,
            apr: Number(p.apr),
            minDeposit: Number(p.min_deposit),
            duration: Number(p.duration),
            description: p.description,
            badge: p.badge
          })));
        } else {
          setInvestmentPlans(DEFAULT_PLANS_SEED);
        }

        // Fetch payment config
        const { data: pay } = await supabase
          .from('payment_config')
          .select('*')
          .eq('id', 1)
          .single();
        if (pay) {
          setPaymentConfig({
            bankName: pay.bank_name,
            accountName: pay.account_name,
            accountNumber: pay.account_number,
            routingNumber: pay.routing_number,
            btcAddress: pay.btc_address,
            usdtTrcAddress: pay.usdt_trc_address,
            usdtErcAddress: pay.usdt_erc_address,
            showBank: true,
            showBtc: true,
            showTrc: true,
            showErc: true
          });
        }

        // Fetch QR config
        const { data: qr } = await supabase
          .from('qr_config')
          .select('*')
          .eq('id', 1)
          .single();
        if (qr) {
          setQrConfig({
            btcQr: qr.btc_qr,
            usdtTrcQr: qr.usdt_trc_qr,
            usdtErcQr: qr.usdt_erc_qr,
            bankQr: qr.bank_qr
          });
        }
      } catch (err) {
        console.error("Error loading config/plans in Plans:", err);
      }
    };

    loadConfigAndPlans();
  }, []);

  const DEFAULT_PLANS_SEED: InvestmentPlan[] = [
    {
      id: 'plan-1',
      name: 'Boring Venture Node',
      apr: 8.5,
      minDeposit: 1000,
      duration: 30,
      description: 'Entry-level short commitment plan exploring automated high-yield tunneling & transit routing technology.',
      badge: 'Starter',
    },
    {
      id: 'plan-2',
      name: 'Optimus Kinetic Core',
      apr: 10.0,
      minDeposit: 2000,
      duration: 45,
      description: 'Harness autonomous robotic fleet energy grid allocations for robust daily compounded yields.',
      badge: 'Robot Tech',
    },
    {
      id: 'plan-3',
      name: 'Gigafactory Battery Power',
      apr: 12.5,
      minDeposit: 3000,
      duration: 60,
      description: 'Sustainable battery energy storage growth backed by global clean-energy Gigapack battery nodes.',
      badge: 'Eco Yield',
    },
    {
      id: 'plan-4',
      name: 'Hyperloop Pneumatic Ring',
      apr: 14.0,
      minDeposit: 4000,
      duration: 60,
      description: 'High velocity pneumatic pressure transit nodes for highly consistent short-term compounding.',
      badge: 'Rapid Velocity',
    },
    {
      id: 'plan-5',
      name: 'Falcon Heavy Rocket Thrust',
      apr: 16.5,
      minDeposit: 5000,
      duration: 90,
      description: 'Triple-booster rocket asset allocations optimized for steady orbital aerospace launch equity.',
      badge: 'Launch Peak',
    },
    {
      id: 'plan-6',
      name: 'Starlink Constellation Nexus',
      apr: 19.0,
      minDeposit: 10000,
      duration: 120,
      description: 'Low Earth Orbit orbital satellite global mesh networking yield, mapping continuous internet connectivity return.',
      badge: 'Orbital Grid',
    },
    {
      id: 'plan-7',
      name: 'Neuralink Synaptic Bridge',
      apr: 22.0,
      minDeposit: 20000,
      duration: 180,
      description: 'State-of-the-art cybernetic bio-digital brain interface technology nodes yielding peak technical dividends.',
      badge: 'Brain Machine',
    },
    {
      id: 'plan-8',
      name: 'Tesla Roadster Lunar Mode',
      apr: 25.5,
      minDeposit: 30000,
      duration: 180,
      description: 'Supercharged performance torque luxury electric sports car asset pools. High speed smart acceleration.',
      badge: 'Torque Spec',
    },
    {
      id: 'plan-9',
      name: 'xAI Colossus GPU Mesh',
      apr: 28.0,
      minDeposit: 40000,
      duration: 270,
      description: 'Ultra-scale high-performance intelligence compute model cluster sharing premium GPU computing returns.',
      badge: 'Super Compute',
    },
    {
      id: 'plan-10',
      name: 'Starship Interstellar Flight',
      apr: 32.5,
      minDeposit: 50000,
      duration: 365,
      description: 'Our absolute flagship deep space transport allocation for maximum long term tech compounding yields.',
      badge: 'Deep Space',
    }
  ];

  // Reconstruct dynamic payment methods
  const activeBtcAddress = paymentConfig.btcAddress || '1MuSk77vXz8S8VPrAdAr8S73v48yPnC9E9';
  const activeUsdtTrc = paymentConfig.usdtTrcAddress || 'TX9MuSkTRC20PlAtForMe198473210vY9s';
  const activeUsdtErc = paymentConfig.usdtErcAddress || '0x9a7bMuSkERC20F000de739D7Fbe41983021';
  const activeBankDetails = `Beneficiary: ${paymentConfig.accountName || 'Musk Investment Corp'}\nBank Name: ${paymentConfig.bankName || 'Starbase Galactic Credit Union'}\nAccount No: ${paymentConfig.accountNumber || '184-7392-1029'}\nRouting No: ${paymentConfig.routingNumber || '021000021'}\nReference No: [Refer to your Reference No]`;

  const paymentMethods = [
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      type: 'Crypto',
      address: activeBtcAddress,
      placeholder: 'Send exactly the BTC equivalent value to this secure wallet.',
      icon: '₿',
      qr: qrConfig.btcQr
    },
    {
      id: 'usdt-trc20',
      name: 'USDT (TRC20)',
      type: 'Crypto',
      address: activeUsdtTrc,
      placeholder: 'Ensure your network is set to TRC20 / Tron Network when sending funds.',
      icon: '₮',
      qr: qrConfig.usdtTrcQr
    },
    {
      id: 'usdt-erc20',
      name: 'USDT (ERC20)',
      type: 'Crypto',
      address: activeUsdtErc,
      placeholder: 'Ensure your network is set to ERC20 / Ethereum Network when sending funds.',
      icon: '♦',
      qr: qrConfig.usdtErcQr
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      type: 'Fiat',
      address: activeBankDetails,
      placeholder: 'Initiate a standard wire transfer or ACH. Enter reference code in description.',
      icon: '🏦',
      qr: qrConfig.bankQr
    }
  ];

  interface PaymentMethodType {
    id: string;
    name: string;
    type: string;
    address: string;
    placeholder: string;
    icon: string;
    qr?: string;
  }

  // Active state parameters
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  
  // Deposit Portal Flow state
  const [portalStep, setPortalStep] = useState<'details' | 'payment-method' | 'payment-details' | 'payment-proof' | 'success'>('details');
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState<PaymentMethodType | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState('');
  const [fileDragging, setFileDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and load user deposits list from Supabase
  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      setDeposits([]);
      return;
    }

    const fetchUserDeposits = async () => {
      try {
        const { data: depData } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (depData) {
          setDeposits(depData.map(d => ({
            id: d.id,
            userEmail: d.user_email,
            planId: d.plan_id,
            planName: d.plan_id, // fallback to plan ID, or resolve names dynamically if needed
            amount: Number(d.amount),
            paymentMethod: d.payment_method,
            status: d.status,
            referenceNo: d.reference_no,
            date: new Date(d.created_at).toISOString().replace('T', ' ').substring(0, 16)
          })));
        }
      } catch (err) {
        console.error("Error fetching deposits in Plans component:", err);
      }
    };

    fetchUserDeposits();
  }, [user]);

  // Open modal / initialize portal parameters
  const handleSelectPlan = (plan: InvestmentPlan) => {
    if (!user?.isLoggedIn) {
      onOpenAuth('register');
      return;
    }
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }
    setSelectedPlan(plan);
    setPortalStep('details');
    setChosenPaymentMethod(null);
    setScreenshot(null);
    setTransactionId('');
    setAdditionalNotes('');
    setGeneratedRefNo(`MSK-${Math.floor(10000 + Math.random() * 90000)}-DEP`);
  };

  // Copy address to clipboard helper
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Screenshot Upload Handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragging(true);
  };

  const handleDragLeave = () => {
    setFileDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit payment handler
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !chosenPaymentMethod || !user) return;

    try {
      // 1. Insert deposit row into Supabase deposits table
      const { error: depError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          user_email: user.email.toLowerCase(),
          plan_id: selectedPlan.id,
          amount: selectedPlan.minDeposit,
          payment_method: chosenPaymentMethod.name,
          status: 'Pending',
          reference_no: generatedRefNo,
          transaction_id: transactionId || null,
          notes: additionalNotes || null,
          screenshot_url: screenshot || null
        });

      if (depError) {
        alert(depError.message);
        return;
      }

      // 2. Insert notification row into Supabase notifications table
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          user_email: user.email.toLowerCase(),
          title: 'Deposit Under Verification',
          message: `Your deposit of $${selectedPlan.minDeposit.toLocaleString()} for the ${selectedPlan.name} is currently under administrative verification.`,
          type: 'general'
        });

      // 3. Insert activity log row into Supabase activity_logs table
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          user_email: user.email.toLowerCase(),
          action: `Submitted deposit proof of $${selectedPlan.minDeposit.toLocaleString()} for ${selectedPlan.name}.`,
          type: 'Deposit'
        });

      setPortalStep('success');

      // Refresh deposits list
      const { data: depData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (depData) {
        setDeposits(depData.map(d => ({
          id: d.id,
          userEmail: d.user_email,
          planId: d.plan_id,
          planName: d.plan_id,
          amount: Number(d.amount),
          paymentMethod: d.payment_method,
          status: d.status,
          referenceNo: d.reference_no,
          date: new Date(d.created_at).toISOString().replace('T', ' ').substring(0, 16)
        })));
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting deposit.');
    }
  };

  return (
    <section id="plans" className="relative py-20 bg-[#030310] overflow-hidden border-t border-white/5">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0a24_1px,transparent_1px),linear-gradient(to_bottom,#0c0a24_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Toggle navigation for Plans vs. Personal Deposit History */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10 backdrop-blur-md">
            <button
              id="tab-view-plans-btn"
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all min-h-[40px] ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Investment Plans</span>
            </button>
            <button
              id="tab-view-history-btn"
              onClick={() => {
                if (!user?.isLoggedIn) {
                  onOpenAuth('login');
                } else {
                  setActiveTab('history');
                }
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all min-h-[40px] ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span>My Deposits ({user?.isLoggedIn ? deposits.length : '0'})</span>
            </button>
          </div>
        </div>

        {activeTab === 'plans' ? (
          <>
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono block">
                PREMIUM ASSET TIERS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Investment Plans
              </h2>
              <p className="text-sm sm:text-base text-gray-400 font-light leading-relaxed">
                Choose a plan that matches your financial goals and get started today. Each tier is structurally backed by cutting-edge industrial technology, green battery power arrays, and satellite mesh routers.
              </p>
            </div>

            {/* Plans List - Mobile-first stacked layout, elegant grid on tablet/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-12">
              {investmentPlans.map((plan, idx) => {
                return (
                  <motion.div
                    key={plan.id}
                    id={`investment-card-${plan.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -4, borderColor: 'rgba(168, 85, 247, 0.3)' }}
                    className="relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#09071f]/50 p-5 shadow-xl backdrop-blur-md transition-all duration-300"
                  >
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {plan.badge}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold block uppercase mb-1">
                          Tier 0{idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                          {plan.name}
                        </h3>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Maturity Commitment</p>
                        <p className="text-sm font-semibold text-gray-200">{plan.duration} Days</p>
                      </div>

                      {/* Yield info */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                        <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                          {plan.apr}%
                        </span>
                        <span className="text-[10px] font-semibold text-purple-400 block mt-0.5 uppercase tracking-wider">
                          APR Est. Yield
                        </span>
                      </div>

                      <p className="text-xs text-gray-400/90 font-light leading-relaxed min-h-[48px]">
                        {plan.description}
                      </p>

                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">Req. Principal</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-sm">
                          ${plan.minDeposit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        id={`select-plan-btn-${plan.id}`}
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white/5 hover:bg-purple-600/20 hover:text-white border border-white/10 hover:border-purple-500/30 py-3 text-xs font-bold text-gray-300 transition-all active:scale-[0.98] min-h-[44px]"
                      >
                        <span>Select Plan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          /* ==================== PERSONAL DEPOSIT HISTORY VIEW ==================== */
          <motion.div
            key="history-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
              <div className="text-left space-y-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Deposit History
                </h2>
                <p className="text-sm text-gray-400 font-light">
                  Review and simulate live verification approvals of your smart contract nodes.
                </p>
              </div>
              <button
                id="fund-more-btn"
                onClick={() => setActiveTab('plans')}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/10 flex items-center gap-1.5 min-h-[40px]"
              >
                <span>New Investment Plan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {deposits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center space-y-4 bg-white/[0.01]">
                <Clock className="h-10 w-10 text-gray-500 mx-auto animate-pulse" />
                <p className="text-gray-400 font-light">No deposits matching this account credential found.</p>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="text-sm font-semibold text-purple-400 hover:underline"
                >
                  Configure and fund your first plan now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((dep) => {
                  return (
                    <div
                      key={dep.id}
                      id={`deposit-item-${dep.id}`}
                      className="rounded-xl border border-white/5 bg-[#09071f]/65 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-[#0c0a2a]"
                    >
                      {/* Left: General Info */}
                      <div className="flex items-start gap-3.5 text-left">
                        <div className={`p-2.5 rounded-lg border shrink-0 ${
                          dep.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          dep.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-sm sm:text-base">{dep.planName}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-light">
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-purple-400" /> {dep.date}</span>
                            <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-indigo-400" /> {dep.paymentMethod}</span>
                          </div>
                          <p className="text-[10px] font-mono text-gray-500 mt-1">Ref No: <span className="text-purple-300 font-medium">{dep.referenceNo}</span></p>
                        </div>
                      </div>

                      {/* Middle & Right: Amount, status and simulated admin controllers */}
                      <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 border-t border-white/5 md:border-0 pt-4 md:pt-0">
                        {/* Amount display */}
                        <div className="text-left md:text-right">
                          <p className="text-xs text-gray-500">Maturity Principal</p>
                          <p className="text-lg font-black text-white font-mono">${dep.amount.toLocaleString()}</p>
                        </div>

                        {/* Status Card & simulation button */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          {/* Main Status Pill */}
                          <div className={`rounded-lg px-3.5 py-1.5 border text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 justify-center ${
                            dep.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5' :
                            dep.status === 'Rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-md shadow-red-500/5' :
                            'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/5'
                          }`}>
                            <span className={`h-2 w-2 rounded-full ${
                              dep.status === 'Approved' ? 'bg-emerald-400 animate-pulse' :
                              dep.status === 'Rejected' ? 'bg-red-400' :
                              'bg-amber-400 animate-pulse'
                            }`} />
                            <span>{dep.status}</span>
                          </div>

                          {/* Quick details context */}
                          <p className="text-[10px] text-gray-400 font-light italic max-w-[200px] text-center sm:text-right">
                            {dep.status === 'Pending' && 'Your payment is awaiting review.'}
                            {dep.status === 'Approved' && 'Your payment has been verified successfully.'}
                            {dep.status === 'Rejected' && 'Please review your payment details and try again.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ================================================== */}
      {/* IMMERSIVE INVESTMENT PORTAL AND DEPOSIT FLOW MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {selectedPlan && (
          <div id="deposit-portal-modal" className="fixed inset-0 z-50 overflow-y-auto bg-[#030310]/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
            
            {/* Ambient Background decoration */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
              <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]" />
            </div>

            {/* Modal Body Container - Design strictly optimized for mobile screens first */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full min-h-screen sm:min-h-0 sm:max-w-xl sm:rounded-2xl border-0 sm:border border-purple-500/20 bg-[#06041c] p-5 sm:p-8 shadow-2xl flex flex-col justify-between sm:justify-start"
            >
              
              {/* Header block */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider">
                    Deposit Portal Block
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {portalStep === 'details' && 'Investment Plan Details'}
                    {portalStep === 'payment-method' && 'Fund Your Investment'}
                    {portalStep === 'payment-details' && 'Payment Specifications'}
                    {portalStep === 'payment-proof' && 'Validate Deposit Node'}
                    {portalStep === 'success' && 'Transaction Enqueued'}
                  </h3>
                </div>
                
                {/* Close modal - accessible trigger target size */}
                <button
                  id="close-deposit-portal-btn"
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step indicator breadcrumbs for multi-step navigation */}
              {portalStep !== 'success' && (
                <div className="grid grid-cols-4 gap-1.5 mb-6 text-center text-[10px] font-mono tracking-widest uppercase text-gray-500">
                  <div className={`pb-1 border-b-2 font-bold transition-all ${portalStep === 'details' ? 'border-purple-500 text-purple-300' : 'border-white/5 text-gray-600'}`}>
                    Plan
                  </div>
                  <div className={`pb-1 border-b-2 font-bold transition-all ${portalStep === 'payment-method' ? 'border-purple-500 text-purple-300' : 'border-white/5 text-gray-600'}`}>
                    Method
                  </div>
                  <div className={`pb-1 border-b-2 font-bold transition-all ${portalStep === 'payment-details' || portalStep === 'payment-proof' ? 'border-purple-500 text-purple-300' : 'border-white/5 text-gray-600'}`}>
                    Transfer
                  </div>
                  <div className="pb-1 border-b-2 font-bold border-white/5 text-gray-600">
                    Verify
                  </div>
                </div>
              )}

              {/* Main Step views */}
              <div className="flex-1">
                
                {/* ==================== STEP 1: PLAN DETAILS MODAL ==================== */}
                {portalStep === 'details' && (
                  <div className="space-y-6 text-left">
                    <div className="rounded-xl bg-[#090729] border border-purple-500/10 p-5 space-y-4">
                      <div>
                        <p className="text-[11px] font-mono uppercase text-gray-500">Selected Plan</p>
                        <h4 className="text-xl font-extrabold text-white font-display mt-0.5">{selectedPlan.name}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                        <div>
                          <p className="text-[11px] text-gray-500">Investment Amount</p>
                          <p className="text-base font-black text-emerald-400 font-mono mt-0.5">
                            ${selectedPlan.minDeposit.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500">Date Selected</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                          Account Status
                        </span>
                        <span className="font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                          Active - Node Ready
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl bg-purple-950/20 p-4 border border-purple-500/15 text-xs text-purple-300">
                      <Info className="h-5 w-5 shrink-0 text-purple-400" />
                      <p className="leading-relaxed">
                        By deploying principal into the {selectedPlan.name}, your account is auto-paired with cryptographic node escrow contracts that compound yield over {selectedPlan.duration} Days.
                      </p>
                    </div>

                    <button
                      id="proceed-to-deposit-btn"
                      onClick={() => setPortalStep('payment-method')}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all min-h-[48px]"
                    >
                      <span>Proceed To Deposit</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* ==================== STEP 2: DEPOSIT PAGE (CHOOSE PAYMENT METHOD) ==================== */}
                {portalStep === 'payment-method' && (
                  <div className="space-y-6 text-left">
                    <div className="space-y-1">
                      <p className="text-xs text-purple-400 font-mono tracking-wider uppercase">DEPOSIT FLOW: INGRESS</p>
                      <h4 className="text-xl font-bold text-white">Fund Your Investment</h4>
                      <p className="text-xs text-gray-400 font-light">
                        Choose your preferred payment method and complete your deposit.
                      </p>
                    </div>

                    {/* Payment methods list - touch friendly size targets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentMethods.map((method) => {
                        const isSelected = chosenPaymentMethod?.id === method.id;
                        return (
                          <button
                            key={method.id}
                            id={`payment-option-${method.id}`}
                            onClick={() => setChosenPaymentMethod(method)}
                            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                            } min-h-[64px]`}
                          >
                            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-purple-400 shrink-0">
                              {method.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">{method.name}</p>
                              <p className="text-[10px] text-gray-400">{method.type} Transfer Node</p>
                            </div>
                            <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${isSelected ? 'translate-x-1 text-purple-400' : ''}`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        onClick={() => setPortalStep('details')}
                        className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-xs font-semibold text-white transition-all min-h-[44px]"
                      >
                        Back
                      </button>
                      <button
                        id="proceed-to-details-btn"
                        disabled={!chosenPaymentMethod}
                        onClick={() => setPortalStep('payment-details')}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-semibold text-white shadow-lg disabled:opacity-40 transition-all min-h-[44px]"
                      >
                        <span>Continue to Specifications</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ==================== STEP 3: PAYMENT DETAILS ==================== */}
                {portalStep === 'payment-details' && chosenPaymentMethod && (
                  <div className="space-y-6 text-left">
                    <div className="space-y-1">
                      <p className="text-xs text-purple-400 font-mono tracking-wider uppercase">DEPOSIT FLOW: TRANSFER</p>
                      <h4 className="text-xl font-bold text-white">Payment Details</h4>
                      <p className="text-xs text-gray-400 font-light">
                        Send the exact investment amount to the address below. Ensure accurate information to verify.
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#090729] border border-purple-500/10 p-5 space-y-4">
                      {/* Amount Details */}
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <span className="text-xs text-gray-400">Required Deposit Amount</span>
                        <span className="text-base font-black text-white font-mono">${selectedPlan.minDeposit.toLocaleString()}</span>
                      </div>

                      {/* Interactive Admin-configured QR Code */}
                      <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider">Gateway QR Code Scan</span>
                        <div className="h-32 w-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                          {chosenPaymentMethod.qr && chosenPaymentMethod.qr !== 'default_btc' && chosenPaymentMethod.qr !== 'default_trc' && chosenPaymentMethod.qr !== 'default_erc' && chosenPaymentMethod.qr !== 'default_bank' ? (
                            <img 
                              src={chosenPaymentMethod.qr} 
                              alt={`${chosenPaymentMethod.name} QR Code`} 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=040212&data=${encodeURIComponent(chosenPaymentMethod.address.replace('[Refer to your Reference No]', generatedRefNo))}`}
                              alt={`${chosenPaymentMethod.name} Auto QR Code`} 
                              className="h-full w-full object-contain" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <p className="text-[9px] text-gray-500 italic">Scan with your authenticator or wallet client</p>
                      </div>

                      {/* Wallet address / account specifications */}
                      <div className="space-y-2">
                        <span className="text-xs text-gray-400 block">
                          {chosenPaymentMethod.type === 'Crypto' ? 'Wallet Address' : 'Receiving Account Details'}
                        </span>
                        
                        <div className="relative">
                          <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-12 text-xs font-mono text-gray-300 break-all leading-relaxed whitespace-pre-wrap min-h-[44px]">
                            {chosenPaymentMethod.address.replace('[Refer to your Reference No]', generatedRefNo)}
                          </div>
                          <button
                            id="copy-address-btn"
                            type="button"
                            onClick={() => handleCopyToClipboard(chosenPaymentMethod.address.replace('[Refer to your Reference No]', generatedRefNo))}
                            className="absolute right-2 top-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all min-h-[36px]"
                            title="Copy details"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        {copied && (
                          <motion.span
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-bold text-emerald-400 block text-right"
                          >
                            Copied to clipboard!
                          </motion.span>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-xs text-gray-400">Reference Number</span>
                        <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                          {generatedRefNo}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-amber-300/80 leading-relaxed font-light flex items-start gap-1.5">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{chosenPaymentMethod.placeholder} Make sure to save the payment screenshot image and copy the transaction hash if available.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={() => setPortalStep('payment-method')}
                        className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-xs font-semibold text-white transition-all min-h-[44px]"
                      >
                        Back
                      </button>
                      <button
                        id="proceed-to-proof-btn"
                        onClick={() => setPortalStep('payment-proof')}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-semibold text-white shadow-lg transition-all min-h-[44px]"
                      >
                        <span>I Have Completed Payment</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ==================== STEP 4: PAYMENT PROOF UPLOAD ==================== */}
                {portalStep === 'payment-proof' && chosenPaymentMethod && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-5 text-left">
                    <div className="space-y-1">
                      <p className="text-xs text-purple-400 font-mono tracking-wider uppercase">DEPOSIT FLOW: VALIDATION</p>
                      <h4 className="text-xl font-bold text-white">Payment Proof</h4>
                      <p className="text-xs text-gray-400 font-light">
                        Upload your screenshot or wire receipt to verify your node deposit.
                      </p>
                    </div>

                    {/* Screenshot File upload interface (drag and drop + click input) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Upload Screenshot</label>
                      
                      <div
                        id="screenshot-dropzone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                          fileDragging 
                            ? 'border-purple-400 bg-purple-500/10' 
                            : screenshot 
                              ? 'border-purple-500/40 bg-purple-500/5' 
                              : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                        }`}
                      >
                        <input
                          id="payment-screenshot-file"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleScreenshotChange}
                          className="hidden"
                          required={!screenshot}
                        />

                        {screenshot ? (
                          <div className="space-y-3">
                            <img
                              src={screenshot}
                              alt="Payment screenshot preview"
                              className="max-h-28 mx-auto rounded-lg border border-white/10 object-contain shadow-md"
                            />
                            <p className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Screenshot successfully enqueued
                            </p>
                            <span className="text-[10px] text-gray-500 underline hover:text-white block">Change Image</span>
                          </div>
                        ) : (
                          <>
                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">Click to upload or drag image here</p>
                              <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG formats</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Transaction ID input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Transaction ID (Optional)</label>
                      <input
                        id="payment-txid-input"
                        type="text"
                        placeholder="e.g. TXN-912839210-BTC"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                      />
                    </div>

                    {/* Additional Notes input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70">Additional Notes</label>
                      <textarea
                        id="payment-notes-input"
                        placeholder="Input any additional details, description parameters, or questions."
                        rows={2}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setPortalStep('payment-details')}
                        className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-xs font-semibold text-white transition-all min-h-[44px]"
                      >
                        Back
                      </button>
                      <button
                        id="submit-payment-btn"
                        type="submit"
                        disabled={!screenshot}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all min-h-[44px]"
                      >
                        <span>Submit Payment</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* ==================== STEP 5: SUCCESS PAGE ==================== */}
                {portalStep === 'success' && selectedPlan && chosenPaymentMethod && (
                  <div className="text-center space-y-6 py-4">
                    <div className="inline-flex rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                      <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Node Dispatch Initiated</span>
                      <h4 className="font-display text-2xl font-extrabold text-white tracking-tight leading-snug">
                        Deposit Submitted Successfully
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                        Your payment information has been received and is currently under review. Your transaction reference id is <strong className="text-white font-medium">{generatedRefNo}</strong>.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto rounded-xl bg-[#090729]/50 border border-white/5 p-4 text-left space-y-2 text-xs">
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Plan Enrolled</span>
                        <span className="font-bold text-gray-300">{selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Total Deposit</span>
                        <span className="font-bold font-mono text-emerald-400">${selectedPlan.minDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Payment Channel</span>
                        <span className="font-bold text-gray-300">{chosenPaymentMethod.name}</span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        id="go-to-dashboard-btn"
                        onClick={() => {
                          setSelectedPlan(null);
                          setActiveTab('history');
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-base font-semibold text-white shadow-lg transition-all min-h-[48px]"
                      >
                        <span>Go To Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
