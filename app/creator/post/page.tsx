'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { TaskType, TASK_TYPE_LABEL, TASK_REWARD } from '@/lib/types'

export default function PostTaskPage() {
  const { profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [taskType, setTaskType] = useState<TaskType>('view')
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState(20)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const reward = TASK_REWARD[taskType]
  const cost = reward * quantity

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!link.trim()) { setError('কন্টেন্ট লিংক দিন'); return }
    if (quantity < 5) { setError('কমপক্ষে ৫ জনের জন্য টাস্ক বানাতে হবে'); return }
    if (!profile || cost > profile.points) {
      setError(`পর্যাপ্ত পয়েন্ট নেই — আপনার আছে ${profile?.points || 0} পয়েন্ট`)
      return
    }

    setSubmitting(true)

    const { error: taskError } = await supabase.from('tasks').insert({
      owner_id: profile.id,
      content_link: link.trim(),
      task_type: taskType,
      points_per_action: reward,
      total_needed: quantity,
      total_completed: 0,
      status: 'active',
    })

    if (taskError) {
      setError('সমস্যা: ' + taskError.message)
      setSubmitting(false)
      return
    }

    await supabase.from('profiles').update({ points: profile.points - cost }).eq('id', profile.id)
    await refreshProfile()
    router.push('/dashboard')
  }

  if (!profile) return null

  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ড
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1">নতুন টাস্ক পোস্ট করুন</h1>
        <p className="text-sm text-[var(--text-muted)]">আপনার কন্টেন্ট অন্য ক্রিয়েটররা দেখবে</p>
      </motion.div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">টাস্কের ধরন</label>
            <div className="grid grid-cols-3 gap-2">
              {(['view', 'follow', 'comment', 'like', 'subscribe', 'share'] as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTaskType(t)}
                  className={`py-2.5 rounded-[var(--radius-md)] border text-[13px] font-semibold transition-all ${
                    taskType === t
                      ? 'border-[var(--mint)] bg-[var(--mint-glow)] text-[var(--mint)]'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  {TASK_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="কন্টেন্ট লিংক"
            value={link}
            onChange={setLink}
            placeholder="https://facebook.com/..."
            required
          />

          <Input
            label="কতজনের কাছে পাঠাতে চান"
            type="number"
            value={quantity.toString()}
            onChange={(v) => setQuantity(parseInt(v) || 0)}
            placeholder="কমপক্ষে ৫"
            required
          />

          <div className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-lg)] px-4 py-3 flex justify-between items-center">
            <span className="text-sm">মোট খরচ</span>
            <div className="flex items-center gap-2">
              <Badge color="amber">{cost} পয়েন্ট</Badge>
              <span className="text-xs text-[var(--text-muted)]">(আপনার আছে {profile.points})</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={submitting}>
            <Plus className="w-5 h-5" /> টাস্ক পোস্ট করুন
          </Button>
        </form>
      </Card>
    </div>
  )
}
