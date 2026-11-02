import fs from 'fs';
import path from 'path';
import type { AiEngineVersion } from './gemini';

export type SubscriptionTier = 'Free' | 'Gold' | 'Plus' | 'Pro' | 'Owner';

export interface UserActivityLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface AppUserRecord {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  picture?: string;
  provider: 'google' | 'email' | 'password';
  credits: number;
  dailyCreditsUsed?: number;
  lastDailyCreditReset?: string; // YYYY-MM-DD
  plan: SubscriptionTier | 'Free Trial' | 'Monthly Pro' | 'Yearly VIP' | 'Pro Creator Pass';
  billingCycle: 'none' | 'monthly' | 'yearly';
  trialDaysRemaining: number;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  lastLoginAt: string;
  totalVideosGenerated: number;
  totalSpentLAK: number;
  activityHistory: UserActivityLog[];
  isOwner?: boolean;
}

export const TIER_CONFIG = {
  Free: {
    name: 'Free Tier (ທົດລອງຟຣີ)',
    dailyCredits: 15,
    maxClipDurationSec: 30, // 30 seconds maximum
    allowedAiVersions: ['v1'] as AiEngineVersion[],
    features: ['15 ເຄຣດິດ/ມື້ (ຣີເຊັດທຸກວັນ)', 'ຄລິບຍາວສູງສຸດ 30 ວິນາທີ', 'Gemini 3.5 Flash-Lite', 'ຊັບໄຕເຕິລ 30 ວິ', 'ລາຍນ້ຳ SAIZUP'],
    priceLAK: 0,
  },
  Gold: {
    name: 'Gold Tier (Starter Creator)',
    monthlyCredits: 250,
    maxClipDurationSec: 180, // 3 minutes
    allowedAiVersions: ['v1', 'v2'] as AiEngineVersion[],
    features: ['250 ເຄຣດິດ/ເດືອນ', 'ຄລິບຍາວສູງສຸດ 3 ນາທີ (180s)', 'Gemini 3.8 Flash', 'ບໍ່ມີລາຍນ້ຳ', 'ສົ່ງອອກ 1080p Full HD'],
    priceLAK: 99000,
  },
  Plus: {
    name: 'Plus Tier (Pro Creator)',
    monthlyCredits: 800,
    maxClipDurationSec: 600, // 10 minutes
    allowedAiVersions: ['v1', 'v2', 'v3'] as AiEngineVersion[],
    features: ['800 ເຄຣດິດ/ເດືອນ', 'ຄລິບຍາວສູງສຸດ 10 ນາທີ (600s)', 'Gemini 3.1 Pro', 'ຄັງສຽງເອັບເຟັກ Sound Effects ຄົບຊຸດ', 'Karaoke Millisecond Sync'],
    priceLAK: 199000,
  },
  Pro: {
    name: 'Pro Tier (Studio VIP)',
    monthlyCredits: 2500,
    maxClipDurationSec: 999999, // Unlimited
    allowedAiVersions: ['v1', 'v2', 'v3', 'v4'] as AiEngineVersion[],
    features: ['2,500 ເຄຣດິດ/ເດືອນ (3,500 ລາຍປີ)', 'ບໍ່ຈຳກັດຄວາມຍາວວິດີໂອ (Unlimited)', 'Gemini 4 Argon Priority', 'ສົ່ງອອກ 4K Ultra HD', 'ຊ່ວຍເຫຼືອ VIP 24/7'],
    priceLAK: 499000,
    yearlyPriceLAK: 1999000,
  },
  Owner: {
    name: 'Store Owner (ເຈົ້າຂອງລະບົບ)',
    monthlyCredits: 99999,
    maxClipDurationSec: 999999,
    allowedAiVersions: ['v1', 'v2', 'v3', 'v4'] as AiEngineVersion[],
    features: ['ເຄຣດິດບໍ່ຈຳກັດ (Unlimited)', 'ເຂົ້າເຖິງລະບົບຫຼັງບ້ານ (Admin Backoffice)', 'ຄວບຄຸມຈັດການຜູ້ໃຊ້ທັງໝົດ'],
    priceLAK: 0,
  },
};

export interface DynamicCostParams {
  aiVersion: AiEngineVersion;
  durationSeconds?: number;
  language?: 'lo' | 'th' | 'en' | 'mixed';
  hasTranslation?: boolean;
}

/**
 * Dynamic credit calculation based on AI model, video duration, and language complexity.
 * Base: v1=5, v2=12, v3=35, v4=80
 * Duration: +1 credit per 15s above 30s
 * Complexity: +2 credits for code-switching or bilingual translation
 */
export function calculateDynamicCreditsCost(params: DynamicCostParams): {
  baseCost: number;
  durationCost: number;
  complexityCost: number;
  totalCost: number;
  breakdown: string;
} {
  const baseCost = AI_COST_CONFIG[params.aiVersion]?.creditsCost || 5;
  const duration = Math.max(1, params.durationSeconds || 15);
  const extraSec = Math.max(0, duration - 30);
  const durationCost = Math.ceil(extraSec / 15);
  const complexityCost = params.language === 'mixed' || params.hasTranslation ? 2 : 0;
  const totalCost = baseCost + durationCost + complexityCost;

  return {
    baseCost,
    durationCost,
    complexityCost,
    totalCost,
    breakdown: `Base ${baseCost} + ຄວາມຍາວ ${durationCost} + ພາສາ/ແປ ${complexityCost} = ${totalCost} Credits`,
  };
}

export const AI_COST_CONFIG = {
  v1: {
    id: 'v1',
    name: 'Gemini 3.5 Flash-Lite',
    creditsCost: 5,
    description: 'ຮຸ່ນປະຢັດສຳລັບແພັກເກດ Free',
    tierRequired: 'Free',
  },
  v2: {
    id: 'v2',
    name: 'Gemini 3.8 Flash',
    creditsCost: 12,
    description: 'ໄວ ແລະ ແມ່ນຍຳຂຶ້ນ ສຳລັບ Gold',
    tierRequired: 'Gold',
  },
  v3: {
    id: 'v3',
    name: 'Gemini 3.1 Pro',
    creditsCost: 35,
    description: 'ແປ ແລະ ຮັກສາບໍລິບົດຂ້າມພາສາສຳລັບ Plus',
    tierRequired: 'Plus',
  },
  v4: {
    id: 'v4',
    name: 'Gemini 4 Argon',
    creditsCost: 80,
    description: 'ຮຸ່ນ flagship ສຳລັບ Pro ເມື່ອຕ້ອງການການວິເຄາະສູງສຸດ',
    tierRequired: 'Pro',
  },
};

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const INITIAL_USERS: AppUserRecord[] = [
  {
    id: 'usr_kobx2_owner',
    name: 'Kob X2 (ເຈົ້າຂອງຮ້ານ)',
    email: 'kobx2.2005@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIJHiGCGW4EwdGJSmH9PuoLd_V8GllBJpdayfydZdXliXJySLrY=s96-c',
    provider: 'google',
    credits: 9999,
    plan: 'Owner',
    billingCycle: 'yearly',
    trialDaysRemaining: 365,
    status: 'active',
    createdAt: '2026-10-01T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    totalVideosGenerated: 148,
    totalSpentLAK: 0,
    isOwner: true,
    activityHistory: [
      {
        id: 'act-1',
        action: 'ເຂົ້າສູ່ລະບົບ (Login)',
        detail: 'ເຂົ້າສູ່ລະບົບດ້ວຍ Google Account ເຈົ້າຂອງຮ້ານ',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'usr_suliya_01',
    name: 'ສຸລິຍາ ວົງສາ (Suliya)',
    email: 'suliya.vongsa@gmail.com',
    avatar: '',
    provider: 'google',
    credits: 3250,
    plan: 'Pro',
    billingCycle: 'yearly',
    trialDaysRemaining: 340,
    status: 'active',
    createdAt: '2026-10-15T10:20:00.000Z',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    totalVideosGenerated: 42,
    totalSpentLAK: 1999000,
    isOwner: false,
    activityHistory: [
      {
        id: 'act-s1',
        action: 'ຊຳລະເງິນ (Payment)',
        detail: 'ເຕີມແພັກເກັດ Pro VIP ລາຍປີ 1,999,000 LAK ຜ່ານ BCEL One',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ],
  },
  {
    id: 'usr_khampai_02',
    name: 'ຄຳໄພ ສີສຸວັນ (Khampai)',
    email: 'khampai.dev@gmail.com',
    avatar: '',
    provider: 'google',
    credits: 450,
    plan: 'Plus',
    billingCycle: 'monthly',
    trialDaysRemaining: 24,
    status: 'active',
    createdAt: '2026-10-20T14:10:00.000Z',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    totalVideosGenerated: 19,
    totalSpentLAK: 199000,
    isOwner: false,
    activityHistory: [
      {
        id: 'act-k1',
        action: 'ຊຳລະເງິນ (Payment)',
        detail: 'ເຕີມແພັກເກັດ Plus 199,000 LAK ຜ່ານ BCEL One',
        timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      },
    ],
  },
  {
    id: 'usr_aloun_03',
    name: 'ອາລຸນ ເດດວົງ (Aloun)',
    email: 'aloun.media@gmail.com',
    avatar: '',
    provider: 'google',
    credits: 15,
    plan: 'Free',
    billingCycle: 'none',
    trialDaysRemaining: 7,
    status: 'trial',
    createdAt: '2026-10-28T09:00:00.000Z',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    totalVideosGenerated: 6,
    totalSpentLAK: 0,
    isOwner: false,
    activityHistory: [
      {
        id: 'act-a1',
        action: 'ຮັບ 15 ເຄຣດິດຟຣີ',
        detail: 'ຮັບໂຄຕ້າຟຣີ 15 ເຄຣດິດປະຈຳວັນ ສຳລັບຄລິບ 30 ວິ',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
    ],
  },
];

function ensureStorage(): AppUserRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
      return INITIAL_USERS;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_USERS;
  } catch (err) {
    console.error('Error reading users file:', err);
    return INITIAL_USERS;
  }
}

function saveStorage(users: AppUserRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizePlan(plan: string): SubscriptionTier {
  if (plan === 'Owner' || plan === 'Pro Creator Pass') return 'Owner';
  if (plan === 'Pro' || plan === 'Yearly VIP') return 'Pro';
  if (plan === 'Plus' || plan === 'Monthly Pro') return 'Plus';
  if (plan === 'Gold') return 'Gold';
  return 'Free';
}

export const UserStore = {
  getAll(): AppUserRecord[] {
    const users = ensureStorage();
    return users.map((u) => this.checkAndRefreshDailyCredits(u));
  },

  getByEmail(email: string): AppUserRecord | undefined {
    const users = ensureStorage();
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return undefined;
    return this.checkAndRefreshDailyCredits(user);
  },

  getById(id: string): AppUserRecord | undefined {
    const users = ensureStorage();
    const user = users.find((u) => u.id === id);
    if (!user) return undefined;
    return this.checkAndRefreshDailyCredits(user);
  },

  // Daily Credit Refresh for Free Tier Users (15 credits per day)
  checkAndRefreshDailyCredits(user: AppUserRecord): AppUserRecord {
    const today = getTodayString();
    const normalizedPlan = normalizePlan(user.plan);

    if (normalizedPlan === 'Free') {
      if (user.lastDailyCreditReset !== today) {
        user.credits = 15; // Reset to 15 credits daily
        user.dailyCreditsUsed = 0;
        user.lastDailyCreditReset = today;
        const users = ensureStorage();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          users[idx] = user;
          saveStorage(users);
        }
      }
    }
    return user;
  },

  // Called whenever user logs in via Google, Email, or Password
  recordLogin(userData: {
    email: string;
    name?: string;
    avatar?: string;
    picture?: string;
    provider?: 'google' | 'email' | 'password';
  }): AppUserRecord {
    const users = ensureStorage();
    const cleanEmail = userData.email.toLowerCase().trim();
    const isOwner = cleanEmail === 'kobx2.2005@gmail.com';
    const now = new Date().toISOString();
    const today = getTodayString();

    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (existingIndex >= 0) {
      let existing = users[existingIndex];
      existing = this.checkAndRefreshDailyCredits(existing);

      const updated: AppUserRecord = {
        ...existing,
        name: userData.name || existing.name,
        avatar: userData.avatar || userData.picture || existing.avatar,
        lastLoginAt: now,
        isOwner: isOwner || existing.isOwner,
        plan: isOwner ? 'Owner' : existing.plan,
        credits: isOwner ? 9999 : existing.credits,
        activityHistory: [
          {
            id: `act_${Date.now()}`,
            action: 'ເຂົ້າສູ່ລະບົບ (Login)',
            detail: `ເຂົ້າສູ່ລະບົບຜ່ານ ${userData.provider || 'Google'}`,
            timestamp: now,
          },
          ...existing.activityHistory.slice(0, 49),
        ],
      };
      users[existingIndex] = updated;
      saveStorage(users);
      return updated;
    } else {
      // New User Registration: 15 Free Credits per day
      const newUser: AppUserRecord = {
        id: isOwner ? 'usr_kobx2_owner' : `usr_${Date.now()}`,
        name: userData.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: userData.avatar || userData.picture || '',
        picture: userData.picture || '',
        provider: userData.provider || 'google',
        credits: isOwner ? 9999 : 15, // Free tier starts with 15 credits
        dailyCreditsUsed: 0,
        lastDailyCreditReset: today,
        plan: isOwner ? 'Owner' : 'Free',
        billingCycle: isOwner ? 'yearly' : 'none',
        trialDaysRemaining: isOwner ? 365 : 7,
        status: isOwner ? 'active' : 'trial',
        createdAt: now,
        lastLoginAt: now,
        totalVideosGenerated: 0,
        totalSpentLAK: 0,
        isOwner: isOwner,
        activityHistory: [
          {
            id: `act_${Date.now()}`,
            action: 'ລົງທະບຽນໃໝ່ (Register)',
            detail: `ເຂົ້າໃຊ້ງານຄັ້ງທຳອິດຜ່ານ ${userData.provider || 'Google'} (ຮັບ 15 Credits ຟຣີ/ມື້, ຄລິບ 30 ວິ)`,
            timestamp: now,
          },
        ],
      };
      users.unshift(newUser);
      saveStorage(users);
      return newUser;
    }
  },

  // Deduct credits for AI usage (Supports dynamic calculation or fixed cost)
  deductCredits(
    email: string,
    costOrParams: AiEngineVersion | DynamicCostParams | number = 'v1',
    taskDetail: string = 'ສ້າງຊັບໄຕເຕິລ AI',
    usageType: 'video' | 'translation' = 'video'
  ): { success: boolean; remainingCredits: number; costDeducted: number; error?: string } {
    const users = ensureStorage();
    const cleanEmail = email.toLowerCase().trim();
    const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (index === -1) {
      return { success: false, remainingCredits: 0, costDeducted: 0, error: 'User not found' };
    }

    let user = this.checkAndRefreshDailyCredits(users[index]);
    if (user.isOwner) {
      return { success: true, remainingCredits: 9999, costDeducted: 0 };
    }

    let cost = 5;
    let label = 'AI Engine';

    if (typeof costOrParams === 'number') {
      cost = Math.max(1, costOrParams);
      label = `AI Service (${cost} Credits)`;
    } else if (typeof costOrParams === 'string') {
      cost = AI_COST_CONFIG[costOrParams]?.creditsCost || 5;
      label = `AI Engine ${costOrParams.toUpperCase()}`;
    } else if (typeof costOrParams === 'object') {
      const dynamic = calculateDynamicCreditsCost(costOrParams);
      cost = dynamic.totalCost;
      label = `AI Engine ${costOrParams.aiVersion.toUpperCase()} [${dynamic.breakdown}]`;
    }

    if (user.credits < cost) {
      return {
        success: false,
        remainingCredits: user.credits,
        costDeducted: 0,
        error: `ເຄຣດິດບໍ່ພຽງພໍ (ຕ້ອງການ ${cost} ເຄຣດິດ, ທ່ານມີ ${user.credits} ເຄຣດິດ). ກະລຸນາເຕີມເຄຣດິດ`,
      };
    }

    user.credits = Math.max(0, user.credits - cost);
    user.dailyCreditsUsed = (user.dailyCreditsUsed || 0) + cost;
    if (usageType === 'video') user.totalVideosGenerated = (user.totalVideosGenerated || 0) + 1;

    user.activityHistory = [
      {
        id: `act_${Date.now()}`,
        action: `ໃຊ້ງານ ${label} (-${cost} ເຄຣດິດ)`,
        detail: `${taskDetail} | ເຄຣດິດຄົງເຫຼືອ: ${user.credits}`,
        timestamp: new Date().toISOString(),
      },
      ...user.activityHistory.slice(0, 49),
    ];

    users[index] = user;
    saveStorage(users);
    return { success: true, remainingCredits: user.credits, costDeducted: cost };
  },

  // Top up user credits
  topupCredits(email: string, amount: number, planName?: string): AppUserRecord | null {
    const users = ensureStorage();
    const cleanEmail = email.toLowerCase().trim();
    const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (index === -1) return null;

    const user = users[index];
    user.credits = (user.credits || 0) + amount;
    if (planName) {
      if (planName.includes('Pro') || planName.includes('VIP')) user.plan = 'Pro';
      else if (planName.includes('Plus')) user.plan = 'Plus';
      else if (planName.includes('Gold')) user.plan = 'Gold';
    }

    user.activityHistory = [
      {
        id: `act_${Date.now()}`,
        action: `ເຕີມເຄຣດິດ (+${amount} Credits)`,
        detail: `ເຕີມສຳເລັດຜ່ານລະບົບຊຳລະ BCEL One | ຍອດເຄຣດິດໃໝ່: ${user.credits}`,
        timestamp: new Date().toISOString(),
      },
      ...user.activityHistory.slice(0, 49),
    ];

    users[index] = user;
    saveStorage(users);
    return user;
  },

  // Admin update user (credits, plan, status, etc.)
  updateUser(
    id: string,
    updates: Partial<Omit<AppUserRecord, 'id' | 'email'>>,
    adminNote?: string
  ): AppUserRecord | null {
    const users = ensureStorage();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const existing = users[index];
    const now = new Date().toISOString();

    const activityNote =
      adminNote ||
      `ເຈົ້າຂອງຮ້ານແກ້ໄຂ: ເຄຣດິດ=${updates.credits ?? existing.credits}, ແພັກເກັດ=${updates.plan ?? existing.plan}, ສະຖານະ=${updates.status ?? existing.status}`;

    const updated: AppUserRecord = {
      ...existing,
      ...updates,
      activityHistory: [
        {
          id: `act_${Date.now()}`,
          action: 'ແກ້ໄຂຂໍ້ມູນໂດຍເຈົ້າຂອງຮ້ານ',
          detail: activityNote,
          timestamp: now,
        },
        ...existing.activityHistory.slice(0, 49),
      ],
    };

    users[index] = updated;
    saveStorage(users);
    return updated;
  },

  // Ban or Suspend a user violating Terms of Service
  banUser(id: string, reason: string): boolean {
    const users = ensureStorage();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    if (users[index].isOwner) return false; // Cannot ban owner

    users[index].status = 'suspended';
    users[index].activityHistory = [
      {
        id: `act_${Date.now()}`,
        action: 'ຖືກລະງັບບັນຊີ (Suspended)',
        detail: `ລະງັບບັນຊີເນື່ອງຈາກລະເມີດເງື່ອນໄຂການໃຊ້ງານ: ${reason}`,
        timestamp: new Date().toISOString(),
      },
      ...users[index].activityHistory.slice(0, 49),
    ];

    saveStorage(users);
    return true;
  },

  // Delete User Account (for TOS violations)
  deleteUser(id: string): boolean {
    const users = ensureStorage();
    const target = users.find((u) => u.id === id);
    if (target?.isOwner) return false; // Owner cannot be deleted

    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      saveStorage(filtered);
      return true;
    }
    return false;
  },

  // Helper to check user limits for duration and features
  getLimitsForUser(user?: AppUserRecord | null) {
    if (!user) {
      return TIER_CONFIG.Free;
    }
    if (user.isOwner) {
      return TIER_CONFIG.Owner;
    }
    const normalized = normalizePlan(user.plan);
    return TIER_CONFIG[normalized] || TIER_CONFIG.Free;
  },
};
