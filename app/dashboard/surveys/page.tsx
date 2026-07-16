'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ClipboardList, ExternalLink, Clock, CheckCircle2, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Survey } from '@/lib/types'

export default function SurveysPage() {
  const { profile, refreshProfile } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState('')
  const supabase = createClient()

  useEffect(() => { loadSurveys() }, [])

  async function loadSurveys() {
    const { data } = await supabase.from('surveys').select('*').eq('is_active', true).order('points_reward', { ascending: false })
    if (data) setSurveys(data as Survey[])

    if (profile) {
      const { data: comps } = await supabase
        .from('survey_completions')
        .select('survey_id')
        .eq('user_id', profile.id)
      if (comps) setCompleted(new Set(comps.map((c: { survey_id: string }) => c.survey_id)))
    }
  }

  async function handleComplete(survey: Survey) {
    if (!profile || completed.has(survey.id)) return
    window.open(survey.survey_url, '_blank')

    // Mark as pending
    const { error } = await supabase.from('survey_completions').insert({
      survey_id: survey.id,
      user_id: profile.id,
      status: 'pending',
    })
    if (!error) {
      showToast('সার্ভে সাবমিট হয়েছে — অনুমোদনের জন্য অপেক্ষা করুন')
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-[var(--indigo)]" />
          সার্ভে সম্পন্ন করুন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">সার্ভে পূরণ করে বেশি পয়েন্ট আয় করুন</p>
      </motion.div>

      <div className="grid gap-3">
        {surveys.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-[var(--text-muted)]">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">এখন কোনো সার্ভে নেই</p>
            </div>
          </Card>
        ) : (
          surveys.map((s, i) => {
            const isDone = completed.has(s.id)
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover glow="indigo" className={isDone ? 'opacity-50' : ''}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--indigo-glow)] flex items-center justify-center">
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-[var(--mint)]" /> : <ClipboardList className="w-5 h-5 text-[var(--indigo)]" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{s.title}</div>
                        <div className="text-xs text-[var(--text-muted)] mb-1">{s.description}</div>
                        <div className="flex items-center gap-2">
                          <Badge color="mint" size="xs">+{s.points_reward} পয়েন্ট</Badge>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> ~{s.estimated_minutes} মিনিট
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                            <Users className="w-3 h-3" /> {s.total_completions}/{s.max_completions}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isDone ? (
                      <Badge color="mint">সম্পন্ন</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(s)}>
                        <ExternalLink className="w-4 h-4" /> করুন
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--mint)] text-[#04261D] px-5 py-3 rounded-[var(--radius-lg)] text-sm font-semibold shadow-[var(--shadow-lg)] z-[200]">
          {toast}
        </motion.div>
      )}
    </div>
  )
}
