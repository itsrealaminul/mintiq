'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Eye, Video, ClipboardList, Gamepad2,
  ListChecks, Wallet, Trophy, Users, Award, LogOut, Sparkles, Megaphone, Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import { getLevelInfo, formatPoints } from '@/lib/utils'
import ProgressRing from '@/components/ui/ProgressRing'
import NotificationBell from '@/components/NotificationBell'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/dashboard/ads', label: 'বিজ্ঞাপন দেখুন', icon: Megaphone },
  { href: '/dashboard/videos', label: 'ভিডিও দেখুন', icon: Video },
  { href: '/dashboard/surveys', label: 'সার্ভে', icon: ClipboardList },
  { href: '/dashboard/games', label: 'গেম খেলুন', icon: Gamepad2 },
  { href: '/dashboard/tasks', label: 'মাইক্রো টাস্ক', icon: ListChecks },
  { divider: true },
  { href: '/dashboard/withdraw', label: 'টাকা তুলুন', icon: Wallet },
  { href: '/dashboard/leaderboard', label: 'লিডারবোর্ড', icon: Trophy },
  { href: '/dashboard/referral', label: 'রেফারেল', icon: Users },
  { href: '/dashboard/achievements', label: 'অর্জন', icon: Award },
  { href: '/support', label: 'সাপোর্ট', icon: Headphones },
]

export default function Sidebar({
  profile,
  onSignOut,
}: {
  profile: Profile
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const levelInfo = getLevelInfo(profile.total_earned)

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg-surface)]">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--mint)] to-[var(--mint-dark)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#04261D]" />
            </div>
            <div>
              <span className="text-lg font-bold">MINTIQ</span>
              <p className="text-[10px] text-[var(--text-muted)] -mt-0.5">Creator Exchange</p>
            </div>
          </Link>
          <NotificationBell userId={profile.id} />
        </div>
      </div>

      {/* User Card */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <ProgressRing progress={levelInfo.progress} size={44} strokeWidth={3}>
            <span className="text-xs font-bold text-[var(--mint)]">{levelInfo.level}</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{profile.display_name}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{levelInfo.name}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[var(--amber)] font-bold text-sm">
              <span className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full" />
              {formatPoints(profile.points)}
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">পয়েন্ট</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item, i) => {
          if ('divider' in item && item.divider) {
            return <div key={i} className="h-px bg-[var(--border)] my-2 mx-2" />
          }
          const isActive = pathname === item.href
          const Icon = item.icon!
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium mb-1 transition-all duration-200',
                isActive
                  ? 'bg-[var(--mint-glow)] text-[var(--mint)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--mint)]"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[var(--border)]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-[var(--radius-md)] text-sm text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-glow)] transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          লগআউট
        </button>
      </div>
    </aside>
  )
}
