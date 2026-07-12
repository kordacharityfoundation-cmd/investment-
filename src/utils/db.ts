import { InvestmentPlan } from '../types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Suspended';
  dateCreated: string;
  password?: string;
  referredBy?: string;
}

export interface WithdrawalRequest {
  id: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  addressDetails: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  referenceNo: string;
}

export interface PaymentMethodsConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  btcAddress: string;
  usdtTrcAddress: string;
  usdtErcAddress: string;
}

export interface QrCodesConfig {
  btcQr: string; // Base64 or placeholder keyword
  usdtTrcQr: string;
  usdtErcQr: string;
  bankQr: string;
}

export interface Announcement {
  id: string;
  text: string;
  date: string;
  category: 'Update' | 'Alert' | 'Maintenance' | 'General';
}

// Default 10 investment plans
export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'plan-1',
    name: 'Boring Venture Node',
    apr: 8.5,
    minDeposit: 1000,
    duration: 30,
    description: 'Entry-level commitment plan exploring automated high-yield tunneling & transit routing tech.',
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

// Default users
export const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Elon Musk',
    email: 'elon@tesla.com',
    phone: '+1 (555) 420-6969',
    address: '1 Starbase Blvd, Boca Chica, TX',
    status: 'Active',
    dateCreated: '2026-06-01',
    password: 'password123'
  },
  {
    id: 'user-2',
    name: 'Charity Admin',
    email: 'kordacharityfoundation@gmail.com',
    phone: '+380 (50) 123-4567',
    address: '12 Kiev Street, Ukraine',
    status: 'Active',
    dateCreated: '2026-07-01',
    password: '#Deemainzino1'
  },
  {
    id: 'user-3',
    name: 'Gwynne Shotwell',
    email: 'gwynne@spacex.com',
    phone: '+1 (555) 987-6543',
    address: 'SpaceX HQ, Hawthorne, CA',
    status: 'Active',
    dateCreated: '2026-06-15',
    password: 'password123'
  },
  {
    id: 'user-4',
    name: 'Starbase Intern',
    email: 'starbase_intern@spacex.com',
    phone: '+1 (555) 123-4567',
    address: 'Mars Launch Site, Boca Chica, TX',
    status: 'Suspended',
    dateCreated: '2026-07-05',
    password: 'password123'
  }
];

// Default announcements
export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    text: 'Bitcoin deposit address has been optimized. Please verify the new address before initiating transfers.',
    date: '2026-07-11 18:00',
    category: 'Update'
  },
  {
    id: 'ann-2',
    text: 'Weekly network security audit completed. All node escrow deposits successfully validated on the secure ledger.',
    date: '2026-07-12 09:15',
    category: 'General'
  }
];

// Default withdrawals
export const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [];

// Default payment methods config
export const DEFAULT_PAYMENT_CONFIG: PaymentMethodsConfig = {
  bankName: 'Starbase Galactic Credit Union',
  accountName: 'Musk Investment Corp',
  accountNumber: '184-7392-1029',
  routingNumber: '021000021',
  btcAddress: '1MuSk77vXz8S8VPrAdAr8S73v48yPnC9E9',
  usdtTrcAddress: 'TX9MuSkTRC20PlAtForMe198473210vY9s',
  usdtErcAddress: '0x9a7bMuSkERC20F000de739D7Fbe41983021'
};

// Default QR code placeholders
export const DEFAULT_QR_CONFIG: QrCodesConfig = {
  btcQr: 'default_btc',
  usdtTrcQr: 'default_trc',
  usdtErcQr: 'default_erc',
  bankQr: 'default_bank'
};

// Initialization utility
export interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  message: string;
  date: string;
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  replies: Array<{
    id: string;
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    date: string;
  }>;
}

export interface ChatMessage {
  id: string;
  userEmail: string;
  userName: string;
  sender: 'user' | 'admin';
  message: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  date: string;
  type: 'User' | 'Admin';
}

export interface NotificationItem {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: string;
}

export interface SystemSettings {
  websiteName: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  footerText: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  depositOpen: boolean;
  withdrawalOpen: boolean;
  referralProgramOpen: boolean;
}

export const DEFAULT_TICKETS: SupportTicket[] = [];

export const DEFAULT_CHATS: ChatMessage[] = [];

export const DEFAULT_ACTIVITIES: ActivityLog[] = [];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  websiteName: 'Musk Investment',
  supportEmail: 'support@muskinvestment.com',
  supportPhone: '+1 (800) 555-MUSK',
  companyAddress: 'Starbase Launch Facility, Boca Chica, Texas, USA',
  footerText: '© 2026 Musk Investment. Designed for professional staking and high-throughput technological asset compounding. Backed by automated aerospace energy allocation pools.',
  maintenanceMode: false,
  registrationOpen: true,
  depositOpen: true,
  withdrawalOpen: true,
  referralProgramOpen: true
};

export function initializeDatabase() {
  if (!localStorage.getItem('musk_plans')) {
    localStorage.setItem('musk_plans', JSON.stringify(DEFAULT_PLANS));
  }
  if (!localStorage.getItem('musk_users')) {
    localStorage.setItem('musk_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('musk_announcements')) {
    localStorage.setItem('musk_announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem('musk_withdrawals')) {
    localStorage.setItem('musk_withdrawals', JSON.stringify(DEFAULT_WITHDRAWALS));
  }
  if (!localStorage.getItem('musk_payment_config')) {
    localStorage.setItem('musk_payment_config', JSON.stringify(DEFAULT_PAYMENT_CONFIG));
  }
  if (!localStorage.getItem('musk_qr_config')) {
    localStorage.setItem('musk_qr_config', JSON.stringify(DEFAULT_QR_CONFIG));
  }
  if (!localStorage.getItem('musk_tickets')) {
    localStorage.setItem('musk_tickets', JSON.stringify(DEFAULT_TICKETS));
  }
  if (!localStorage.getItem('musk_chats')) {
    localStorage.setItem('musk_chats', JSON.stringify(DEFAULT_CHATS));
  }
  if (!localStorage.getItem('musk_activities')) {
    localStorage.setItem('musk_activities', JSON.stringify(DEFAULT_ACTIVITIES));
  }
  if (!localStorage.getItem('musk_notifications')) {
    localStorage.setItem('musk_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem('musk_system_settings')) {
    localStorage.setItem('musk_system_settings', JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  }
}

// Accessor helpers
export function getSavedPlans(): InvestmentPlan[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_plans') || '[]');
}

export function getSavedUsers(): AdminUser[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_users') || '[]');
}

export function getSavedAnnouncements(): Announcement[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_announcements') || '[]');
}

export function getSavedWithdrawals(): WithdrawalRequest[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_withdrawals') || '[]');
}

export function getPaymentConfig(): PaymentMethodsConfig {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_payment_config') || '{}');
}

export function getQrConfig(): QrCodesConfig {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_qr_config') || '{}');
}

export function getSavedTickets(): SupportTicket[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_tickets') || '[]');
}

export function getSavedChats(): ChatMessage[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_chats') || '[]');
}

export function getSavedActivities(): ActivityLog[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_activities') || '[]');
}

export function getSavedNotifications(): NotificationItem[] {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_notifications') || '[]');
}

export function getSystemSettings(): SystemSettings {
  initializeDatabase();
  return JSON.parse(localStorage.getItem('musk_system_settings') || '{}');
}

export function logActivity(userEmail: string, action: string, type: 'User' | 'Admin' = 'User') {
  initializeDatabase();
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('musk_activities') || '[]');
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userEmail,
    action,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    type
  };
  localStorage.setItem('musk_activities', JSON.stringify([newLog, ...logs]));
}

export function addNotification(userEmail: string, title: string, message: string, type: string) {
  initializeDatabase();
  const nots: NotificationItem[] = JSON.parse(localStorage.getItem('musk_notifications') || '[]');
  const newNot: NotificationItem = {
    id: `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userEmail,
    title,
    message,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    isRead: false,
    type
  };
  localStorage.setItem('musk_notifications', JSON.stringify([newNot, ...nots]));
}
