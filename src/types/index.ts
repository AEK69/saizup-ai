export type Language = 'lo' | 'th' | 'en';

export type PlanType = 'monthly' | 'yearly' | 'credit_50k' | 'credit_100k' | 'credit_250k';

export interface Plan {
  id: PlanType;
  name: {
    lo: string;
    th: string;
    en: string;
  };
  priceLAK: number;
  displayPrice: string;
  period?: {
    lo: string;
    th: string;
    en: string;
  };
  credits: number;
  isPopular?: boolean;
  features: {
    lo: string[];
    th: string[];
    en: string[];
  };
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  planId: string;
  planName: string;
  amountLAK: number;
  creditsGiven: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'BCEL_ONE';
  bcelKey: string;
  qrPayload: string;
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: string;
  trialDaysRemaining?: number;
  createdAt: string;
}
