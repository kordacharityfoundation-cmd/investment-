import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Coins, ShieldCheck, ArrowRight, Wallet, ArrowDownLeft,
  ArrowUpRight, AlertCircle, CheckCircle2, History, Send, MessageSquare,
  Clock, ShieldAlert, Sparkles, ChevronRight, Check, User, Phone, MapPin, 
  Lock, Share2, Copy, Plus, HelpCircle, Activity, Bell, MessageCircle, Bot
} from 'lucide-react';
import { UserState } from '../types';
import { 
  getSavedAnnouncements, getSavedWithdrawals, getSavedPlans, 
  WithdrawalRequest, getPaymentConfig, getSavedTickets, getSavedChats,
  getSavedActivities, getSavedNotifications, logActivity, addNotification,
  SupportTicket, ChatMessage, ActivityLog, NotificationItem
} from '../utils/db';
import { DepositTransaction } from './Plans';

interface UserDashboardProps {
  user: UserState;
  onNavigateToPlans: () => void;
}

export default function UserDashboard({ user, onNavigateToPlans }: UserDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'support' | 'referrals' | 'notifications' | 'profile' | 'activity'>('overview');

  // Database Synced States
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>({});

  // Form states for withdrawal request
  const [withdrawalMethod, setWithdrawalMethod] = useState('Bitcoin (BTC)');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [transactionNote, setTransactionNote] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<WithdrawalRequest | null>(null);

  // Form states for ticket support
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Investment');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Live Chat state
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Profile Edit States
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState('+1 (555) 420-6969');
  const [profileAddress, setProfileAddress] = useState('1 Starbase Blvd, Boca Chica, TX');
  const [profilePassword, setProfilePassword] = useState('••••••••');
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // General UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  // Load and sync with Local Storage Mock Database
  const loadDashboardData = () => {
    setAnnouncements(getSavedAnnouncements());
    
    // Load deposits
    const savedDeps = localStorage.getItem('musk_deposits');
    let userDeps: DepositTransaction[] = [];
    if (savedDeps) {
      try {
        const parsed = JSON.parse(savedDeps);
        userDeps = parsed.filter((d: any) => (d.userEmail && d.userEmail.toLowerCase() === user.email.toLowerCase()) || (d.email && d.email.toLowerCase() === user.email.toLowerCase()));
      } catch (e) {
        userDeps = [];
      }
    }
    setDeposits(userDeps);

    // Sync everything else
    setWithdrawals(getSavedWithdrawals().filter(w => w.userEmail.toLowerCase() === user.email.toLowerCase()));
    setTickets(getSavedTickets().filter(t => t.userEmail === user.email));
    setChatMessages(getSavedChats().filter(c => c.userEmail === user.email));
    setActivities(getSavedActivities().filter(a => a.userEmail === user.email));
    setNotifications(getSavedNotifications().filter(n => n.userEmail === user.email));
    setPaymentConfig(getPaymentConfig());
  };

  useEffect(() => {
    loadDashboardData();
    // Periodic synchronization check
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, [user.email]);

  // Financial Calculators
  const approvedDeposits = deposits.filter(d => d.status === 'Approved');
  const totalInvested = approvedDeposits.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDeposited = deposits.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalWithdrawn = withdrawals
    .filter(w => w.userEmail === user.email && w.status === 'Approved')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingWithdrawn = withdrawals
    .filter(w => w.userEmail === user.email && w.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Balanced compounding estimations
  const totalEarned = Math.round(totalInvested * 0.15); // +15% simulated profits
  const accountBalance = Math.max(0, (totalInvested + totalEarned) - totalWithdrawn - pendingWithdrawn);

  // Copy Referral link helper
  const handleCopyReferral = () => {
    const referralUrl = `${window.location.origin}/register?ref=${user.email.split('@')[0]}`;
    navigator.clipboard.writeText(referralUrl);
    setCopyConfirmed(true);
    setTimeout(() => setCopyConfirmed(false), 2000);
  };

  // Submit Withdrawal Request Form
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setWithdrawalSuccess(null);

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid, positive withdrawal amount.');
      return;
    }

    if (amount > accountBalance) {
      setErrorMsg(`Insufficient funds. Your withdrawable balance is $${accountBalance.toLocaleString()}.`);
      return;
    }

    if (!withdrawalAddress.trim()) {
      setErrorMsg('Please enter a receiving wallet address or bank credentials.');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      
      const newRequest: WithdrawalRequest = {
        id: `with-${Date.now()}`,
        userEmail: user.email,
        amount: amount,
        paymentMethod: withdrawalMethod,
        addressDetails: withdrawalAddress + (transactionNote ? ` | Note: ${transactionNote}` : ''),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Pending',
        referenceNo: `MSK-${Math.floor(10000 + Math.random() * 90000)}-WTH`
      };

      const updated = [newRequest, ...getSavedWithdrawals()];
      localStorage.setItem('musk_withdrawals', JSON.stringify(updated));
      setWithdrawals(updated);
      
      // Log Action and Add notification
      logActivity(user.email, `Requested $${amount.toLocaleString()} withdrawal via ${withdrawalMethod}`);
      addNotification(
        user.email, 
        'Withdrawal Request Submitted', 
        `Your withdrawal request of $${amount.toLocaleString()} via ${withdrawalMethod} has been received.`,
        'withdrawal_submitted'
      );
      
      setWithdrawalSuccess(newRequest);
      setWithdrawalAmount('');
      setWithdrawalAddress('');
      setTransactionNote('');
    }, 1200);
  };

  // Profile Change triggers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    
    // Simulate updating locally
    const savedLocal = localStorage.getItem('musk_user');
    if (savedLocal) {
      const parsed = JSON.parse(savedLocal);
      parsed.name = profileName;
      localStorage.setItem('musk_user', JSON.stringify(parsed));
    }
    
    logActivity(user.email, 'Updated security profile settings');
    addNotification(user.email, 'Profile Settings Updated', 'Your profile address, name, and contact details were saved.', 'general');
    
    setProfileSuccessMsg('Security credentials and bio metrics successfully validated.');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Support Ticket Form Submit
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitSuccess('');

    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket: SupportTicket = {
      id: `tick-${Date.now()}`,
      userEmail: user.email,
      userName: user.name,
      subject: ticketSubject,
      category: ticketCategory,
      priority: ticketPriority,
      message: ticketMessage,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Open',
      replies: []
    };

    const saved = getSavedTickets();
    const updated = [newTicket, ...saved];
    localStorage.setItem('musk_tickets', JSON.stringify(updated));
    setTickets(updated.filter(t => t.userEmail === user.email));

    logActivity(user.email, `Created support ticket: "${ticketSubject}"`);
    addNotification(user.email, 'Support Ticket Created', `Your ticket "${ticketSubject}" is now open for review.`, 'general');

    setTicketSubject('');
    setTicketMessage('');
    setTicketSubmitSuccess('Support Ticket submitted successfully. Our team will reply shortly.');
    setTimeout(() => setTicketSubmitSuccess(''), 4000);
  };

  // Reply to active support thread
  const handleReplyTicket = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;

    const saved = getSavedTickets();
    const updated = saved.map(t => {
      if (t.id === ticketId) {
        const newReply = {
          id: `rep-${Date.now()}`,
          sender: 'user' as const,
          senderName: user.name,
          message: ticketReplyText,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        const updatedReplies = [...t.replies, newReply];
        return {
          ...t,
          status: 'Open' as const,
          replies: updatedReplies
        };
      }
      return t;
    });

    localStorage.setItem('musk_tickets', JSON.stringify(updated));
    setTickets(updated.filter(t => t.userEmail === user.email));
    setTicketReplyText('');

    // Simulated system operator response after 2 seconds
    setTimeout(() => {
      const liveSaved = getSavedTickets();
      const withAdminReply = liveSaved.map(t => {
        if (t.id === ticketId) {
          const adminReply = {
            id: `rep-${Date.now() + 1}`,
            sender: 'admin' as const,
            senderName: 'Technical Support Operator',
            message: 'Your message has been received by our on-duty administrative lead. We are verifying telemetry variables on your gateway. Thank you for your patience.',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
          return {
            ...t,
            status: 'Pending' as const,
            replies: [...t.replies, adminReply]
          };
        }
        return t;
      });
      localStorage.setItem('musk_tickets', JSON.stringify(withAdminReply));
      setTickets(withAdminReply.filter(t => t.userEmail === user.email));
      addNotification(user.email, 'New Ticket Reply Received', 'An administrator has replied to your open ticket thread.', 'general');
    }, 2000);
  };

  // Close open ticket thread
  const handleCloseTicket = (ticketId: string) => {
    const saved = getSavedTickets();
    const updated = saved.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'Closed' as const };
      }
      return t;
    });
    localStorage.setItem('musk_tickets', JSON.stringify(updated));
    setTickets(updated.filter(t => t.userEmail === user.email));
    logActivity(user.email, `Closed support ticket ID: ${ticketId}`);
  };

  // Submit Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      userEmail: user.email,
      userName: user.name,
      sender: 'user',
      message: chatInput,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const saved = getSavedChats();
    const updated = [...saved, userMsg];
    localStorage.setItem('musk_chats', JSON.stringify(updated));
    setChatMessages(updated.filter(c => c.userEmail === user.email));
    setChatInput('');
    setIsChatTyping(true);

    // Simulated administrative assistant reply
    setTimeout(() => {
      setIsChatTyping(false);
      const assistantMsg: ChatMessage = {
        id: `chat-${Date.now() + 1}`,
        userEmail: user.email,
        userName: 'System Core Operator',
        sender: 'admin',
        message: 'Hello! I am the automated desk assistant. Our master administrators have been notified of your message. We generally reply within 5 minutes. Feel free to leave details of your request here!',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      
      const saved2 = getSavedChats();
      const updated2 = [...saved2, assistantMsg];
      localStorage.setItem('musk_chats', JSON.stringify(updated2));
      setChatMessages(updated2.filter(c => c.userEmail === user.email));
    }, 1800);
  };

  // Clear all notifications
  const handleClearNotifications = () => {
    const allNots = getSavedNotifications();
    const remaining = allNots.filter(n => n.userEmail !== user.email);
    localStorage.setItem('musk_notifications', JSON.stringify(remaining));
    setNotifications([]);
  };

  // Notification read marker
  const handleMarkNotificationRead = (id: string) => {
    const allNots = getSavedNotifications();
    const updated = allNots.map(n => {
      if (n.id === id) return { ...n, isRead: true };
      return n;
    });
    localStorage.setItem('musk_notifications', JSON.stringify(updated));
    setNotifications(updated.filter(n => n.userEmail === user.email));
  };

  return (
    <div id="user-dashboard-root-node" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left">
      
      {/* Greetings Header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-[#0c0a24]/60 to-transparent p-5 sm:p-6 rounded-2xl border border-purple-500/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase">Secure Investor Node</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome, {profileName}!
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>Account Status: <span className="text-emerald-400 font-bold font-mono">Active</span></span>
            <span className="text-gray-600">•</span>
            <span>Registered: <span className="text-purple-300 font-mono">July 2026</span></span>
            <span className="text-gray-600">•</span>
            <span>Ref Code: <span className="text-indigo-300 font-mono font-bold">{user.email.split('@')[0].toUpperCase()}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
          <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0" />
          <div className="text-left">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Crypto Insurance</p>
            <p className="text-xs font-bold text-emerald-400 font-mono">Escrow Secured</p>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Selector Chips (No horizontal scroll of parent, internal flex overflow for perfect mobile sizing) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'withdraw', label: 'Withdrawal Center', icon: Wallet },
          { id: 'notifications', label: `Notifications (${notifications.filter(n=>!n.isRead).length})`, icon: Bell },
          { id: 'profile', label: 'Profile Settings', icon: User },
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border min-h-[36px] ${
                activeTab === tab.id 
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-950/20' 
                  : 'bg-[#0a0820] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Broadcast Center (Only if announcements exist) */}
              {announcements.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] p-4 sm:p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0 border border-indigo-500/20">
                      <Bot className="h-5 w-5 animate-bounce" />
                    </div>
                    <div className="space-y-1.5 flex-1 text-left">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                        Broadcasting System Announcements
                      </span>
                      <div className="space-y-2 mt-2">
                        {announcements.map((ann) => (
                          <div key={ann.id} className="text-xs text-gray-300 font-light border-b border-white/5 last:border-0 pb-2 last:pb-0">
                            <span className="font-semibold text-white block">{ann.text}</span>
                            <span className="text-[10px] font-mono text-gray-500">{ann.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4 relative overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Available Balance</p>
                  <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5">${accountBalance.toLocaleString()}</p>
                  <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-3 w-3" /> Withdrawable Yield
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4 relative overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Active Investments</p>
                  <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5">${totalInvested.toLocaleString()}</p>
                  <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 mt-2">
                    <CheckCircle2 className="h-3 w-3" /> {approvedDeposits.length} Micro Nodes Active
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4 relative overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Deposited</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1.5">${totalDeposited.toLocaleString()}</p>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-2">
                    <Plus className="h-3 w-3" /> Inbound Staking Capital
                  </span>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4 relative overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Withdrawn</p>
                  <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1.5">${totalWithdrawn.toLocaleString()}</p>
                  <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-2">
                    <History className="h-3 w-3" /> Dispensed Yields
                  </span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-[#0b0826]/40 rounded-xl border border-purple-500/10 p-4 text-left">
                <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3">Quick Interactive Commands</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={onNavigateToPlans} className="bg-purple-600/15 hover:bg-purple-600/35 text-purple-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-purple-500/20 transition-all min-h-[44px]">
                    <Plus className="h-4 w-4" /> Make Deposit
                  </button>
                  <button onClick={() => setActiveTab('withdraw')} className="bg-indigo-600/15 hover:bg-indigo-600/35 text-indigo-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-indigo-500/20 transition-all min-h-[44px]">
                    <Wallet className="h-4 w-4" /> Withdraw Yields
                  </button>
                </div>
              </div>

              {/* Sub-split: Active Plans & Recent Deposits History Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                
                {/* Left: Active Investment Staking Nodes */}
                <div className="lg:col-span-6 rounded-2xl border border-white/5 bg-[#09071f]/50 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-400" /> Active Staking Nodes
                    </h3>
                    <button onClick={onNavigateToPlans} className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
                      Buy Node <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {approvedDeposits.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-gray-500 italic">No active investment plan nodes currently running.</p>
                      <button onClick={onNavigateToPlans} className="bg-white/5 hover:bg-white/10 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs border border-white/10 min-h-[32px]">
                        Configure Plan Node
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {approvedDeposits.map((dep) => (
                        <div key={dep.id} className="rounded-xl border border-purple-500/15 bg-purple-500/[0.01] p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-1.5 py-0.5 rounded">NODE RUNNING</span>
                              <h4 className="text-sm font-bold text-white mt-1.5">{dep.planName}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                              Compounding
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs border-t border-white/5 pt-3">
                            <div>
                              <p className="text-[10px] text-gray-500">Staked Principal</p>
                              <p className="font-bold text-white font-mono">${dep.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Node Speed</p>
                              <p className="font-bold text-purple-300 font-mono">15% APR Est</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500">Staked Date</p>
                              <p className="font-mono text-gray-400">{dep.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Deposit Ledger */}
                <div className="lg:col-span-6 rounded-2xl border border-white/5 bg-[#09071f]/50 p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <History className="h-4 w-4 text-indigo-400" /> Recent Deposit Transactions
                  </h3>

                  {deposits.length === 0 ? (
                    <p className="py-8 text-center text-xs text-gray-500 italic">No deposit transactions listed.</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {deposits.map((dep) => (
                        <div key={dep.id} className="bg-[#030310]/50 border border-white/5 rounded-xl p-3 flex justify-between items-center gap-2">
                          <div className="text-left space-y-0.5">
                            <p className="text-xs font-bold text-white">{dep.planName || 'Direct Deposit'}</p>
                            <p className="text-[9px] text-gray-500 font-mono">{dep.date} • {dep.paymentMethod}</p>
                            <p className="text-[9px] text-purple-400 font-mono truncate max-w-[150px]">{dep.txId || 'N/A'}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-bold text-white font-mono">+${dep.amount.toLocaleString()}</p>
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              dep.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              dep.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {dep.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAWAL CENTER */}
          {activeTab === 'withdraw' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
              
              {/* Left Form Column */}
              <div className="lg:col-span-5 bg-[#09071f]/60 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Withdraw Funds</h3>
                  <p className="text-xs text-gray-400">
                    Direct access to capital withdrawals. Processed in accordance with secure automated liquidity routing rules.
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  {/* Select Method */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Withdrawal Method</label>
                    <select
                      value={withdrawalMethod}
                      onChange={(e) => setWithdrawalMethod(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                    >
                      <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                      <option value="USDT (TRC20)">USDT (TRC20)</option>
                      <option value="USDT (ERC20)">USDT (ERC20)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Input Amount */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold uppercase text-purple-300">Amount</span>
                      <button
                        type="button"
                        onClick={() => setWithdrawalAmount(accountBalance.toString())}
                        className="text-purple-400 font-bold hover:text-purple-300"
                      >
                        Max: ${accountBalance.toLocaleString()}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-gray-500">$</span>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        min="1"
                        max={accountBalance}
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-[#030310] pl-8 pr-4 py-3 text-xs text-white min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-purple-300">
                      {withdrawalMethod === 'Bank Transfer' ? 'Bank Credentials (Name, Account, Branch)' : 'Target Wallet Address'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={
                        withdrawalMethod === 'Bank Transfer'
                          ? 'Account Name, Bank Name, Account Number, SWIFT Routing Code...'
                          : `Enter your private external ${withdrawalMethod} wallet receiving address...`
                      }
                      value={withdrawalAddress}
                      onChange={(e) => setWithdrawalAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#030310] p-3 text-xs text-white focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-gray-500">Transaction Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Personal savings allocation"
                      value={transactionNote}
                      onChange={(e) => setTransactionNote(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white min-h-[38px]"
                    />
                  </div>

                  <button
                    id="submit-withdrawal-request-btn"
                    type="submit"
                    disabled={submitting || accountBalance <= 0}
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-purple-950/20 flex items-center justify-center gap-2 transition-all min-h-[44px]"
                  >
                    {submitting ? 'Authenticating Ledger...' : 'Submit Withdrawal Request'}
                  </button>
                </form>

                {/* Submit Success Tracker Flow */}
                {withdrawalSuccess && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 text-left space-y-3 animate-fade-in mt-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      <span className="text-xs font-bold font-mono">Withdrawal Request Submitted</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                      Your payout reference <span className="text-purple-300 font-mono font-bold">{withdrawalSuccess.referenceNo}</span> of <span className="text-white font-bold font-mono">${withdrawalSuccess.amount.toLocaleString()}</span> has been sent to our administrative queue.
                    </p>

                    {/* Step Status tracker */}
                    <div className="border-t border-white/5 pt-3 mt-2">
                      <p className="text-[9px] font-mono font-bold uppercase text-purple-400 mb-2">Live Status Tracking</p>
                      <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-mono">
                        <div className="space-y-1">
                          <div className="h-1 bg-purple-500 rounded-full" />
                          <span className="text-purple-300 font-bold block">Submitted</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-purple-500/40 rounded-full animate-pulse" />
                          <span className="text-purple-300/60 block">In Review</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-white/10 rounded-full" />
                          <span className="text-gray-600 block">Approved</span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 bg-white/10 rounded-full" />
                          <span className="text-gray-600 block">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right History Ledger */}
              <div className="lg:col-span-7 bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <History className="h-4 w-4 text-purple-400" /> Recent Withdrawal Ledger
                </h3>

                {withdrawals.filter(w => w.userEmail === user.email).length === 0 ? (
                  <p className="py-12 text-center text-xs text-gray-500 italic">No withdrawal transactions logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.filter(w => w.userEmail === user.email).map((w) => (
                      <div key={w.id} className="rounded-xl bg-[#030310]/50 border border-white/5 p-3.5 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <div className="text-left">
                            <span className="text-[9px] font-mono text-purple-300 font-bold uppercase bg-purple-500/10 px-1.5 py-0.5 rounded">{w.referenceNo}</span>
                            <p className="text-xs font-bold text-white mt-1">{w.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-white font-mono">-${w.amount.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">{w.date}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-3 border-t border-white/5 pt-2 text-[10px]">
                          <span className="text-gray-500 truncate max-w-[200px] font-mono font-light">Target: {w.addressDetails}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                            w.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            w.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: HELP DESK & LIVE CHAT */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
              
              {/* Left: Support Ticket Form & Thread List */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Submit ticket card */}
                <div className="bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="h-4.5 w-4.5 text-purple-400" /> Create Support Ticket
                    </h3>
                    <p className="text-xs text-gray-400">
                      Submit an official support request ticket. Standard desk response times are under 30 minutes.
                    </p>
                  </div>

                  {ticketSubmitSuccess && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{ticketSubmitSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Subject */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Deposit validation query"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white min-h-[38px]"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Category</label>
                        <select
                          value={ticketCategory}
                          onChange={(e) => setTicketCategory(e.target.value)}
                          className="w-full rounded-xl border border-white/5 bg-[#030310] px-3 py-2.5 text-xs text-white min-h-[38px]"
                        >
                          <option value="Deposit">Deposit</option>
                          <option value="Withdrawal">Withdrawal</option>
                          <option value="Investment">Investment</option>
                          <option value="Security">Security</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Priority */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Priority</label>
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value as any)}
                          className="w-full rounded-xl border border-white/5 bg-[#030310] px-3 py-2.5 text-xs text-white min-h-[38px]"
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="High">High Priority</option>
                        </select>
                      </div>

                      {/* Message body */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Message details</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Provide specific transaction hashes or question particulars..."
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full rounded-xl border border-white/5 bg-[#030310] p-3 text-xs text-white focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all min-h-[40px]"
                    >
                      <Plus className="h-4 w-4" /> Submit Desk Ticket
                    </button>
                  </form>
                </div>

                {/* Ticket threads */}
                <div className="bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">Active Support Threads</h3>
                  {tickets.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4">No active desk tickets registered.</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div key={t.id} className="bg-black/30 rounded-xl border border-white/5 p-4 space-y-3 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                                t.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                t.priority === 'Medium' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                'bg-gray-500/10 border-gray-500/20 text-gray-400'
                              }`}>
                                {t.priority}
                              </span>
                              <h4 className="font-bold text-white text-sm mt-1">{t.subject}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">Category: {t.category} • {t.date}</p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                              t.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              t.status === 'Closed' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <p className="text-gray-300 font-light leading-relaxed border-t border-white/5 pt-2 mt-1">{t.message}</p>

                          {/* Render Replies */}
                          {t.replies.length > 0 && (
                            <div className="space-y-2 mt-3 pl-3 border-l border-purple-500/20 pt-2">
                              <p className="text-[10px] font-mono font-bold uppercase text-purple-400">Discussion History ({t.replies.length})</p>
                              {t.replies.map((rep) => (
                                <div key={rep.id} className={`p-2.5 rounded-lg space-y-1 ${rep.sender === 'admin' ? 'bg-[#0b0826]/80 border border-purple-500/10' : 'bg-[#030310]/60 border border-white/5'}`}>
                                  <div className="flex justify-between text-[9px] font-mono font-bold">
                                    <span className={rep.sender === 'admin' ? 'text-purple-300' : 'text-gray-400'}>{rep.senderName}</span>
                                    <span className="text-gray-600">{rep.date}</span>
                                  </div>
                                  <p className="text-gray-300 leading-normal">{rep.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quick reply interface */}
                          {t.status !== 'Closed' && (
                            <div className="flex gap-2 items-center border-t border-white/5 pt-3 mt-2">
                              <input
                                type="text"
                                placeholder="Write reply to operator..."
                                value={expandedTicketId === t.id ? ticketReplyText : ''}
                                onChange={(e) => { setExpandedTicketId(t.id); setTicketReplyText(e.target.value); }}
                                className="flex-1 bg-[#030310] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white"
                              />
                              <button
                                onClick={() => handleReplyTicket(t.id)}
                                className="bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 font-bold px-3 py-1.5 rounded-lg text-xs"
                              >
                                Send
                              </button>
                              <button
                                onClick={() => handleCloseTicket(t.id)}
                                className="text-gray-500 hover:text-red-400 font-bold text-xs px-1.5 py-1"
                                title="Close thread"
                              >
                                Close Thread
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right: Real-time Live Chat widget */}
              <div className="lg:col-span-5 bg-[#09071f]/60 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col h-[520px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse border border-purple-950" />
                      <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-[#030310]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-white">Live Support Operator</h3>
                      <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Online Now</p>
                    </div>
                  </div>
                  <Bot className="h-5 w-5 text-purple-400" />
                </div>

                {/* Messages Box scrollable */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                      <span className="text-[9px] font-mono text-gray-500 mb-0.5">{msg.userName} • {msg.date.split(' ')[1] || msg.date}</span>
                      <div className={`p-3 rounded-2xl leading-normal text-left ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#0d092a] border border-white/5 text-gray-200 rounded-tl-none'}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}

                  {/* Typing Simulator */}
                  {isChatTyping && (
                    <div className="flex gap-1.5 items-center text-gray-500 font-mono text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce delay-75" />
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce delay-150" />
                      <span className="italic">Operator is composing a reply...</span>
                    </div>
                  )}
                </div>

                {/* Chat input box */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center border-t border-white/5 pt-3">
                  <input
                    type="text"
                    required
                    placeholder="Type live message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-[#030310] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 min-h-[40px]"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl flex items-center justify-center transition-all min-h-[40px] min-w-[40px]"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: REFERRAL PROGRAM */}
          {activeTab === 'referrals' && (
            <div className="space-y-6 text-left">
              {/* Marketing block card */}
              <div className="bg-gradient-to-br from-[#0c0a2a]/80 via-[#07051a] to-transparent border border-purple-500/10 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-purple-500/5"><Sparkles className="h-24 w-24" /></div>
                
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Affiliate Network active
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Compound Capital Through Networks</h3>
                  <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                    Earn premium bonus staking power! For every active node validator referred to our global mesh network, you receive an instantaneous reward equivalent to <span className="text-emerald-400 font-bold">10% of their staked deposit volume</span>, credited directly to your withdrawable balance.
                  </p>
                </div>

                {/* Referral parameters info */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {/* Copy Link wrapper */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Unique Referral Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/register?ref=${user.email.split('@')[0]}`}
                        className="flex-1 bg-[#030310] border border-white/5 rounded-xl px-3 py-2 text-[11px] text-gray-400 font-mono select-all min-h-[38px]"
                      />
                      <button
                        onClick={handleCopyReferral}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 min-h-[38px]"
                      >
                        {copyConfirmed ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copyConfirmed ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Ref Code wrapper */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Active Referral Code</label>
                    <div className="bg-[#030310] border border-white/5 rounded-xl px-4 py-2 text-sm font-bold text-white font-mono flex items-center justify-between min-h-[38px]">
                      <span>{user.email.split('@')[0].toUpperCase()}</span>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Certified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Referrals</p>
                  <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1.5">2 Members</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">Linked using your link</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Active Referrals</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1.5">1 Validator</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">Completed stakings</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Referral Bonus Commission</p>
                  <p className="text-xl sm:text-2xl font-black text-purple-400 font-mono mt-1.5">$250.00</p>
                  <p className="text-[10px] text-purple-400 mt-1 font-mono">+10% credit approved</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-purple-400" /> Notifications Inbox ({notifications.length})
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-xs text-red-400 hover:text-red-300 font-bold"
                  >
                    Clear All Inbox
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-500 italic space-y-2">
                  <p className="text-xs">Your notification inbox is clean.</p>
                  <p className="text-[10px] text-gray-600">Any system updates or ledger approvals will generate instant logs here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((not) => (
                    <div
                      key={not.id}
                      onClick={() => handleMarkNotificationRead(not.id)}
                      className={`rounded-xl border p-4 flex justify-between items-start gap-3 transition-all cursor-pointer ${
                        not.isRead 
                          ? 'border-white/5 bg-black/10 opacity-60' 
                          : 'border-purple-500/10 bg-purple-500/[0.02] hover:bg-purple-500/[0.04]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!not.isRead && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse shrink-0" />}
                          <p className="text-xs font-bold text-white">{not.title}</p>
                        </div>
                        <p className="text-xs text-gray-400 leading-normal">{not.message}</p>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 shrink-0">{not.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
              
              {/* Form profile */}
              <div className="lg:col-span-7 bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-purple-400" /> Identity Credentials settings
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Manage your investor billing credentials and multi-node password variables.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Investor Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 min-h-[38px]"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 min-h-[38px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Readonly */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-gray-600">Email (Read-only Node ID)</label>
                      <input
                        type="email"
                        disabled
                        value={profileEmail}
                        className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-gray-500 font-mono select-all min-h-[38px]"
                      />
                    </div>

                    {/* Change Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Investor Password</label>
                      <input
                        type="password"
                        required
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 min-h-[38px]"
                      />
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-purple-300">Staking Node Physical Address</label>
                    <input
                      type="text"
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#030310] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 min-h-[38px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl text-xs transition-all min-h-[40px]"
                  >
                    Save Security Profile
                  </button>
                </form>
              </div>

              {/* Security parameters */}
              <div className="lg:col-span-5 bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Security Standards
                </h3>
                <div className="space-y-3.5 text-xs font-light text-gray-400 leading-relaxed">
                  <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">AES-256 Ledger Security</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">All passwords, transactions, and banking coordinates are encrypted before serialization into local memory arrays.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Lock className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-xs">Active Escrow Protection</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Any pending node changes or suspicious logins initiate automatic alert notifications to prevent malicious activity.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="bg-[#09071f]/50 border border-white/5 rounded-2xl p-5 space-y-4 text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <Activity className="h-4 w-4 text-purple-400" /> Activity Auditing Ledger
              </h3>

              {activities.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-500 italic">No activity logs recorded.</p>
              ) : (
                <div className="space-y-2.5">
                  {activities.map((log) => (
                    <div key={log.id} className="bg-black/30 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 text-left">
                        <Activity className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                        <span className="text-gray-300 font-light">{log.action}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 shrink-0">{log.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
