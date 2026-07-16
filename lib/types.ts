/* ══════════════════════════════════════════════
   MINTIQ Type Definitions
   ══════════════════════════════════════════════ */

export type Profile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  points: number
  total_earned: number
  referral_code: string | null
  referred_by: string | null
  referral_count: number
  level: number
  streak_days: number
  last_active: string
  created_at: string
}

export type TaskType = 'view' | 'follow' | 'comment' | 'like' | 'subscribe' | 'share'
export type TaskStatus = 'active' | 'completed' | 'paused' | 'expired'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export type Task = {
  id: string
  owner_id: string
  title: string
  description: string | null
  content_link: string
  task_type: TaskType
  points_per_action: number
  total_needed: number
  total_completed: number
  status: TaskStatus
  platform: string
  created_at: string
}

export type Submission = {
  id: string
  task_id: string
  user_id: string
  screenshot_url: string | null
  timer_completed: boolean
  status: SubmissionStatus
  reviewed_at: string | null
  created_at: string
}

export type TransactionType =
  | 'task_reward'
  | 'referral_bonus'
  | 'ad_reward'
  | 'video_reward'
  | 'survey_reward'
  | 'game_reward'
  | 'daily_bonus'
  | 'achievement_reward'
  | 'withdrawal'
  | 'task_purchase'

export type Transaction = {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  balance_after: number
  description: string
  reference_id: string | null
  created_at: string
}

export type Ad = {
  id: string
  title: string
  ad_type: 'banner' | 'video' | 'popup' | 'social_bar'
  ad_network: string
  script_url: string | null
  ad_code: string | null
  points_reward: number
  cooldown_seconds: number
  is_active: boolean
  created_at: string
}

export type VideoTask = {
  id: string
  title: string
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number
  points_reward: number
  watch_seconds_required: number
  total_watches: number
  max_watches: number
  is_active: boolean
  created_at: string
}

export type Survey = {
  id: string
  title: string
  description: string
  survey_url: string
  points_reward: number
  estimated_minutes: number
  provider: string
  total_completions: number
  max_completions: number
  is_active: boolean
  created_at: string
}

export type Game = {
  id: string
  title: string
  description: string
  game_url: string
  thumbnail_url: string | null
  points_per_play: number
  max_plays_per_day: number
  game_type: 'iframe' | 'link'
  is_active: boolean
  created_at: string
}

export type GamePlay = {
  id: string
  game_id: string
  user_id: string
  score: number
  points_earned: number
  played_at: string
}

export type Withdrawal = {
  id: string
  user_id: string
  amount: number
  method: 'bkash' | 'nagad' | 'rocket' | 'bank'
  account_number: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  processed_at: string | null
  created_at: string
}

export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  requirement_type: string
  requirement_value: number
  points_reward: number
  created_at: string
}

export type UserAchievement = {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export type Referral = {
  id: string
  referrer_id: string
  referred_id: string
  bonus_paid: boolean
  created_at: string
}

/* ═══ Constants ═══ */
export const TASK_TYPE_LABEL: Record<TaskType, string> = {
  view: 'ভিউ',
  follow: 'ফলো',
  comment: 'কমেন্ট',
  like: 'লাইক',
  subscribe: 'সাবস্ক্রাইব',
  share: 'শেয়ার',
}

export const TASK_TYPE_ICON: Record<TaskType, string> = {
  view: '👁️',
  follow: '➕',
  comment: '💬',
  like: '❤️',
  subscribe: '🔔',
  share: '📤',
}

export const TASK_REWARD: Record<TaskType, number> = {
  view: 2,
  follow: 3,
  comment: 4,
  like: 2,
  subscribe: 5,
  share: 3,
}

export const PLATFORM_ICONS: Record<string, string> = {
  youtube: '▶️',
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
  twitter: '🐦',
  website: '🌐',
}

export const WITHDRAWAL_METHODS = [
  { id: 'bkash', name: 'bKash', icon: '📱', color: '#E2136E' },
  { id: 'nagad', name: 'Nagad', icon: '📱', color: '#F6921E' },
  { id: 'rocket', name: 'Rocket', icon: '🚀', color: '#8B2F8B' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦', color: '#6366F1' },
] as const

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000, 15000,
]

export const LEVEL_NAMES = [
  'নতুন', 'শিক্ষানবিস', 'সক্রিয়', 'দক্ষ', 'বিশেষজ্ঞ',
  'মাস্টার', 'চ্যাম্পিয়ন', 'লেজেন্ড', 'মিথিক', 'অলিম্পাস',
]
