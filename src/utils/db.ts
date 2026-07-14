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
  role?: string;
  isAdmin?: boolean;
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
  showBank?: boolean;
  showBtc?: boolean;
  showTrc?: boolean;
  showErc?: boolean;
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
export const DEFAULT_USERS: AdminUser[] = [];

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
  usdtErcAddress: '0x9a7bMuSkERC20F000de739D7Fbe41983021',
  showBank: true,
  showBtc: true,
  showTrc: true,
  showErc: true
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


