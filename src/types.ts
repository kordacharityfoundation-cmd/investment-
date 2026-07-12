export interface InvestmentPlan {
  id: string;
  name: string;
  apr: number; // e.g. 15 for 15%
  minDeposit: number;
  duration: number; // in days
  description: string;
  badge: string;
}

export interface HowItWorksStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
}

export interface Statistic {
  id: string;
  value: string;
  targetValue: number;
  suffix: string;
  label: string;
  description: string;
}

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  email: string;
  avatarSeed: string;
}
