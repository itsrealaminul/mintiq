import { LEVEL_THRESHOLDS, LEVEL_NAMES } from './types'

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatPoints(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export function getLevelInfo(totalEarned: number) {
  let level = 0
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalEarned >= LEVEL_THRESHOLDS[i]) {
      level = i
      break
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level]
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] || LEVEL_THRESHOLDS[level]
  const progress = nextThreshold > currentThreshold
    ? ((totalEarned - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  return {
    level: level + 1,
    name: LEVEL_NAMES[level] || 'নতুন',
    progress: Math.min(100, Math.max(0, progress)),
    currentThreshold,
    nextThreshold,
  }
}

export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'এইমাত্র'
  if (mins < 60) return `${mins} মিনিট আগে`
  if (hours < 24) return `${hours} ঘণ্টা আগে`
  return `${days} দিন আগে`
}

export function generateReferralLink(code: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/login?ref=${code}`
}
