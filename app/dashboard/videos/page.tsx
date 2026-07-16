'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Play, Clock, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { VideoTask } from '@/lib/types'

export default function VideosPage() {
  const { profile, refreshProfile } = useAuth()
  const [videos, setVideos] = useState<VideoTask[]>([])
  const [watching, setWatching] = useState<VideoTask | null>(null)
  const [watchProgress, setWatchProgress] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (!watching) return
    const interval = setInterval(() => {
      setWatchProgress((v) => {
        if (v >= watching.watch_seconds_required) {
          clearInterval(interval)
          completeWatch()
          return v
        }
        return v + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [watching])

  async function loadVideos() {
    const { data } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('is_active', true)
      .order('points_reward', { ascending: false })
    if (data) setVideos(data as VideoTask[])

    // Load completed
    if (profile) {
      const { data: views } = await supabase
        .from('video_views')
        .select('video_id')
        .eq('user_id', profile.id)
        .eq('completed', true)
      if (views) setCompleted(new Set(views.map((v: { video_id: string }) => v.video_id)))
    }
  }

  async function completeWatch() {
    if (!watching || !profile) return
    const { data, error } = await supabase.rpc('record_video_watch', {
      _video_id: watching.id,
      _user_id: profile.id,
      _seconds: watchProgress,
    })
    if (!error && data > 0) {
      setCompleted((prev) => new Set([...prev, watching.id]))
      await refreshProfile()
      showToast(`+${data} পয়েন্ট পেয়েছেন!`)
    }
    setWatching(null)
    setWatchProgress(0)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Video className="w-6 h-6 text-[var(--cyan)]" />
          ভিডিও দেখুন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">ভিডিও দেখে পয়েন্ট আয় করুন — নির্ধারিত সময় দেখতে হবে</p>
      </motion.div>

      {/* Watch Modal */}
      <AnimatePresence>
        {watching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-6 max-w-lg w-full"
            >
              <h3 className="font-bold mb-2">{watching.title}</h3>
              <div className="aspect-video bg-[var(--bg-deep)] rounded-[var(--radius-md)] mb-4 flex items-center justify-center">
                <iframe
                  src={watching.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full rounded-[var(--radius-md)]"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)]">দেখা হচ্ছে...</span>
                <span className="text-sm font-bold text-[var(--cyan)]">
                  {watchProgress}/{watching.watch_seconds_required}s
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--mint)] rounded-full"
                  style={{ width: `${(watchProgress / watching.watch_seconds_required) * 100}%` }}
                />
              </div>
              <Button variant="secondary" fullWidth onClick={() => { setWatching(null); setWatchProgress(0) }}>
                বন্ধ করুন
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video List */}
      <div className="grid gap-3">
        {videos.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">এখন কোনো ভিডিও নেই</p>
            </div>
          </Card>
        ) : (
          videos.map((v, i) => {
            const isDone = completed.has(v.id)
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover glow="mint" className={isDone ? 'opacity-50' : ''}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgba(6,182,212,0.15)] flex items-center justify-center">
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-[var(--mint)]" /> : <Play className="w-5 h-5 text-[var(--cyan)]" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{v.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge color="mint" size="xs">+{v.points_reward} পয়েন্ট</Badge>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDuration(v.duration_seconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isDone ? (
                      <Badge color="mint">সম্পন্ন</Badge>
                    ) : (
                      <Button size="sm" onClick={() => { setWatching(v); setWatchProgress(0) }}>
                        <Play className="w-4 h-4" /> দেখুন
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

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
