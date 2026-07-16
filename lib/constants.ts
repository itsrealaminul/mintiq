// ══════════════════════════════════════════════
// MINTIQ Revenue Constants
// ══════════════════════════════════════════════

// Points to Money Conversion
export const POINTS_TO_BDT = 0.10 // 1 point = ৳0.10 (10 poisha)
export const MIN_WITHDRAW_POINTS = 500
export const MAX_WITHDRAW_POINTS = 50000
export const WITHDRAWAL_FEE_PERCENT = 10 // 10% fee

// Daily Limits
export const MAX_DAILY_AD_VIEWS = 50
export const MAX_DAILY_VIDEO_WATCHES = 20
export const MAX_DAILY_SURVEYS = 10
export const MAX_DAILY_GAME_PLAYS = 30
export const MAX_DAILY_TASK_COMPLETIONS = 25

// Points Rewards
export const AD_REWARDS = {
  banner: 1,
  video: 3,
  popup: 2,
  social_bar: 1,
}

export const VIDEO_REWARDS = {
  short: 5,    // < 3 min
  medium: 10,  // 3-10 min
  long: 15,    // > 10 min
}

export const SURVEY_REWARDS = {
  easy: 15,    // < 3 min
  medium: 25,  // 3-5 min
  hard: 40,    // > 5 min
}

export const GAME_REWARDS = {
  play: 3,
  win_bonus: 5,
}

export const TASK_REWARDS = {
  view: 2,
  follow: 3,
  comment: 4,
  like: 2,
  subscribe: 5,
  share: 3,
}

// Referral System
export const REFERRAL_BONUS_REFERRER = 100
export const REFERRAL_BONUS_REFERRED = 100
export const REFERRAL_COMMISSION_PERCENT = 5 // 5% of referred user's earnings

// Daily Bonus
export const DAILY_BONUS_BASE = 5
export const DAILY_BONUS_INCREMENT = 2
export const DAILY_BONUS_MAX = 50

// Premium Membership
export const PREMIUM_PLANS = {
  free: { name: 'Free', price: 0, multiplier: 1, features: ['Basic tasks', 'Standard ads'] },
  premium: { name: 'Premium', price: 99, multiplier: 2, features: ['2x points', 'Priority withdrawals', 'Exclusive tasks'] },
  vip: { name: 'VIP', price: 299, multiplier: 5, features: ['5x points', 'Instant withdrawals', 'All tasks', 'No ads'] },
}

// Level System
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 15000]
export const LEVEL_NAMES = ['নতুন', 'শিক্ষানবিস', 'সক্রিয়', 'দক্ষ', 'বিশেষজ্ঞ', 'মাস্টার', 'চ্যাম্পিয়ন', 'লেজেন্ড', 'মিথিক', 'অলিম্পাস']
export const LEVEL_BONUS_PERCENT = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50]

// Admin
export const ADMIN_EMAILS = ['itsrealaminul@gmail.com']
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mintiq2025'
