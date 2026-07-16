// ══════════════════════════════════════════════
// MINTIQ Revenue Calculator
// ══════════════════════════════════════════════

import {
  POINTS_TO_BDT,
  WITHDRAWAL_FEE_PERCENT,
  REFERRAL_COMMISSION_PERCENT,
  LEVEL_BONUS_PERCENT,
  PREMIUM_PLANS,
} from './constants'

// Points to Money
export function pointsToMoney(points: number): number {
  return points * POINTS_TO_BDT
}

// Money to Points
export function moneyToPoints(money: number): number {
  return Math.ceil(money / POINTS_TO_BDT)
}

// Calculate Withdrawal
export function calculateWithdrawal(points: number, level: number = 1) {
  const feePercent = WITHDRAWAL_FEE_PERCENT
  const feePoints = Math.ceil(points * (feePercent / 100))
  const netPoints = points - feePoints
  const grossMoney = pointsToMoney(points)
  const feeMoney = pointsToMoney(feePoints)
  const netMoney = pointsToMoney(netPoints)

  return {
    grossPoints: points,
    feePoints,
    netPoints,
    grossMoney,
    feeMoney,
    netMoney,
    feePercent,
  }
}

// Calculate Level Bonus
export function calculateLevelBonus(basePoints: number, level: number): number {
  const bonusPercent = LEVEL_BONUS_PERCENT[Math.min(level - 1, LEVEL_BONUS_PERCENT.length - 1)]
  return Math.floor(basePoints * (bonusPercent / 100))
}

// Calculate Premium Multiplier
export function calculatePremiumPoints(basePoints: number, plan: 'free' | 'premium' | 'vip'): number {
  const multiplier = PREMIUM_PLANS[plan].multiplier
  return basePoints * multiplier
}

// Calculate Referral Commission
export function calculateReferralCommission(referredEarnings: number): number {
  return Math.floor(referredEarnings * (REFERRAL_COMMISSION_PERCENT / 100))
}

// Format Money
export function formatMoney(amount: number): string {
  if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `৳${(amount / 100000).toFixed(1)} L`
  if (amount >= 1000) return `৳${(amount / 1000).toFixed(1)}K`
  return `৳${amount.toFixed(0)}`
}

// Format Points
export function formatPoints(points: number): string {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
  return points.toString()
}

// Revenue Statistics
export function calculateRevenueStats(transactions: any[]) {
  let totalAdRevenue = 0
  let totalTaskRevenue = 0
  let totalWithdrawalFees = 0
  let totalReferralCommissions = 0
  let totalPointsDistributed = 0

  for (const tx of transactions) {
    if (tx.amount > 0) {
      totalPointsDistributed += tx.amount
      if (tx.type === 'ad_reward') totalAdRevenue += tx.amount
      if (tx.type === 'task_reward') totalTaskRevenue += tx.amount
      if (tx.type === 'referral_bonus') totalReferralCommissions += tx.amount
    }
    if (tx.type === 'withdrawal') {
      totalWithdrawalFees += Math.abs(tx.amount)
    }
  }

  return {
    totalAdRevenue: pointsToMoney(totalAdRevenue),
    totalTaskRevenue: pointsToMoney(totalTaskRevenue),
    totalWithdrawalFees: pointsToMoney(totalWithdrawalFees),
    totalReferralCommissions: pointsToMoney(totalReferralCommissions),
    totalPointsDistributed,
    totalMoneyDistributed: pointsToMoney(totalPointsDistributed),
    estimatedMonthlyProfit: pointsToMoney(totalAdRevenue + totalWithdrawalFees - totalPointsDistributed),
  }
}
