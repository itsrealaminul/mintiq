'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Gift, Flame, Clock } from 'lucide-react'
import Badge from '@/components/ui/Badge'

type Notification = {
  id: string
  type: 'daily_bonus' | 'task' | 'referral' | 'achievement' | 'withdrawal'
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [hasCheckedDaily, setHasCheckedDaily] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkDailyBonus()
    loadNotifications()
  }, [userId])

  async function checkDailyBonus() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_bonuses')
      .select('*')
      .eq('user_id', userId)
      .eq('claimed_date', today)
      .single()

    if (!data && !hasCheckedDaily) {
      // Show daily bonus notification
      const dailyNotification: Notification = {
        id: 'daily-bonus',
        type: 'daily_bonus',
        title: 'দৈনিক বোনাস!',
        message: 'আজকের বোনাস নিন — প্রতিদিন বাড়তে থাকে!',
        read: false,
        created_at: new Date().toISOString(),
      }
      setNotifications(prev => [dailyNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    }
    setHasCheckedDaily(true)
  }

  async function loadNotifications() {
    // Check streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_days')
      .eq('id', userId)
      .single()

    if (profile && profile.streak_days >= 3) {
      const streakNotification: Notification = {
        id: 'streak',
        type: 'task',
        title: `${profile.streak_days} দিনের স্ট্রিক! 🔥`,
        message: 'লগাতার আসছেন — বোনাস পয়েন্ট পান!',
        read: false,
        created_at: new Date().toISOString(),
      }
      setNotifications(prev => [...prev, streakNotification])
      setUnreadCount(prev => prev + 1)
    }
  }

  function markAsRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  function dismissAll() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const iconMap = {
    daily_bonus: Gift,
    task: Clock,
    referral: Bell,
    achievement: Check,
    withdrawal: Check,
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-all"
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--danger)] rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">{unreadCount}</span>
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <h3 className="font-bold text-sm">নোটিফিকেশন</h3>
                {unreadCount > 0 && (
                  <button onClick={dismissAll} className="text-xs text-[var(--mint)] hover:underline">
                    সব পড়া হয়েছে
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    কোনো নোটিফিকেশন নেই
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = iconMap[n.type] || Bell
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] cursor-pointer transition-all ${
                          n.read ? 'opacity-50' : 'bg-[var(--mint-glow)]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          n.type === 'daily_bonus' ? 'bg-[var(--amber-glow)]' : 'bg-[var(--mint-glow)]'
                        }`}>
                          <Icon className={`w-4 h-4 ${n.type === 'daily_bonus' ? 'text-[var(--amber)]' : 'text-[var(--mint)]'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">{n.title}</div>
                          <div className="text-xs text-[var(--text-muted)]">{n.message}</div>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 bg-[var(--mint)] rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
