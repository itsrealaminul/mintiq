'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Eye, Video, ClipboardList, Gamepad2, ListChecks,
  Wallet, Trophy, Users, Flame, Star, TrendingUp, Gift, ArrowRight
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProgressRing from '@/components/ui/ProgressRing'
import { getLevelInfo, formatPoints, cn } from '@/lib/utils'
import type { Transaction } from '@/lib/types'
import { useTransactions } from '@/lib/hooks'
import { requestNotificationPermission, scheduleDailyReminder } from '@/lib/notifications'

const QUICK_ACTIONS = [
  { icon: Eye, label: 'বিজ্ঞাপন দেখুন', href: '/dashboard/ads', color: 'var(--mint)', points: '+1-3' },
  { icon: Video, label: 'ভিডিও দেখুন', href: '/dashboard/videos', color: 'var(--cyan)', points: '+5' },
  { icon: ClipboardList, label: 'সার্ভে করুন', href: '/dashboard/surveys', color: 'var(--indigo)', points: '+15-25' },
  { icon: Gamepad2, label: 'গেম খেলুন', href: '/dashboard/games', color: 'var(--pink)', points: '+3-5' },
  { icon: ListChecks, label: 'টাস্ক করুন', href: '/dashboard/tasks', color: 'var(--amber)', points: '+2-5' },
]

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth()
  const [dailyBonus, setDailyBonus] = useState<{ claimed: boolean; streak: number }>({ claimed: false, streak: 0 })
  const [claiming, setClaiming] = useState(false)
  const [toast, setToast] = useState('')
  const supabase = createClient()
  const { transactions } = useTransactions(profile?.id)

  useEffect(() => {
    if (!profile) return
    checkDailyBonus()
    // Request notification permission
    requestNotificationPermission().then((granted) => {
      if (granted) {
        scheduleDailyReminder()
      }
    })
  }, [profile])

  async function checkDailyBonus() {
    if (!profile) return
    const { data } = await supabase
      .from('daily_bonuses')
      .select('*')
      .eq('user_id', profile.id)
      .eq('claimed_date', new Date().toISOString().split('T')[0])
      .single()
    setDailyBonus({
      claimed: !!data,
      streak: profile.streak_days,
    })
  }

  async function claimDailyBonus() {
    if (!profile || dailyBonus.claimed) return
    setClaiming(true)
    const { data, error } = await supabase.rpc('claim_daily_bonus', { _user_id: profile.id })
    if (!error && data) {
      setDailyBonus({ claimed: true, streak: dailyBonus.streak + 1 })
      await refreshProfile()
      showToast(`🎉 ${data} পয়েন্ট পেয়েছেন!`)
    }
    setClaiming(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  if (!profile) return null

  const levelInfo = getLevelInfo(profile.total_earned)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl lg:text-2xl font-bold mb-1">
          স্বাগতম, {profile.display_name}! 👋
        </h1>
        <p className="text-sm text-[var(--text-muted)]">আজকে কতটুকু আয় করেছেন?</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {[
          { label: 'বর্তমান পয়েন্ট', value: formatPoints(profile.points), icon: Star, color: 'var(--amber)', bg: 'var(--amber-glow)' },
          { label: 'মোট আয়', value: formatPoints(profile.total_earned), icon: TrendingUp, color: 'var(--mint)', bg: 'var(--mint-glow)' },
          { label: 'স্ট্রিক', value: `${profile.streak_days} দিন`, icon: Flame, color: 'var(--danger)', bg: 'var(--danger-glow)' },
          { label: 'রেফারেল', value: `${profile.referral_count} জন`, icon: Users, color: 'var(--indigo)', bg: 'var(--indigo-glow)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10" style={{ background: s.color, filter: 'blur(20px)' }} />
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center mb-2" style={{ background: s.bg }}>
                <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} />
              </div>
              <div className="text-lg lg:text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level + Daily Bonus Row */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Level Card */}
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing progress={levelInfo.progress} size={64} strokeWidth={4}>
              <span className="text-lg font-bold text-[var(--mint)]">{levelInfo.level}</span>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{levelInfo.name}</span>
                <span className="text-[11px] text-[var(--text-muted)]">লেভেল {levelInfo.level}</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded-full"
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                পরের লেভেলে {Math.ceil(levelInfo.nextThreshold - profile.total_earned)} পয়েন্ট বাকি
              </p>
            </div>
          </div>
        </Card>

        {/* Daily Bonus */}
        <Card className={dailyBonus.claimed ? 'opacity-60' : ''}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-[var(--amber)]" />
                <span className="font-bold">দৈনিক বোনাস</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {dailyBonus.claimed
                  ? 'আজকের বোনাস নেওয়া হয়েছে ✓'
                  : `স্ট্রিক: ${dailyBonus.streak} দিন — প্রতিদিন বাড়তে থাকে!`}
              </p>
            </div>
            <Button
              size="sm"
              variant={dailyBonus.claimed ? 'secondary' : 'amber'}
              loading={claiming}
              onClick={claimDailyBonus}
              disabled={dailyBonus.claimed}
            >
              {dailyBonus.claimed ? 'নেওয়া হয়েছে' : 'নিন'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">দ্রুত আয় করুন</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link href={a.href}>
                <Card hover glow="mint" className="text-center group cursor-pointer">
                  <div
                    className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-2 transition-transform group-hover:scale-110"
                    style={{ background: `${a.color}15` }}
                  >
                    <a.icon className="w-6 h-6" style={{ color: a.color }} />
                  </div>
                  <div className="text-sm font-semibold mb-0.5">{a.label}</div>
                  <div className="text-xs font-bold" style={{ color: a.color }}>{a.points} পয়েন্ট</div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">সাম্প্রতিক লেনদেন</h2>
          <Link href="/dashboard/withdraw" className="text-xs text-[var(--mint)] font-semibold flex items-center gap-1 hover:underline">
            সব দেখুন <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <Card padding={false}>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm">
              এখনো কোনো লেনদেন নেই — কাজ করে আয় শুরু করুন!
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium">{t.description}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {new Date(t.created_at).toLocaleString('bn-BD')}
                    </div>
                  </div>
                  <span className={cn(
                    'text-sm font-bold',
                    t.amount > 0 ? 'text-[var(--mint)]' : 'text-[var(--danger)]'
                  )}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--mint)] text-[#04261D] px-5 py-3 rounded-[var(--radius-lg)] text-sm font-semibold shadow-[var(--shadow-lg)] z-[200] max-w-[90%]"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
