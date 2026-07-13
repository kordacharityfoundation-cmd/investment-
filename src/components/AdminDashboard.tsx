import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, Download, Upload, Trash2, Edit2, Plus, Check, X, Menu,
  Search, CheckCircle2, ShieldAlert, DollarSign, Wallet, FileText, 
  Bell, AlertCircle, RefreshCw, Key, Image, Banknote, ShieldCheck, 
  Info, Sparkles, UserCheck, UserMinus, Clock, MessageSquare, HelpCircle,
  Activity, Settings, LogOut
} from 'lucide-react';
import { 
  getSavedUsers, getSavedWithdrawals, getSavedPlans, getSavedAnnouncements,
  getPaymentConfig, getQrConfig, AdminUser, WithdrawalRequest, Announcement,
  DEFAULT_PLANS, getSavedTickets, getSavedActivities, getSystemSettings,
  logActivity, addNotification
} from '../utils/db';
import { InvestmentPlan } from '../types';
import { DepositTransaction } from './Plans';

export default function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  // Database states
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [depositsList, setDepositsList] = useState<DepositTransaction[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [plansList, setPlansList] = useState<InvestmentPlan[]>([]);
  const [announcementsList, setAnnouncement] = useState<Announcement[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>({});
  const [qrConfig, setQrConfig] = useState<any>({});
  
  // Custom states for tickets, settings, audits
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [systemSettings, setSystemSettingsState] = useState<any>({});
  const [ticketReplyTexts, setTicketReplyTexts] = useState<{ [ticketId: string]: string }>({});

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'deposits' | 'withdrawals' | 'plans' | 'payments' | 'announcements' | 'tickets' | 'settings' | 'audits'>('stats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [depositFilter, setDepositFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Modals & Editor States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    apr: 10,
    minDeposit: 1000,
    duration: 30,
    description: '',
    badge: 'Standard'
  });

  const [announcementText, setAnnouncementText] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<'Update' | 'Alert' | 'Maintenance' | 'General'>('Update');

  // QR Upload targets
  const fileBtcQrRef = useRef<HTMLInputElement>(null);
  const fileTrcQrRef = useRef<HTMLInputElement>(null);
  const fileErcQrRef = useRef<HTMLInputElement>(null);
  const fileBankQrRef = useRef<HTMLInputElement>(null);

  // Success / Action notification banners
  const [notice, setNotice] = useState({ text: '', type: 'success' });

  // Sync data from LocalStorage
  const syncDatabase = () => {
    setUsersList(getSavedUsers());
    setWithdrawalsList(getSavedWithdrawals());
    setPlansList(getSavedPlans());
    setAnnouncement(getSavedAnnouncements());
    setPaymentConfig(getPaymentConfig());
    setQrConfig(getQrConfig());
    setTicketsList(getSavedTickets());
    setActivitiesList(getSavedActivities());
    setSystemSettingsState(getSystemSettings());

    // Load deposits
    const savedDeps = localStorage.getItem('musk_deposits');
    if (savedDeps) {
      try {
        setDepositsList(JSON.parse(savedDeps));
      } catch (e) {
        setDepositsList([]);
      }
    }
  };

  useEffect(() => {
    syncDatabase();
    // Refresh admin data every 4 seconds to catch new user requests
    const interval = setInterval(syncDatabase, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'success' }), 4000);
  };

  // 1. User Account Status Control (Activate/Suspend)
  const handleToggleUserStatus = (id: string, currentStatus: 'Active' | 'Suspended') => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const updated = usersList.map(u => {
      if (u.id === id) {
        return { ...u, status: nextStatus };
      }
      return u;
    });
    localStorage.setItem('musk_users', JSON.stringify(updated));
    setUsersList(updated);
    
    const targetUser = usersList.find(u => u.id === id);
    if (targetUser) {
      logActivity('admin@muskinvestment.com', `Changed status of user ${targetUser.email} to ${nextStatus}`, 'Admin');
      addNotification(targetUser.email, 'Account Status Updated', `Your investor account status has been updated to ${nextStatus} by our security compliance desk.`, 'general');
    }

    triggerNotice(`User account successfully ${nextStatus === 'Active' ? 'Activated' : 'Suspended'}.`);
  };

  // 2. Deposit Approval Control
  const handleApproveDeposit = (id: string) => {
    const targetDep = depositsList.find(d => d.id === id);
    const updated = depositsList.map(dep => {
      if (dep.id === id) {
        return { ...dep, status: 'Approved' as const };
      }
      return dep;
    });
    localStorage.setItem('musk_deposits', JSON.stringify(updated));
    setDepositsList(updated);

    if (targetDep) {
      const email = targetDep.userEmail || (targetDep as any).email || 'elon@tesla.com';
      logActivity('admin@muskinvestment.com', `Approved deposit request of $${targetDep.amount} (Ref: ${targetDep.referenceNo})`, 'Admin');
      addNotification(email, 'Deposit Approved', `Your deposit of $${targetDep.amount} for the plan "${targetDep.planName}" has been approved. Your yield compounding cycle starts immediately.`, 'deposit_approved');
    }

    triggerNotice('Deposit validated and credited successfully.');
  };

  const handleRejectDeposit = (id: string) => {
    const targetDep = depositsList.find(d => d.id === id);
    const updated = depositsList.map(dep => {
      if (dep.id === id) {
        return { ...dep, status: 'Rejected' as const };
      }
      return dep;
    });
    localStorage.setItem('musk_deposits', JSON.stringify(updated));
    setDepositsList(updated);

    if (targetDep) {
      const email = targetDep.userEmail || (targetDep as any).email || 'elon@tesla.com';
      logActivity('admin@muskinvestment.com', `Rejected deposit request of $${targetDep.amount} (Ref: ${targetDep.referenceNo})`, 'Admin');
      addNotification(email, 'Deposit Rejected', `Your deposit of $${targetDep.amount} was rejected. Please open a support ticket or verify your receipt screenshot.`, 'deposit_rejected');
    }

    triggerNotice('Deposit set to Rejected status.');
  };

  // 3. Withdrawal Approval Control
  const handleApproveWithdrawal = (id: string) => {
    const targetWth = withdrawalsList.find(w => w.id === id);
    const updated = withdrawalsList.map(wth => {
      if (wth.id === id) {
        return { ...wth, status: 'Approved' as const };
      }
      return wth;
    });
    localStorage.setItem('musk_withdrawals', JSON.stringify(updated));
    setWithdrawalsList(updated);

    if (targetWth) {
      logActivity('admin@muskinvestment.com', `Approved withdrawal request of $${targetWth.amount} (Ref: ${targetWth.referenceNo})`, 'Admin');
      addNotification(targetWth.userEmail, 'Withdrawal Completed', `Your withdrawal request of $${targetWth.amount} has been approved and processed. Funds have been sent to your designated wallet/account.`, 'withdrawal_approved');
    }

    triggerNotice('Withdrawal request approved and processed.');
  };

  const handleRejectWithdrawal = (id: string) => {
    const targetWth = withdrawalsList.find(w => w.id === id);
    const updated = withdrawalsList.map(wth => {
      if (wth.id === id) {
        return { ...wth, status: 'Rejected' as const };
      }
      return wth;
    });
    localStorage.setItem('musk_withdrawals', JSON.stringify(updated));
    setWithdrawalsList(updated);

    if (targetWth) {
      logActivity('admin@muskinvestment.com', `Rejected withdrawal request of $${targetWth.amount} (Ref: ${targetWth.referenceNo})`, 'Admin');
      addNotification(targetWth.userEmail, 'Withdrawal Rejected', `Your withdrawal request of $${targetWth.amount} was rejected. Please contact support or check your account dashboard details.`, 'withdrawal_rejected');
    }

    triggerNotice('Withdrawal request rejected.');
  };

  // 4. Manage Investment Plans
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      apr: 12.0,
      minDeposit: 1000,
      duration: 45,
      description: '',
      badge: 'Hot Tier'
    });
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      apr: plan.apr,
      minDeposit: plan.minDeposit,
      duration: plan.duration,
      description: plan.description,
      badge: plan.badge
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    let updatedPlans = [...plansList];

    if (editingPlan) {
      // Edit mode
      updatedPlans = updatedPlans.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            name: planForm.name,
            apr: Number(planForm.apr),
            minDeposit: Number(planForm.minDeposit),
            duration: Number(planForm.duration),
            description: planForm.description,
            badge: planForm.badge
          };
        }
        return p;
      });
      triggerNotice('Investment plan updated successfully.');
    } else {
      // Add mode
      const newPlan: InvestmentPlan = {
        id: `plan-${Date.now()}`,
        name: planForm.name,
        apr: Number(planForm.apr),
        minDeposit: Number(planForm.minDeposit),
        duration: Number(planForm.duration),
        description: planForm.description,
        badge: planForm.badge
      };
      updatedPlans.push(newPlan);
      triggerNotice('New investment plan created successfully.');
    }

    localStorage.setItem('musk_plans', JSON.stringify(updatedPlans));
    setPlansList(updatedPlans);
    setShowPlanModal(false);
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this investment plan? Users will no longer see this node.')) {
      const updated = plansList.filter(p => p.id !== id);
      localStorage.setItem('musk_plans', JSON.stringify(updated));
      setPlansList(updated);
      triggerNotice('Investment plan deleted.');
    }
  };

  // Restore default plans
  const handleResetPlans = () => {
    if (confirm('Restore the default suite of 10 industrial plans? This will overwrite changes.')) {
      localStorage.setItem('musk_plans', JSON.stringify(DEFAULT_PLANS));
      setPlansList(DEFAULT_PLANS);
      triggerNotice('Default plans restored.');
    }
  };

  // 5. Payment Methods Config Form
  const handleUpdatePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('musk_payment_config', JSON.stringify(paymentConfig));
    triggerNotice('Payment gateway addresses updated. Users will see these details immediately.');
  };

  const handlePaymentConfigChange = (key: string, value: string) => {
    setPaymentConfig((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // 6. QR Code Image File Uploads
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>, methodKey: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Data = event.target.result as string;
          const updatedQr = { ...qrConfig, [methodKey]: base64Data };
          localStorage.setItem('musk_qr_config', JSON.stringify(updatedQr));
          setQrConfig(updatedQr);
          triggerNotice(`New ${methodKey.toUpperCase()} QR code uploaded and synchronized.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset QR Codes to default state nodes
  const handleResetQrs = () => {
    const defaultQrs = {
      btcQr: 'default_btc',
      usdtTrcQr: 'default_trc',
      usdtErcQr: 'default_erc',
      bankQr: 'default_bank'
    };
    localStorage.setItem('musk_qr_config', JSON.stringify(defaultQrs));
    setQrConfig(defaultQrs);
    triggerNotice('QR configurations reset to standard placeholders.');
  };

  // 7. Manage Announcements
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      text: announcementText,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category: announcementCategory
    };

    const updated = [newAnn, ...announcementsList];
    localStorage.setItem('musk_announcements', JSON.stringify(updated));
    setAnnouncement(updated);
    setAnnouncementText('');
    triggerNotice('Broadcast announcement deployed to all user hubs.');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcementsList.filter(a => a.id !== id);
    localStorage.setItem('musk_announcements', JSON.stringify(updated));
    setAnnouncement(updated);
    triggerNotice('Announcement removed.');
    logActivity('admin@muskinvestment.com', `Deleted system announcement ID: ${id}`, 'Admin');
  };

  // Support Ticket reply & resolve
  const handleReplyTicketAdmin = (ticketId: string, customStatus?: 'Resolved' | 'Closed') => {
    const replyText = ticketReplyTexts[ticketId] || '';
    if (!replyText.trim() && !customStatus) return;

    const saved = getSavedTickets();
    const updated = saved.map(t => {
      if (t.id === ticketId) {
        const replies = [...t.replies];
        if (replyText.trim()) {
          replies.push({
            id: `rep-${Date.now()}`,
            sender: 'admin' as const,
            senderName: 'System Core Admin',
            message: replyText,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16)
          });
        }
        return {
          ...t,
          status: customStatus || ('Pending' as const),
          replies
        };
      }
      return t;
    });

    localStorage.setItem('musk_tickets', JSON.stringify(updated));
    setTicketsList(updated);
    setTicketReplyTexts(prev => ({ ...prev, [ticketId]: '' }));
    
    // Find ticket user
    const targetTicket = saved.find(t => t.id === ticketId);
    if (targetTicket) {
      logActivity('admin@muskinvestment.com', `Replied to ticket: "${targetTicket.subject}"`, 'Admin');
      addNotification(targetTicket.userEmail, 'Support Ticket Response', `An administrator has replied to your ticket: "${targetTicket.subject}".`, 'general');
    }
    
    triggerNotice('Support response dispatched successfully.');
  };

  const handleResolveTicket = (ticketId: string) => {
    const saved = getSavedTickets();
    const updated = saved.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'Resolved' as const };
      }
      return t;
    });
    localStorage.setItem('musk_tickets', JSON.stringify(updated));
    setTicketsList(updated);
    
    const targetTicket = saved.find(t => t.id === ticketId);
    if (targetTicket) {
      logActivity('admin@muskinvestment.com', `Resolved support ticket ID: ${ticketId}`, 'Admin');
      addNotification(targetTicket.userEmail, 'Support Ticket Resolved', `Your ticket "${targetTicket.subject}" has been marked as resolved.`, 'general');
    }
    triggerNotice('Support ticket marked as Resolved.');
  };

  // Delete User Account
  const handleDeleteUser = (id: string) => {
    if (confirm('CRITICAL ACTION: Are you sure you want to permanently delete this investor account and purge their transactions? This cannot be undone.')) {
      const updated = usersList.filter(u => u.id !== id);
      localStorage.setItem('musk_users', JSON.stringify(updated));
      setUsersList(updated);
      logActivity('admin@muskinvestment.com', `Deleted user account ID: ${id}`, 'Admin');
      triggerNotice('Investor record permanently purged.');
    }
  };

  // Save System settings
  const handleUpdateSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('musk_system_settings', JSON.stringify(systemSettings));
    logActivity('admin@muskinvestment.com', 'Modified global system status and maintenance metrics', 'Admin');
    triggerNotice('Global website parameters updated instantly.');
  };

  // Filtering lists
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

  const filteredDeposits = depositsList.filter(dep => {
    if (depositFilter === 'All') return true;
    return dep.status === depositFilter;
  });

  const filteredWithdrawals = withdrawalsList.filter(wth => {
    if (withdrawalFilter === 'All') return true;
    return wth.status === withdrawalFilter;
  });

  // Calculate Statistics values
  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter(u => u.status === 'Active').length;
  const totalDepositsSum = depositsList.filter(d => d.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingDepositsCount = depositsList.filter(d => d.status === 'Pending').length;
  const approvedDepositsCount = depositsList.filter(d => d.status === 'Approved').length;
  const totalWithdrawalsSum = withdrawalsList.filter(w => w.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);

  const sidebarItems = [
    { id: 'stats', label: 'Overview Stats', icon: TrendingUp },
    { id: 'users', label: 'Manage Users', icon: Users, badge: usersList.length },
    { id: 'deposits', label: 'Deposits Ledger', icon: Download, badge: depositsList.filter(d => d.status === 'Pending').length },
    { id: 'withdrawals', label: 'Withdrawals Ledger', icon: Upload, badge: withdrawalsList.filter(w => w.status === 'Pending').length },
    { id: 'plans', label: 'Plans Editor', icon: FileText, badge: plansList.length },
    { id: 'payments', label: 'Gateways & QRs', icon: Key },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: announcementsList.length },
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare, badge: ticketsList.filter(t => t.status === 'Pending').length },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'audits', label: 'Audit Logs', icon: Activity, badge: activitiesList.length },
  ];

  return (
    <div id="admin-dashboard-wrapper" className="min-h-screen text-gray-200">
      
      {/* Mobile Sticky Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#040212]/95 backdrop-blur-md border-b border-purple-500/10 px-4 py-3 sticky top-0 z-40">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-xl bg-purple-950/20 border border-purple-500/10 text-purple-300 hover:text-white hover:bg-purple-600/20 active:scale-95 transition-all flex items-center justify-center"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-xs font-mono font-black tracking-wider uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
          Secure Admin Desk
        </span>
        <button 
          onClick={() => syncDatabase()}
          className="relative p-2 rounded-xl text-gray-400 hover:text-white"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 text-left">
        {/* Desktop Sidebar Panel */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-[#05041a]/60 backdrop-blur-md rounded-2xl border border-purple-500/10 p-4 space-y-4 shadow-xl shadow-black/40">
            <div className="px-2 py-1 border-b border-white/5 pb-3">
              <h3 className="text-xs font-mono font-black tracking-widest text-red-400 uppercase">
                Admin Hub
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">Select operation node</p>
            </div>
            
            <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-between border ${
                      isActive 
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-950/20' 
                        : 'bg-transparent text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-purple-500/20 border border-purple-500/30 text-purple-400 font-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Drawer Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-[#040212] border-r border-purple-500/10 z-50 p-5 flex flex-col md:hidden text-left"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Admin Operations</h3>
                    <p className="text-[10px] text-red-400 font-mono">System Core Hub</p>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drawer Items List */}
                <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsSidebarOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                          isActive 
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-md shadow-purple-950/25' 
                            : 'bg-[#09071f]/40 text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Drawer Footer */}
                <div className="border-t border-white/5 pt-4 mt-4">
                  <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                    <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
                    <div>
                      <p className="text-[8px] text-gray-500 uppercase tracking-wider font-semibold">Security Shield</p>
                      <p className="text-[10px] font-bold text-emerald-400 font-mono">System Secure</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Right Main Content Panel */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Admin Notice Area */}
          <AnimatePresence>
            {notice.text && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-6 right-6 z-50 rounded-xl px-5 py-4 border shadow-2xl flex items-center gap-3 ${
                  notice.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {notice.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span className="text-sm font-semibold">{notice.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Control Center Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-red-950/10 via-[#0a071d]/60 to-transparent p-5 sm:p-6 rounded-2xl border border-red-500/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">Secure Root Admin Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Administrative Control Center
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                <span>Monitor, verify, approve deposits, adjust contract specifications, manage user lists, and post bulletins.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={syncDatabase}
                className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold border border-white/10 transition-all min-h-[40px]"
              >
                <RefreshCw className="h-4 w-4 text-purple-400" />
                <span className="hidden sm:inline">Sync Ledger</span>
              </button>
              
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-xs font-bold border border-red-500/20 text-red-400 transition-all min-h-[40px]"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Tab Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
        
        {/* ==================== TAB 1: OVERVIEW STATISTICS ==================== */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Platform Summary Terminal</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              
              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <Users className="h-8 w-8 text-purple-400" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Users</p>
                <p className="text-2xl font-black text-white font-mono">{totalUsersCount}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Active Users</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">{activeUsersCount}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <DollarSign className="h-8 w-8 text-indigo-400" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Deposits</p>
                <p className="text-2xl font-black text-white font-mono">${totalDepositsSum.toLocaleString()}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <Clock className="h-8 w-8 text-amber-400 animate-pulse" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Pending Deposits</p>
                <p className="text-2xl font-black text-amber-400 font-mono">{pendingDepositsCount}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-teal-400" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Approved Deposits</p>
                <p className="text-2xl font-black text-teal-400 font-mono">{approvedDepositsCount}</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-2">
                <Upload className="h-8 w-8 text-pink-400" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Withdrawals</p>
                <p className="text-2xl font-black text-white font-mono">${totalWithdrawalsSum.toLocaleString()}</p>
              </div>

            </div>

            {/* Quick action helper guidelines */}
            <div className="rounded-xl border border-white/5 bg-[#09071f]/50 p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="space-y-1 text-left flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-purple-400" /> Instant Real-time Synchronization
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Any values adjusted here (such as Bitcoin addresses, newly added plans, active bulletins, and approved requests) are synchronized and immediately rendered on the investor hubs.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('deposits')}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white px-5 py-3 shadow-lg shadow-purple-500/15 min-h-[44px]"
                >
                  Review Pending Deposits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: USER MANAGEMENT ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-white">Registered Investors Hub</h3>
              
              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Search className="h-4 w-4" /></span>
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none min-h-[36px]"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/25">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 font-bold">Investor info</th>
                    <th className="p-4 font-bold">Contact</th>
                    <th className="p-4 font-bold">Registration Date</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                        No investor records matched search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            <p className="text-[10px] text-purple-400 font-mono">{u.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-300 font-mono">{u.phone}</p>
                          <p className="text-[10px] text-gray-500 italic max-w-[150px] truncate">{u.address}</p>
                        </td>
                        <td className="p-4 text-gray-400 font-mono">{u.dateCreated}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono border ${
                            u.status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all inline-flex items-center gap-1 min-h-[30px] ${
                              u.status === 'Active' 
                                ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {u.status === 'Active' ? (
                              <>
                                <UserMinus className="h-3.5 w-3.5" /> Suspend Account
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5" /> Activate Account
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: DEPOSITS LEDGER ==================== */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-white">Deposit Ingress Verification Panel</h3>
              
              {/* Filter pills */}
              <div className="inline-flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
                {['All', 'Pending', 'Approved', 'Rejected'].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setDepositFilter(statusOption as any)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      depositFilter === statusOption ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredDeposits.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/25 p-8 text-center text-gray-500 italic">
                  No deposits enqueued under status filter: {depositFilter}.
                </div>
              ) : (
                filteredDeposits.map((dep) => (
                  <div key={dep.id} className="rounded-xl border border-white/5 bg-black/30 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Left info block */}
                    <div className="text-left space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{dep.planName}</span>
                        <span className="text-[10px] font-mono text-gray-400 font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                          {dep.paymentMethod}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-400">
                        <p>Date: <span className="font-mono text-gray-200">{dep.date}</span></p>
                        <p>Reference: <span className="font-mono text-purple-300 font-semibold">{dep.referenceNo}</span></p>
                        {dep.transactionId && <p className="col-span-2">Transaction ID: <span className="font-mono text-gray-300 break-all">{dep.transactionId}</span></p>}
                        {dep.notes && <p className="col-span-2 italic text-gray-500">Notes: "{dep.notes}"</p>}
                      </div>

                      {/* Display Base64 Screenshot proof if uploaded */}
                      {dep.screenshotUrl && (
                        <div className="pt-2">
                          <p className="text-[10px] uppercase font-bold text-purple-400 font-mono mb-1">Receipt Screenshot:</p>
                          <a href={dep.screenshotUrl} target="_blank" rel="noreferrer" className="inline-block hover:opacity-90">
                            <img 
                              src={dep.screenshotUrl} 
                              alt="Receipt validation" 
                              className="max-h-24 rounded-lg border border-purple-500/20 shadow-md object-cover hover:border-purple-500/40" 
                            />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right Amount + approval action buttons */}
                    <div className="flex sm:flex-row md:flex-col items-end gap-3 justify-between w-full md:w-auto border-t border-white/5 md:border-0 pt-4 md:pt-0">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Deposited Principal</p>
                        <p className="text-lg font-black text-white font-mono">${dep.amount.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {dep.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-1.5 min-h-[32px]"
                            >
                              <X className="h-4 w-4" /> Reject
                            </button>
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1.5 min-h-[32px] shadow-md shadow-emerald-500/10"
                            >
                              <Check className="h-4 w-4" /> Approve
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono border ${
                            dep.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dep.status === 'Approved' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {dep.status}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: WITHDRAWALS LEDGER ==================== */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-white">Withdrawal Ingress Review Panel</h3>
              
              {/* Filter pills */}
              <div className="inline-flex rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
                {['All', 'Pending', 'Approved', 'Rejected'].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setWithdrawalFilter(statusOption as any)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      withdrawalFilter === statusOption ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredWithdrawals.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/25 p-8 text-center text-gray-500 italic">
                  No withdrawal requests matched filter: {withdrawalFilter}.
                </div>
              ) : (
                filteredWithdrawals.map((wth) => (
                  <div key={wth.id} className="rounded-xl border border-white/5 bg-black/30 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Left withdrawal info */}
                    <div className="text-left space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{wth.paymentMethod} Request</span>
                        <span className="text-[10px] font-mono text-purple-400">{wth.referenceNo}</span>
                      </div>
                      <p className="text-xs text-gray-300">Investor: <span className="font-mono text-white font-bold">{wth.userEmail}</span></p>
                      <p className="text-xs text-gray-400">Date Initiated: <span className="font-mono">{wth.date}</span></p>
                      <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono text-gray-400 max-w-lg break-all">
                        <span className="text-[9px] uppercase block text-gray-500 font-bold mb-0.5">Receiving Destination:</span>
                        {wth.addressDetails}
                      </div>
                    </div>

                    {/* Right amount & approve buttons */}
                    <div className="flex sm:flex-row md:flex-col items-end gap-3 justify-between w-full md:w-auto border-t border-white/5 md:border-0 pt-4 md:pt-0">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Requesting Sum</p>
                        <p className="text-lg font-black text-red-400 font-mono">-${wth.amount.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {wth.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleRejectWithdrawal(wth.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-1.5 min-h-[32px]"
                            >
                              <X className="h-4 w-4" /> Reject
                            </button>
                            <button
                              onClick={() => handleApproveWithdrawal(wth.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white flex items-center gap-1.5 min-h-[32px] shadow-md shadow-emerald-500/10"
                            >
                              <Check className="h-4 w-4" /> Approve
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono border ${
                            wth.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${wth.status === 'Approved' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {wth.status}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 5: PLANS EDITOR ==================== */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Investment Tiers Database</h3>
                <p className="text-xs text-gray-400">Configure parameters of available yield-generating assets.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetPlans}
                  className="rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold border border-white/5 transition-all min-h-[36px]"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={handleOpenAddPlan}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-500/10 min-h-[36px]"
                >
                  <Plus className="h-4 w-4" /> Add New Tier
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plansList.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-white/5 bg-black/30 p-5 flex flex-col justify-between space-y-4 relative">
                  <div className="absolute top-4 right-4 text-[10px] font-mono uppercase bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                    {plan.badge}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white pr-12">{plan.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-3">{plan.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono text-gray-400 border-t border-white/5">
                      <div>
                        <span className="block text-gray-500">Yield APR</span>
                        <span className="text-xs font-bold text-white">{plan.apr}%</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Min Ingress</span>
                        <span className="text-xs font-bold text-emerald-400">${plan.minDeposit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Maturity</span>
                        <span className="text-xs font-bold text-white">{plan.duration} Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="flex-1 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 text-[11px] font-bold text-gray-300 flex items-center justify-center gap-1.5 border border-white/10 transition-all min-h-[30px]"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit Parameters
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="rounded-lg bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-[11px] font-bold text-red-400 border border-red-500/15 transition-all min-h-[30px]"
                      title="Delete plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan Editor Dialog Modal */}
            {showPlanModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-purple-500/20 bg-[#0c0a24] p-6 max-w-md w-full text-left space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-base font-bold text-white">
                      {editingPlan ? 'Edit Contract Parameters' : 'Create New Investment Tier'}
                    </h3>
                    <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlan} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-gray-400">Plan Name</label>
                      <input
                        type="text"
                        required
                        value={planForm.name}
                        onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                        placeholder="e.g. Hyperion Fusion Reactor Grid"
                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:border-purple-500/45 focus:outline-none min-h-[40px]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-gray-400">APR %</label>
                        <input
                          type="number"
                          required
                          step="0.1"
                          value={planForm.apr}
                          onChange={(e) => setPlanForm({ ...planForm, apr: parseFloat(e.target.value) })}
                          className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-purple-500/45 focus:outline-none min-h-[40px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Min Ingress</label>
                        <input
                          type="number"
                          required
                          value={planForm.minDeposit}
                          onChange={(e) => setPlanForm({ ...planForm, minDeposit: parseInt(e.target.value) })}
                          className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-purple-500/45 focus:outline-none min-h-[40px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Days</label>
                        <input
                          type="number"
                          required
                          value={planForm.duration}
                          onChange={(e) => setPlanForm({ ...planForm, duration: parseInt(e.target.value) })}
                          className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-2.5 text-xs text-white focus:border-purple-500/45 focus:outline-none min-h-[40px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[11px] font-bold uppercase text-gray-400">Custom Badge</label>
                        <input
                          type="text"
                          required
                          value={planForm.badge}
                          onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                          placeholder="e.g. Launch Peak, Robot Tech"
                          className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-purple-500/45 focus:outline-none min-h-[40px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-gray-400">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={planForm.description}
                        onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                        placeholder="Explain technical characteristics or compound details of this node..."
                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-purple-500/45 focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPlanModal(false)}
                        className="w-1/3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-semibold text-white transition-all min-h-[40px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg transition-all min-h-[40px]"
                      >
                        Save Parameter Settings
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 6: PAYMENT GATEWAYS & QR CODES ==================== */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Address Specifications Form */}
            <form onSubmit={handleUpdatePaymentConfig} className="lg:col-span-6 rounded-2xl border border-white/5 bg-black/30 p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="h-4.5 w-4.5 text-purple-400" /> Gateway Ingress Parameters
                </h3>
                <p className="text-xs text-gray-400 font-light">
                  Specify receiving banking wire details and crypto wallet addresses. These update on deposit cards instantly.
                </p>
              </div>

              <div className="space-y-4">
                {/* Bank Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400 block">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.bankName || ''}
                    onChange={(e) => handlePaymentConfigChange('bankName', e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                {/* Account Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400 block">Account Name / Beneficiary</label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.accountName || ''}
                    onChange={(e) => handlePaymentConfigChange('accountName', e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                {/* Account Number & Routing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-gray-400 block">Account Number</label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.accountNumber || ''}
                      onChange={(e) => handlePaymentConfigChange('accountNumber', e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-gray-400 block">Routing Transit Code</label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.routingNumber || ''}
                      onChange={(e) => handlePaymentConfigChange('routingNumber', e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Bitcoin Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400 block">Bitcoin (BTC) Receiving Wallet</label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.btcAddress || ''}
                    onChange={(e) => handlePaymentConfigChange('btcAddress', e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white font-mono focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                {/* USDT TRC20 Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400 block">USDT (TRC20) Receiving Wallet</label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.usdtTrcAddress || ''}
                    onChange={(e) => handlePaymentConfigChange('usdtTrcAddress', e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white font-mono focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                {/* USDT ERC20 Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400 block">USDT (ERC20) Receiving Wallet</label>
                  <input
                    type="text"
                    required
                    value={paymentConfig.usdtErcAddress || ''}
                    onChange={(e) => handlePaymentConfigChange('usdtErcAddress', e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white font-mono focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <button
                id="update-payment-gateways-btn"
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg transition-all min-h-[44px]"
              >
                Save Gateway Modifications
              </button>
            </form>

            {/* Right Column: QR Codes Upload Panel */}
            <div className="lg:col-span-6 rounded-2xl border border-white/5 bg-black/30 p-5 sm:p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Image className="h-4.5 w-4.5 text-indigo-400" /> QR Code Visualizer
                  </h3>
                  <p className="text-xs text-gray-400 font-light">Upload customized QR codes that appear inside payment workflows.</p>
                </div>
                <button
                  onClick={handleResetQrs}
                  className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-white border border-white/5 transition-all min-h-[28px]"
                >
                  Reset Codes
                </button>
              </div>

              {/* Hidden file input nodes */}
              <input type="file" accept="image/*" ref={fileBtcQrRef} onChange={(e) => handleQrUpload(e, 'btcQr')} className="hidden" />
              <input type="file" accept="image/*" ref={fileTrcQrRef} onChange={(e) => handleQrUpload(e, 'usdtTrcQr')} className="hidden" />
              <input type="file" accept="image/*" ref={fileErcQrRef} onChange={(e) => handleQrUpload(e, 'usdtErcQr')} className="hidden" />
              <input type="file" accept="image/*" ref={fileBankQrRef} onChange={(e) => handleQrUpload(e, 'bankQr')} className="hidden" />

              {/* Interactive grid of QR Code Card upload triggers */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* BTC Qr */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Bitcoin QR Code</span>
                  <div className="h-28 w-28 bg-white/5 rounded-lg mx-auto flex items-center justify-center relative overflow-hidden border border-white/10">
                    {qrConfig.btcQr && qrConfig.btcQr !== 'default_btc' ? (
                      <img src={qrConfig.btcQr} alt="BTC QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl">₿</span>
                        <p className="text-[9px] text-gray-500 mt-1">Default Placeholder</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileBtcQrRef.current?.click()}
                    className="w-full rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold text-[10px] py-2 border border-purple-500/20 transition-all min-h-[30px]"
                  >
                    Upload QR Image
                  </button>
                </div>

                {/* USDT TRC Qr */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400">USDT TRC20 QR Code</span>
                  <div className="h-28 w-28 bg-white/5 rounded-lg mx-auto flex items-center justify-center relative overflow-hidden border border-white/10">
                    {qrConfig.usdtTrcQr && qrConfig.usdtTrcQr !== 'default_trc' ? (
                      <img src={qrConfig.usdtTrcQr} alt="TRC QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl text-emerald-400">₮</span>
                        <p className="text-[9px] text-gray-500 mt-1">Default Placeholder</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileTrcQrRef.current?.click()}
                    className="w-full rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold text-[10px] py-2 border border-purple-500/20 transition-all min-h-[30px]"
                  >
                    Upload QR Image
                  </button>
                </div>

                {/* USDT ERC Qr */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400">USDT ERC20 QR Code</span>
                  <div className="h-28 w-28 bg-white/5 rounded-lg mx-auto flex items-center justify-center relative overflow-hidden border border-white/10">
                    {qrConfig.usdtErcQr && qrConfig.usdtErcQr !== 'default_erc' ? (
                      <img src={qrConfig.usdtErcQr} alt="ERC QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl text-indigo-400">♦</span>
                        <p className="text-[9px] text-gray-500 mt-1">Default Placeholder</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileErcQrRef.current?.click()}
                    className="w-full rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold text-[10px] py-2 border border-purple-500/20 transition-all min-h-[30px]"
                  >
                    Upload QR Image
                  </button>
                </div>

                {/* Bank Wire Qr */}
                <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Bank Transfer QR Code</span>
                  <div className="h-28 w-28 bg-white/5 rounded-lg mx-auto flex items-center justify-center relative overflow-hidden border border-white/10">
                    {qrConfig.bankQr && qrConfig.bankQr !== 'default_bank' ? (
                      <img src={qrConfig.bankQr} alt="Bank QR" className="h-full w-full object-contain" />
                    ) : (
                      <div className="text-center p-2">
                        <span className="text-2xl text-indigo-400">🏦</span>
                        <p className="text-[9px] text-gray-500 mt-1">Default Placeholder</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileBankQrRef.current?.click()}
                    className="w-full rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold text-[10px] py-2 border border-purple-500/20 transition-all min-h-[30px]"
                  >
                    Upload QR Image
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 7: ANNOUNCEMENT MANAGER ==================== */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Create Announcement */}
            <form onSubmit={handleCreateAnnouncement} className="lg:col-span-5 rounded-2xl border border-white/5 bg-black/30 p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="h-4.5 w-4.5 text-purple-400" /> Deploy Bulletin
                </h3>
                <p className="text-xs text-gray-400">Create global notifications that instantly render on user dashboard spaces.</p>
              </div>

              {/* Announcement text */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-400 block">Announcement Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Bitcoin address updated to optimize escrow throughput..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-400 block">Classification Category</label>
                <select
                  value={announcementCategory}
                  onChange={(e) => setAnnouncementCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                >
                  <option value="Update">Update / Modifications</option>
                  <option value="Alert">Alert / Notice</option>
                  <option value="Maintenance">Scheduled Maintenance</option>
                  <option value="General">General Broadcast</option>
                </select>
              </div>

              <button
                id="deploy-bulletin-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white py-3 shadow-lg transition-all min-h-[40px]"
              >
                <span>Deploy Bulletin</span>
                <Check className="h-4 w-4" />
              </button>
            </form>

            {/* Right Column: Existing Announcements Ledger */}
            <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-black/30 p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Bulletin Broadcast Queue</h3>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {announcementsList.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-8">No active bulletins currently deployed on client portals.</p>
                ) : (
                  announcementsList.map((ann) => (
                    <div key={ann.id} className="rounded-xl border border-white/5 bg-black/40 p-4 flex justify-between items-start gap-4">
                      <div className="text-left space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            ann.category === 'Alert' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            ann.category === 'Maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {ann.category}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500">{ann.date}</span>
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed font-light">{ann.text}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="rounded-lg bg-red-500/10 hover:bg-red-500/20 p-2 text-red-400 border border-red-500/10 transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
                        title="Delete announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 8: SUPPORT TICKETS MANAGER ==================== */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-purple-400" /> Active Support Desk Enqueue
                </h3>
                <p className="text-xs text-gray-400 font-light">
                  Respond to technical inquiries, verify wire transfers, and address account queries.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ticketsList.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/25 p-8 text-center text-gray-500 italic">
                  No enqueued support tickets found.
                </div>
              ) : (
                ticketsList.map((ticket) => (
                  <div key={ticket.id} className="rounded-xl border border-white/5 bg-black/30 p-5 space-y-4">
                    {/* Ticket Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
                      <div className="text-left space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">{ticket.subject}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            ticket.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {ticket.priority} Priority
                          </span>
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                            {ticket.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          From: <span className="font-mono text-gray-200">{ticket.userName} ({ticket.userEmail})</span> • {ticket.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono border ${
                          ticket.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                          ticket.status === 'Closed' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-400' : ticket.status === 'Closed' ? 'bg-gray-400' : 'bg-amber-400'}`} />
                          {ticket.status}
                        </span>
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold min-h-[26px]"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Stack */}
                    <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 max-h-60 overflow-y-auto">
                      {/* Initial Message */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono text-gray-500 uppercase">{ticket.userName}</p>
                        <p className="text-xs text-gray-200 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/5">{ticket.message}</p>
                      </div>

                      {/* Replies */}
                      {ticket.replies && ticket.replies.map((reply: any) => (
                        <div key={reply.id} className={`space-y-1 pl-6 ${reply.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                          <p className="text-[10px] font-mono text-gray-500 uppercase">
                            {reply.sender === 'admin' ? 'System Support Core' : ticket.userName} • {reply.date}
                          </p>
                          <p className={`text-xs text-gray-200 leading-relaxed p-2.5 rounded-lg border inline-block text-left max-w-xl ${
                            reply.sender === 'admin' ? 'bg-purple-600/15 border-purple-500/20' : 'bg-white/[0.02] border-white/5'
                          }`}>
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Response Form */}
                    {ticket.status !== 'Closed' && (
                      <div className="flex gap-2 items-end pt-2">
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            placeholder="Type a professional support response..."
                            value={ticketReplyTexts[ticket.id] || ''}
                            onChange={(e) => setTicketReplyTexts({ ...ticketReplyTexts, [ticket.id]: e.target.value })}
                            className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-xs text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none min-h-[38px]"
                          />
                        </div>
                        <button
                          onClick={() => handleReplyTicketAdmin(ticket.id)}
                          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white px-5 py-2.5 shadow-lg min-h-[38px] transition-all"
                        >
                          Send Response
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 9: WEBSITE & SYSTEM SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleUpdateSystemSettings} className="rounded-2xl border border-white/5 bg-black/30 p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-purple-400" /> Platform Operations Settings
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Configure brand labels, operational service gates, and maintenance modes. Changes reflect dynamically across user screens.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Branding Block */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">Branding & Meta Specifications</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400">Website Title Name</label>
                  <input
                    type="text"
                    required
                    value={systemSettings.websiteName || ''}
                    onChange={(e) => setSystemSettingsState({ ...systemSettings, websiteName: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400">Support Desk Hotline</label>
                  <input
                    type="text"
                    required
                    value={systemSettings.supportPhone || ''}
                    onChange={(e) => setSystemSettingsState({ ...systemSettings, supportPhone: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400">Support Desks Email</label>
                  <input
                    type="email"
                    required
                    value={systemSettings.supportEmail || ''}
                    onChange={(e) => setSystemSettingsState({ ...systemSettings, supportEmail: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400">Company Registered HQ Address</label>
                  <input
                    type="text"
                    required
                    value={systemSettings.companyAddress || ''}
                    onChange={(e) => setSystemSettingsState({ ...systemSettings, companyAddress: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-gray-400">Footer Attribution Notice</label>
                  <textarea
                    rows={3}
                    required
                    value={systemSettings.footerText || ''}
                    onChange={(e) => setSystemSettingsState({ ...systemSettings, footerText: e.target.value })}
                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-xs text-white focus:border-purple-500/50 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Status toggles block */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-400">Operational Gatekeepers</h4>
                
                <div className="divide-y divide-white/5 bg-black/25 rounded-2xl border border-white/5 p-4 space-y-4">
                  
                  {/* Maintenance Mode */}
                  <div className="flex justify-between items-center pb-2">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">System Maintenance Lockdown</p>
                      <p className="text-[10px] text-gray-400">Activate to restrict public access during database upgrades.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode || false}
                        onChange={(e) => setSystemSettingsState({ ...systemSettings, maintenanceMode: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Registrations Gate */}
                  <div className="flex justify-between items-center py-3">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">Open Public Registrations</p>
                      <p className="text-[10px] text-gray-400">Toggle whether new users can instantiate accounts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={systemSettings.registrationOpen !== false}
                        onChange={(e) => setSystemSettingsState({ ...systemSettings, registrationOpen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Deposit Gate */}
                  <div className="flex justify-between items-center py-3">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">Accept Financial Deposits</p>
                      <p className="text-[10px] text-gray-400">Activate to allow receipt uploads and plan configurations.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={systemSettings.depositOpen !== false}
                        onChange={(e) => setSystemSettingsState({ ...systemSettings, depositOpen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Withdraw Gate */}
                  <div className="flex justify-between items-center py-3">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">Authorize Capital Withdrawals</p>
                      <p className="text-[10px] text-gray-400">Allow users to file withdrawal requests on active balances.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={systemSettings.withdrawalOpen !== false}
                        onChange={(e) => setSystemSettingsState({ ...systemSettings, withdrawalOpen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* Referrals Gate */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white">Affiliate Commission System</p>
                      <p className="text-[10px] text-gray-400">Enable automated referral program analytics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={systemSettings.referralProgramOpen !== false}
                        onChange={(e) => setSystemSettingsState({ ...systemSettings, referralProgramOpen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                </div>
              </div>

            </div>

            <button
              id="save-system-settings-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg transition-all min-h-[44px]"
            >
              <span>Commit System Parameters</span>
              <Check className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* ==================== TAB 10: AUDIT LOGS VIEWER ==================== */}
        {activeTab === 'audits' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-purple-400" /> Platform Security Audit Trail
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Continuous chronological log of administrator operations and critical investor balance shifts.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/25">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-gray-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 font-bold">Actor Account</th>
                    <th className="p-4 font-bold">Logged Operation / Action</th>
                    <th className="p-4 font-bold">Execution Date</th>
                    <th className="p-4 font-bold">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {activitiesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                        Security logs empty. Initiating next epoch.
                      </td>
                    </tr>
                  ) : (
                    activitiesList.map((log) => (
                      <tr key={log.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 text-purple-300 font-bold">{log.userEmail}</td>
                        <td className="p-4 text-gray-200">{log.action}</td>
                        <td className="p-4 text-gray-400">{log.date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.type === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
