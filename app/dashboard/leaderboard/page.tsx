'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Award } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatPoints } from '@/lib/utils'
import type { Profile } from '@/lib/types'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('total_earned', { ascending: false })
      .limit(50)
    if (data) setLeaders(data as Profile[])
    setLoading(false)
  }

  const rankIcons = [Crown, Medal, Award]
  const rankColors = ['var(--amber)', '#C0C0C0', '#CD7F32']

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[var(--amber)]" />
          লিডারবোর্ড
        </h1>
        <p className="text-sm text-[var(--text-muted)]">সর্বাধিক আয়কারী সদস্যরা</p>
      </motion.div>

      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {leaders.slice(0, 3).map((l, i) => {
          const Icon = rankIcons[i]
          return (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: rankColors[i] }} />
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: rankColors[i] }} />
                <div className="font-bold text-sm mb-0.5 truncate">{l.display_name}</div>
                <div className="text-lg font-bold" style={{ color: rankColors[i] }}>{formatPoints(l.total_earned)}</div>
                <Badge color="mint" size="xs">লেভেল {l.level}</Badge>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Rest */}
      <Card padding={false}>
        {loading ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">লোড হচ্ছে...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">কোনো ডেটা নেই</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {leaders.slice(3).map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (i + 3) * 0.03 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className="w-8 text-sm font-bold text-[var(--text-muted)] text-center">{i + 4}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{l.display_name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">লেভেল {l.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[var(--amber)]">{formatPoints(l.total_earned)}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{l.referral_count} রেফার</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
