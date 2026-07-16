'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, ArrowLeft, DollarSign, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { pointsToMoney, formatMoney } from '@/lib/revenue'

type UserDetails = {
  profile: any
  transactions: any[]
  withdrawals: any[]
  submissions: any[]
}

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const [data, setData] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const [profileRes, txRes, withRes, subRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
      supabase.from('withdrawals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('submissions').select('*, tasks(content_link, task_type, points_per_action)').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    setData({
      profile: profileRes.data,
      transactions: txRes.data || [],
      withdrawals: withRes.data || [],
      submissions: subRes.data || [],
    })
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => { loadData() }, [loadData])

  async function handleApproveWithdrawal(id: string) {
    await supabase.from('withdrawals').update({ status: 'completed', processed_at: new Date().toISOString() }).eq('id', id)
    loadData()
  }

  async function handleRejectWithdrawal(id: string) {
    await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString() }).eq('id', id)
    loadData()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">লোড হচ্ছে...</div>
  if (!data?.profile) return <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">ইউজার পাওয়া যায়নি</div>

  const { profile, transactions, withdrawals, submissions } = data

  // Calculate earnings by type
  const earningsByType = transactions.reduce((acc: any, tx: any) => {
    if (tx.amount > 0) {
      acc[tx.type] = (acc[tx.type] || 0) + tx.amount
    }
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6">
          <ArrowLeft className="w-4 h-4" /> Admin Panel
        </Link>

        {/* User Profile */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--mint-glow)] flex items-center justify-center">
              <User className="w-8 h-8 text-[var(--mint)]" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{profile.display_name}</h1>
              <p className="text-sm text-[var(--text-muted)]">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="mint">লেভেল {profile.level}</Badge>
                <Badge color="amber">{profile.points} পয়েন্ট</Badge>
                <Badge color="indigo">{profile.referral_count} রেফার</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[var(--mint)]">{formatMoney(pointsToMoney(profile.points))}</div>
              <div className="text-sm text-[var(--text-muted)]">বর্তমান ব্যালেন্স</div>
            </div>
          </div>
        </Card>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { type: 'ad_reward', label: 'Ad আয়', color: 'var(--mint)' },
            { type: 'video_reward', label: 'Video আয়', color: 'var(--cyan)' },
            { type: 'task_reward', label: 'Task আয়', color: 'var(--amber)' },
            { type: 'referral_bonus', label: 'রেফারেল', color: 'var(--indigo)' },
          ].map((e) => (
            <Card key={e.type}>
              <div className="text-lg font-bold" style={{ color: e.color }}>{earningsByType[e.type] || 0}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{e.label}</div>
              <div className="text-xs text-[var(--text-muted)]">{formatMoney(pointsToMoney(earningsByType[e.type] || 0))}</div>
            </Card>
          ))}
        </div>

        {/* Withdrawals */}
        <Card className="mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[var(--amber)]" />
            উত্তোলন History
          </h2>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">কোনো উত্তোলন নেই</p>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between bg-[var(--bg-deep)] rounded-lg p-3">
                  <div>
                    <div className="text-sm font-semibold">{w.amount} পয়েন্ট ({formatMoney(pointsToMoney(w.amount))})</div>
                    <div className="text-xs text-[var(--text-muted)]">{w.method.toUpperCase()} — {w.account_number}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{new Date(w.created_at).toLocaleString('bn-BD')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={w.status === 'completed' ? 'mint' : w.status === 'rejected' ? 'danger' : 'amber'} size="xs">
                      {w.status === 'completed' ? 'সম্পন্ন' : w.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                    </Badge>
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleApproveWithdrawal(w.id)} className="w-7 h-7 flex items-center justify-center rounded bg-[var(--mint-glow)] text-[var(--mint)]">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRejectWithdrawal(w.id)} className="w-7 h-7 flex items-center justify-center rounded bg-[var(--danger-glow)] text-[var(--danger)]">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--mint)]" />
            সাম্প্রতিক লেনদেন
          </h2>
          <div className="space-y-2">
            {transactions.slice(0, 20).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between bg-[var(--bg-deep)] rounded-lg p-3">
                <div>
                  <div className="text-sm">{tx.description}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{new Date(tx.created_at).toLocaleString('bn-BD')}</div>
                </div>
                <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-[var(--mint)]' : 'text-[var(--danger)]'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
