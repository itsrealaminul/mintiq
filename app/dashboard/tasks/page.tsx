'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks, ExternalLink, Clock, CheckCircle2, Camera, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Task } from '@/lib/types'
import { TASK_TYPE_LABEL, TASK_TYPE_ICON } from '@/lib/types'

export default function TasksPage() {
  const { profile, refreshProfile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [timeLeft, setTimeLeft] = useState(11)
  const [linkOpened, setLinkOpened] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const supabase = createClient()

  const loadTasks = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .neq('owner_id', profile.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
  }, [profile, supabase])

  useEffect(() => { loadTasks() }, [loadTasks])

  useEffect(() => {
    if (!linkOpened || timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    if (timeLeft <= 1) setTimerDone(true)
    return () => clearTimeout(t)
  }, [linkOpened, timeLeft])

  function startTask(task: Task) {
    setActiveTask(task)
    setLinkOpened(false)
    setTimerDone(false)
    setTimeLeft(11)
    setFile(null)
    setError('')
  }

  function handleOpenLink() {
    if (activeTask) window.open(activeTask.content_link, '_blank')
    setLinkOpened(true)
  }

  async function handleSubmit() {
    if (!file || !activeTask || !profile) return
    setSubmitting(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/${activeTask.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('screenshots').upload(path, file)

      if (uploadError) {
        setError('আপলোড সমস্যা: ' + uploadError.message)
        setSubmitting(false)
        return
      }

      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(path)

      const { error: insertError } = await supabase.from('submissions').insert({
        task_id: activeTask.id,
        user_id: profile.id,
        screenshot_url: urlData.publicUrl,
        timer_completed: true,
        status: 'pending',
      })

      if (insertError) {
        setError('সাবমিট সমস্যা: ' + insertError.message)
        setSubmitting(false)
        return
      }

      setActiveTask(null)
      showToast('সাবমিট হয়েছে — অনুমোদনের জন্য অপেক্ষা করুন ✓')
    } catch {
      setError('কিছু ভুল হয়েছে')
      setSubmitting(false)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const TOTAL = 11
  const RADIUS = 48
  const CIRC = 2 * Math.PI * RADIUS

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-[var(--amber)]" />
          মাইক্রো টাস্ক
        </h1>
        <p className="text-sm text-[var(--text-muted)]">লিংকে গিয়ে কাজ করুন, স্ক্রিনশট দিন, পয়েন্ট পান</p>
      </motion.div>

      {/* Task List */}
      <div className="grid gap-3">
        {tasks.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">এখন কোনো টাস্ক নেই</p>
            </div>
          </Card>
        ) : (
          tasks.map((t, i) => {
            const pct = Math.min(100, (t.total_completed / t.total_needed) * 100)
            const isFull = t.total_completed >= t.total_needed
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover glow="amber">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--amber-glow)] flex items-center justify-center text-lg">
                        {TASK_TYPE_ICON[t.task_type]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold line-clamp-1">{t.content_link}</div>
                        <div className="text-xs text-[var(--text-muted)]">{TASK_TYPE_LABEL[t.task_type]} টাস্ক</div>
                      </div>
                    </div>
                    <Badge color="amber">+{t.points_per_action}</Badge>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-[var(--amber)] to-[var(--mint)] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)]">{t.total_completed}/{t.total_needed} সম্পন্ন</span>
                    <Button size="sm" disabled={isFull} onClick={() => startTask(t)}>
                      {isFull ? 'সম্পন্ন' : 'শুরু করুন'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Task Action Modal */}
      <AnimatePresence>
        {activeTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setActiveTask(null)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-[var(--bg-surface)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] w-full max-w-[480px] p-6 pb-8">
              <div className="w-9 h-1 bg-[var(--border)] rounded-full mx-auto mb-4 sm:hidden" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold line-clamp-1 flex-1">{activeTask.content_link}</h3>
                <button onClick={() => setActiveTask(null)} className="ml-2">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <Button fullWidth variant="secondary" onClick={handleOpenLink} disabled={linkOpened} className="mb-4">
                <ExternalLink className="w-4 h-4" /> লিংক খুলুন
              </Button>

              {linkOpened && (
                <div className="w-[110px] h-[110px] mx-auto mb-4 relative">
                  <svg width="110" height="110" className="-rotate-90">
                    <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="7" />
                    <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="var(--mint)" strokeWidth="7"
                      strokeLinecap="round" strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (timeLeft / TOTAL)}
                      style={{ transition: 'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{timeLeft}</div>
                </div>
              )}

              <p className="text-center text-sm text-[var(--text-muted)] mb-4">
                {!linkOpened ? 'প্রথমে লিংক খুলুন' : !timerDone ? 'টাইমার চলছে...' : '✓ সময় সম্পন্ন — স্ক্রিনশট দিন'}
              </p>

              {timerDone && (
                <div onClick={() => document.getElementById('task-file')?.click()}
                  className={`border-[1.5px] border-dashed rounded-[var(--radius-lg)] p-6 text-center cursor-pointer mb-4 transition ${file ? 'border-[var(--mint)] bg-[var(--mint-glow)]' : 'border-[var(--border)]'}`}>
                  <Camera className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
                  <div className="text-sm font-semibold">{file ? '✓ ' + file.name : 'স্ক্রিনশট আপলোড করুন'}</div>
                  <input id="task-file" type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </div>
              )}

              {error && <p className="text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-lg px-3 py-2 mb-3">{error}</p>}

              <Button fullWidth loading={submitting} disabled={!file || submitting} onClick={handleSubmit}>
                সাবমিট করুন
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--mint)] text-[#04261D] px-5 py-3 rounded-[var(--radius-lg)] text-sm font-semibold shadow-[var(--shadow-lg)] z-[200]">
          {toast}
        </motion.div>
      )}
    </div>
  )
}
