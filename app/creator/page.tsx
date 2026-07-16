'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Package, BarChart3, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Task, Submission } from '@/lib/types'
import { TASK_TYPE_LABEL } from '@/lib/types'

export default function CreatorDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  const loadTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
  }, [user, supabase])

  useEffect(() => { loadTasks() }, [loadTasks])

  async function loadSubmissions(taskId: string) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    if (data) setSubmissions((prev) => ({ ...prev, [taskId]: data as Submission[] }))
  }

  async function handleApprove(submissionId: string, taskId: string) {
    await supabase.rpc('approve_submission', { submission_id: submissionId })
    await loadSubmissions(taskId)
    await loadTasks()
  }

  async function handleReject(submissionId: string, taskId: string) {
    await supabase.rpc('reject_submission', { submission_id: submissionId })
    await loadSubmissions(taskId)
  }

  if (loading || !user || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">লোড হচ্ছে...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">ক্রিয়েটর ড্যাশবোর্ড</h1>
          <p className="text-sm text-[var(--text-muted)]">আপনার টাস্ক পরিচালনা করুন</p>
        </div>
        <Link href="/creator/post">
          <Button><Plus className="w-4 h-4" /> নতুন টাস্ক</Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {tasks.length === 0 ? (
          <Card>
            <div className="text-center py-10 text-[var(--text-muted)]">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-3">এখনো কোনো টাস্ক পোস্ট করেননি</p>
              <Link href="/creator/post">
                <Button size="sm">প্রথম টাস্ক পোস্ট করুন</Button>
              </Link>
            </div>
          </Card>
        ) : (
          tasks.map((t) => {
            const pct = Math.min(100, (t.total_completed / t.total_needed) * 100)
            const taskSubs = submissions[t.id] || []
            const pending = taskSubs.filter((s) => s.status === 'pending')
            return (
              <Card key={t.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-sm mb-0.5 line-clamp-1">{t.content_link}</div>
                    <div className="flex items-center gap-2">
                      <Badge color="mint" size="xs">{TASK_TYPE_LABEL[t.task_type]}</Badge>
                      <Badge color={t.status === 'active' ? 'amber' : 'indigo'} size="xs">{t.status === 'active' ? 'চলমান' : t.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--amber)]">+{t.points_per_action}/জন</div>
                  </div>
                </div>

                <div className="w-full h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[var(--text-muted)]">{t.total_completed}/{t.total_needed} সম্পন্ন</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    <BarChart3 className="w-3 h-3 inline mr-1" />
                    {pct.toFixed(0)}%
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    if (expandedTask === t.id) {
                      setExpandedTask(null)
                    } else {
                      setExpandedTask(t.id)
                      loadSubmissions(t.id)
                    }
                  }}
                >
                  {expandedTask === t.id ? '▲ সাবমিশন বন্ধ' : `▼ সাবমিশন দেখুন (${pending.length} পেন্ডিং)`}
                </Button>

                {expandedTask === t.id && (
                  <div className="mt-3 border-t border-[var(--border)] pt-3 space-y-2">
                    {taskSubs.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] text-center py-3">কোনো সাবমিশন নেই</p>
                    ) : (
                      taskSubs.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 bg-[var(--bg-deep)] rounded-[var(--radius-md)] p-3">
                          {s.screenshot_url && (
                            <a href={s.screenshot_url} target="_blank" rel="noopener noreferrer">
                              <img src={s.screenshot_url} alt="proof" className="w-12 h-12 rounded-lg object-cover" />
                            </a>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[var(--text-muted)]">
                              {new Date(s.created_at).toLocaleString('bn-BD')}
                            </div>
                            <Badge
                              color={s.status === 'approved' ? 'mint' : s.status === 'rejected' ? 'danger' : 'amber'}
                              size="xs"
                            >
                              {s.status === 'approved' ? 'অনুমোদিত' : s.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                            </Badge>
                          </div>
                          {s.status === 'pending' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleApprove(s.id, t.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--mint-glow)] text-[var(--mint)] hover:bg-[var(--mint)] hover:text-[#04261D] transition-all">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReject(s.id, t.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--danger-glow)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
