'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Shield, Users, Package, Wallet, CheckCircle2, XCircle, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

type Stats = {
  totalUsers: number
  totalTasks: number
  totalSubmissions: number
  pendingWithdrawals: number
  totalPoints: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTasks: 0, totalSubmissions: 0, pendingWithdrawals: 0, totalPoints: 0 })
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tab, setTab] = useState<'overview' | 'withdrawals' | 'submissions' | 'users'>('overview')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const supabase = createClient()

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mintiq2025'

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setAuthenticated(true)
  }

  const loadData = useCallback(async () => {
    const [subRes, withRes, userRes] = await Promise.all([
      supabase.from('submissions').select('*, tasks(content_link, task_type, points_per_action), profiles(display_name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('withdrawals').select('*, profiles(display_name, email)').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*').order('total_earned', { ascending: false }).limit(50),
    ])

    if (subRes.data) setSubmissions(subRes.data)
    if (withRes.data) setWithdrawals(withRes.data)
    if (userRes.data) setUsers(userRes.data)

    const [taskCount, subCount, withCount] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
      supabase.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    setStats({
      totalUsers: userRes.data?.length || 0,
      totalTasks: taskCount.count || 0,
      totalSubmissions: subCount.count || 0,
      pendingWithdrawals: withCount.count || 0,
      totalPoints: userRes.data?.reduce((sum: number, u: any) => sum + (u.points || 0), 0) || 0,
    })
  }, [supabase])

  useEffect(() => { if (authenticated) loadData() }, [authenticated, loadData])

  async function handleApproveWithdrawal(id: string) {
    await supabase.from('withdrawals').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', id)
    loadData()
  }

  async function handleRejectWithdrawal(id: string) {
    await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', id)
    loadData()
  }

  async function handleApproveSubmission(id: string) {
    await supabase.rpc('approve_submission', { submission_id: id })
    loadData()
  }

  async function handleRejectSubmission(id: string) {
    await supabase.rpc('reject_submission', { submission_id: id })
    loadData()
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-[var(--mint)] mx-auto mb-3" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-[var(--text-muted)]">পাসওয়ার্ড দিন</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--mint)]" />
            <Button type="submit" fullWidth>লগইন</Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--mint)]" />
            <h1 className="text-xl font-bold">MINTIQ Admin Panel</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAuthenticated(false)}>লগআউট</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'মোট ইউজার', value: stats.totalUsers, icon: Users, color: 'var(--mint)' },
            { label: 'মোট টাস্ক', value: stats.totalTasks, icon: Package, color: 'var(--cyan)' },
            { label: 'মোট সাবমিশন', value: stats.totalSubmissions, icon: Eye, color: 'var(--indigo)' },
            { label: 'পেন্ডিং উত্তোলন', value: stats.pendingWithdrawals, icon: Wallet, color: 'var(--amber)' },
            { label: 'মোট পয়েন্ট', value: stats.totalPoints, icon: TrendingUp, color: 'var(--pink)' },
          ].map((s, i) => (
            <Card key={i}>
              <s.icon className="w-5 h-5 mb-1" style={{ color: s.color }} />
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
            { id: 'withdrawals', label: `উত্তোলন (${stats.pendingWithdrawals})`, icon: Wallet },
            { id: 'submissions', label: 'সাবমিশন', icon: Eye },
            { id: 'users', label: 'ইউজার', icon: Users },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-[var(--mint-glow)] text-[var(--mint)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-bold mb-3">সাম্প্রতিক সাবমিশন</h3>
              <div className="space-y-2">
                {submissions.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between bg-[var(--bg-deep)] rounded-lg p-2">
                    <div>
                      <div className="text-xs font-semibold">{s.profiles?.display_name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{s.tasks?.content_link}</div>
                    </div>
                    <Badge color={s.status === 'approved' ? 'mint' : s.status === 'rejected' ? 'danger' : 'amber'} size="xs">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="font-bold mb-3">পেন্ডিং উত্তোলন</h3>
              <div className="space-y-2">
                {withdrawals.filter((w: any) => w.status === 'pending').slice(0, 5).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between bg-[var(--bg-deep)] rounded-lg p-2">
                    <div>
                      <div className="text-xs font-semibold">{w.profiles?.display_name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{w.amount} পয়েন্ট — {w.method}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleApproveWithdrawal(w.id)} className="w-7 h-7 flex items-center justify-center rounded bg-[var(--mint-glow)] text-[var(--mint)]">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRejectWithdrawal(w.id)} className="w-7 h-7 flex items-center justify-center rounded bg-[var(--danger-glow)] text-[var(--danger)]">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Withdrawals */}
        {tab === 'withdrawals' && (
          <Card padding={false}>
            <div className="divide-y divide-[var(--border)]">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">{w.profiles?.display_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{w.amount} পয়েন্ট — {w.method} — {w.account_number}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{new Date(w.created_at).toLocaleString('bn-BD')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={w.status === 'completed' ? 'mint' : w.status === 'rejected' ? 'danger' : 'amber'} size="xs">
                      {w.status}
                    </Badge>
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApproveWithdrawal(w.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--mint-glow)] text-[var(--mint)] hover:bg-[var(--mint)] hover:text-[#04261D]">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRejectWithdrawal(w.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--danger-glow)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submissions */}
        {tab === 'submissions' && (
          <Card padding={false}>
            <div className="divide-y divide-[var(--border)]">
              {submissions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    {s.screenshot_url && (
                      <a href={s.screenshot_url} target="_blank" rel="noopener noreferrer">
                        <img src={s.screenshot_url} alt="proof" className="w-10 h-10 rounded-lg object-cover" />
                      </a>
                    )}
                    <div>
                      <div className="text-sm font-semibold">{s.profiles?.display_name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{s.tasks?.content_link}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{new Date(s.created_at).toLocaleString('bn-BD')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={s.status === 'approved' ? 'mint' : s.status === 'rejected' ? 'danger' : 'amber'} size="xs">
                      {s.status}
                    </Badge>
                    {s.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApproveSubmission(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--mint-glow)] text-[var(--mint)] hover:bg-[var(--mint)] hover:text-[#04261D]">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRejectSubmission(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--danger-glow)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Users */}
        {tab === 'users' && (
          <Card padding={false}>
            <div className="divide-y divide-[var(--border)]">
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold">{u.display_name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color="mint" size="xs">লেভেল {u.level}</Badge>
                    <Badge color="amber" size="xs">{u.points} পয়েন্ট</Badge>
                    <span className="text-xs text-[var(--text-muted)]">{u.referral_count} রেফার</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
