'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, LayoutDashboard, Eye, Video, ClipboardList,
  Gamepad2, ListChecks, Wallet, Trophy, Users, Award, LogOut, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import { formatPoints } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/dashboard/ads', label: 'বিজ্ঞাপন', icon: Eye },
  { href: '/dashboard/videos', label: 'ভিডিও', icon: Video },
  { href: '/dashboard/surveys', label: 'সার্ভে', icon: ClipboardList },
  { href: '/dashboard/games', label: 'গেম', icon: Gamepad2 },
  { href: '/dashboard/tasks', label: 'টাস্ক', icon: ListChecks },
  { href: '/dashboard/withdraw', label: 'টাকা তুলুন', icon: Wallet },
  { href: '/dashboard/leaderboard', label: 'লিডারবোর্ড', icon: Trophy },
  { href: '/dashboard/referral', label: 'রেফারেল', icon: Users },
  { href: '/dashboard/achievements', label: 'অর্জন', icon: Award },
]

export default function MobileNav({
  profile,
  onSignOut,
}: {
  profile: Profile
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--mint)] to-[var(--mint-dark)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#04261D]" />
            </div>
            <span className="text-base font-bold">MINTIQ</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full px-3 py-1.5 text-sm font-semibold">
              <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full" />
              <span className="text-[var(--amber)]">{formatPoints(profile.points)}</span>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)]"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-[var(--bg-surface)] border-l border-[var(--border)] z-50 flex flex-col"
            >
              <div className="px-4 py-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{profile.display_name}</span>
                  <button onClick={() => setOpen(false)}>
                    <X className="w-5 h-5 text-[var(--text-muted)]" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[var(--amber)] font-bold">
                  <span className="w-2 h-2 bg-[var(--amber)] rounded-full" />
                  {formatPoints(profile.points)} পয়েন্ট
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-3">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium mb-1 transition-all',
                        isActive
                          ? 'bg-[var(--mint-glow)] text-[var(--mint)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                      )}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="px-3 py-4 border-t border-[var(--border)]">
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[var(--text-muted)] hover:text-[var(--danger)]"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  লগআউট
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
