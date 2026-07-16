'use client'

import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { Award, Lock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useAchievements } from '@/lib/hooks'

export default function AchievementsPage() {
  const { profile } = useAuth()
  const { achievements, unlocked, loading } = useAchievements(profile?.id)

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Award className="w-6 h-6 text-[var(--amber)]" />
          অর্জন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {unlocked.length}/{achievements.length} আনলক হয়েছে
        </p>
      </motion.div>

      {/* Progress */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">অগ্রগতি</span>
          <span className="text-sm font-bold text-[var(--amber)]">
            {achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-[var(--bg-deep)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[var(--amber)] to-[var(--mint)] rounded-full"
          />
        </div>
      </Card>

      {/* Achievement List */}
      <div className="grid sm:grid-cols-2 gap-3">
        {loading ? (
          <div className="sm:col-span-2 text-center py-10 text-[var(--text-muted)] text-sm">লোড হচ্ছে...</div>
        ) : (
          achievements.map((a, i) => {
            const isUnlocked = unlocked.includes(a.id)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`relative overflow-hidden ${!isUnlocked ? 'opacity-50' : ''}`}>
                  {isUnlocked && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--amber)] to-[var(--mint)]" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl ${
                      isUnlocked ? 'bg-[var(--amber-glow)]' : 'bg-[var(--bg-deep)]'
                    }`}>
                      {isUnlocked ? a.icon : <Lock className="w-5 h-5 text-[var(--text-muted)]" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{a.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{a.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {isUnlocked ? (
                          <Badge color="mint" size="xs">আনলক ✓</Badge>
                        ) : (
                          <Badge color="indigo" size="xs">+{a.points_reward} পয়েন্ট</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
