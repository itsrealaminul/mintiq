'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, BarChart3, PieChart } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { pointsToMoney, formatMoney, calculateRevenueStats } from '@/lib/revenue'

type RevenueStats = {
  totalUsers: number
  totalPoints: number
  totalWithdrawals: number
  totalAdViews: number
  totalVideoWatches: number
  totalSurveys: number
  totalGames: number
  totalTasks: number
  totalReferrals: number
  pendingWithdrawals: number
  monthlyRevenue: number
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    totalUsers: 0, totalPoints: 0, totalWithdrawals: 0,
    totalAdViews: 0, totalVideoWatches: 0, totalSurveys: 0,
    totalGames: 0, totalTasks: 0, totalReferrals: 0,
    pendingWithdrawals: 0, monthlyRevenue: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const supabase = createClient()

  const ADMIN_PASSWORD = 'mintiq2025'

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setAuthenticated(true)
  }

  const loadData = useCallback(async () => {
    // Get counts
    const [userCount, txData, withdrawalData] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('withdrawals').select('*').eq('status', 'pending'),
    ])

    if (txData.data) {
      setTransactions(txData.data)
      const revenueStats = calculateRevenueStats(txData.data)
      setStats({
        totalUsers: userCount.count || 0,
        totalPoints: revenueStats.totalPointsDistributed,
        totalWithdrawals: revenueStats.totalWithdrawalFees,
        totalAdViews: txData.data.filter((t: any) => t.type === 'ad_reward').length,
        totalVideoWatches: txData.data.filter((t: any) => t.type === 'video_reward').length,
        totalSurveys: txData.data.filter((t: any) => t.type === 'survey_reward').length,
        totalGames: txData.data.filter((t: any) => t.type === 'game_reward').length,
        totalTasks: txData.data.filter((t: any) => t.type === 'task_reward').length,
        totalReferrals: txData.data.filter((t: any) => t.type === 'referral_bonus').length,
        pendingWithdrawals: withdrawalData.data?.length || 0,
        monthlyRevenue: revenueStats.estimatedMonthlyProfit,
      })
    }
  }, [supabase])

  useEffect(() => { if (authenticated) loadData() }, [authenticated, loadData])

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <div className="text-center mb-6">
            <DollarSign className="w-12 h-12 text-[var(--amber)] mx-auto mb-3" />
            <h1 className="text-xl font-bold">Revenue Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)]">Admin access required</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--mint)]" />
            <button type="submit" className="w-full bg-[var(--amber)] text-[#04261D] font-bold py-3 rounded-[var(--radius-md)]">
              Access Revenue Dashboard
            </button>
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
            <DollarSign className="w-6 h-6 text-[var(--amber)]" />
            <h1 className="text-xl font-bold">MINTIQ Revenue Dashboard</h1>
          </div>
          <Badge color="amber">Admin Only</Badge>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'মোট ইউজার', value: stats.totalUsers, icon: Users, color: 'var(--mint)', prefix: '' },
            { label: 'মোট পয়েন্ট বিতরণ', value: stats.totalPoints, icon: TrendingUp, color: 'var(--cyan)', prefix: '' },
            { label: 'উত্তোলন Fee আয়', value: pointsToMoney(stats.totalWithdrawals), icon: DollarSign, color: 'var(--amber)', prefix: '৳' },
            { label: 'আনুমানিক মাসিক আয়', value: stats.monthlyRevenue, icon: BarChart3, color: 'var(--pink)', prefix: '৳' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <s.icon className="w-5 h-5 mb-1" style={{ color: s.color }} />
                <div className="text-lg font-bold" style={{ color: s.color }}>
                  {s.prefix}{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Ad Views', value: stats.totalAdViews, color: 'var(--mint)' },
            { label: 'Video Watches', value: stats.totalVideoWatches, color: 'var(--cyan)' },
            { label: 'Surveys', value: stats.totalSurveys, color: 'var(--indigo)' },
            { label: 'Game Plays', value: stats.totalGames, color: 'var(--pink)' },
            { label: 'Tasks', value: stats.totalTasks, color: 'var(--amber)' },
          ].map((s, i) => (
            <Card key={i}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[var(--mint)]" />
              Revenue Breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Ad Revenue', value: pointsToMoney(stats.totalAdViews * 2), color: 'var(--mint)', percent: 40 },
                { label: 'Withdrawal Fees', value: pointsToMoney(stats.totalWithdrawals), color: 'var(--amber)', percent: 25 },
                { label: 'Task Commission', value: pointsToMoney(stats.totalTasks * 5), color: 'var(--cyan)', percent: 20 },
                { label: 'Referral Commission', value: pointsToMoney(stats.totalReferrals * 100), color: 'var(--indigo)', percent: 15 },
              ].map((r, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{r.label}</span>
                    <span className="text-sm font-bold" style={{ color: r.color }}>{formatMoney(r.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.percent}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--amber)]" />
              Points Distribution
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Ad Rewards', points: stats.totalAdViews * 2, color: 'var(--mint)' },
                { label: 'Video Rewards', points: stats.totalVideoWatches * 10, color: 'var(--cyan)' },
                { label: 'Survey Rewards', points: stats.totalSurveys * 25, color: 'var(--indigo)' },
                { label: 'Game Rewards', points: stats.totalGames * 5, color: 'var(--pink)' },
                { label: 'Task Rewards', points: stats.totalTasks * 3, color: 'var(--amber)' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{p.label}</span>
                  <span className="text-sm font-bold" style={{ color: p.color }}>{p.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-4">
          <h3 className="font-bold mb-3">সাম্প্রতিক লেনদেন</h3>
          <div className="divide-y divide-[var(--border)]">
            {transactions.slice(0, 20).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2">
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
