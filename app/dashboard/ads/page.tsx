'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Clock, CheckCircle2, Zap, ExternalLink } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Ad } from '@/lib/types'

export default function AdsPage() {
  const { profile, refreshProfile } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({})
  const [watchingAd, setWatchingAd] = useState<Ad | null>(null)
  const [timer, setTimer] = useState(0)
  const [earned, setEarned] = useState(0)
  const [toast, setToast] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadAds()
  }, [])

  useEffect(() => {
    if (!watchingAd || timer <= 0) return
    const t = setTimeout(() => setTimer((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [watchingAd, timer])

  useEffect(() => {
    if (watchingAd && timer === 0) {
      completeAd()
    }
  }, [timer, watchingAd])

  // Cooldown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next: Record<string, number> = {}
        for (const [k, v] of Object.entries(prev)) {
          if (v > 1) next[k] = v - 1
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function loadAds() {
    const { data } = await supabase.from('ads').select('*').eq('is_active', true).order('points_reward', { ascending: false })
    if (data) setAds(data as Ad[])

    // Load cooldowns
    if (profile) {
      const { data: views } = await supabase
        .from('ad_views')
        .select('ad_id, viewed_at')
        .eq('user_id', profile.id)
        .order('viewed_at', { ascending: false })

      if (views) {
        const cd: Record<string, number> = {}
        for (const v of views) {
          const ad = data?.find((a: Ad) => a.id === v.ad_id)
          if (!ad) continue
          const elapsed = Math.floor((Date.now() - new Date(v.viewed_at).getTime()) / 1000)
          const remaining = ad.cooldown_seconds - elapsed
          if (remaining > 0 && !cd[v.ad_id]) cd[v.ad_id] = remaining
        }
        setCooldowns(cd)
      }
    }
  }

  function startWatching(ad: Ad) {
    if (cooldowns[ad.id]) return
    setWatchingAd(ad)
    setTimer(15) // 15 second watch time
  }

  async function completeAd() {
    if (!watchingAd || !profile) return
    const { data, error } = await supabase.rpc('record_ad_view', {
      _ad_id: watchingAd.id,
      _user_id: profile.id,
    })
    if (!error && data > 0) {
      setEarned((v) => v + data)
      setCooldowns((prev) => ({ ...prev, [watchingAd.id]: watchingAd.cooldown_seconds }))
      await refreshProfile()
      showToast(`+${data} পয়েন্ট পেয়েছেন!`)
    }
    setWatchingAd(null)
    setTimer(0)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[var(--mint)]" />
          বিজ্ঞাপন দেখুন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">বিজ্ঞাপন দেখে পয়েন্ট আয় করুন — প্রতিটি বিজ্ঞাপনের জন্য কুলডাউন আছে</p>
      </motion.div>

      {/* Today's Earning */}
      <Card className="mb-6 bg-gradient-to-r from-[var(--mint-glow)] to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--mint)]/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[var(--mint)]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--mint)]">+{earned}</div>
            <div className="text-sm text-[var(--text-muted)]">আজকে বিজ্ঞাপন থেকে আয়</div>
          </div>
        </div>
      </Card>

      {/* Ad Watch Modal */}
      <AnimatePresence>
        {watchingAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-8 max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 rounded-full border-4 border-[var(--mint)] border-t-transparent animate-spin mx-auto mb-4" />
              <div className="text-3xl font-bold text-[var(--mint)] mb-2">{timer}</div>
              <p className="text-sm text-[var(--text-muted)] mb-1">বিজ্ঞাপন দেখা হচ্ছে...</p>
              <p className="text-xs text-[var(--text-muted)]">অনুগ্রহ করে অপেক্ষা করুন</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad List */}
      <div className="grid gap-3">
        {ads.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">এখন কোনো বিজ্ঞাপন নেই — পরে আবার চেক করুন</p>
            </div>
          </Card>
        ) : (
          ads.map((ad, i) => {
            const cd = cooldowns[ad.id] || 0
            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover glow="mint" className={cd > 0 ? 'opacity-50' : ''}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--mint-glow)] flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-[var(--mint)]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{ad.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge color="mint" size="xs">+{ad.points_reward} পয়েন্ট</Badge>
                          <Badge color="indigo" size="xs">{ad.ad_type}</Badge>
                        </div>
                      </div>
                    </div>
                    {cd > 0 ? (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                        <Clock className="w-4 h-4" />
                        {cd}s
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => startWatching(ad)}>
                        দেখুন
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--mint)] text-[#04261D] px-5 py-3 rounded-[var(--radius-lg)] text-sm font-semibold shadow-[var(--shadow-lg)] z-[200]"
        >
          {toast}
        </motion.div>
      )}
    </div>
  )
}
