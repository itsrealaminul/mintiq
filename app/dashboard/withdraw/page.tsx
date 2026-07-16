'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { WITHDRAWAL_METHODS } from '@/lib/types'
import { formatPoints } from '@/lib/utils'

const MIN_WITHDRAW = 500

export default function WithdrawPage() {
  const { profile } = useAuth()
  const [method, setMethod] = useState<string>('bkash')
  const [amount, setAmount] = useState('')
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const numAmount = parseInt(amount)
    if (!numAmount || numAmount < MIN_WITHDRAW) {
      setError(`সর্বনিম্ন ${MIN_WITHDRAW} পয়েন্ট তুলতে পারবেন`)
      return
    }
    if (!profile || numAmount > profile.points) {
      setError('পর্যাপ্ত পয়েন্ট নেই')
      return
    }
    if (!account.trim()) {
      setError('অ্যাকাউন্ট নম্বর দিন')
      return
    }

    setLoading(true)
    const { error: insertError } = await supabase.from('withdrawals').insert({
      user_id: profile.id,
      amount: numAmount,
      method,
      account_number: account.trim(),
    })

    if (insertError) {
      setError('সমস্যা হয়েছে: ' + insertError.message)
      setLoading(false)
      return
    }

    // Deduct points
    await supabase.from('profiles').update({ points: profile.points - numAmount }).eq('id', profile.id)

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'withdrawal',
      amount: -numAmount,
      balance_after: profile.points - numAmount,
      description: `উত্তোলন — ${method.toUpperCase()} ${account.trim()}`,
    })

    setSuccess(true)
    setLoading(false)
  }

  if (!profile) return null

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-[var(--mint)]" />
          টাকা তুলুন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">পয়েন্ট টাকায় রূপান্তর করে তুলুন</p>
      </motion.div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-[var(--mint-glow)] to-[var(--amber-glow)]">
        <div className="text-center">
          <div className="text-sm text-[var(--text-muted)] mb-1">আপনার ব্যালেন্স</div>
          <div className="text-3xl font-bold gradient-text">{formatPoints(profile.points)} পয়েন্ট</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">≈ ৳{(profile.points * 0.1).toFixed(0)} (আনুমানিক)</div>
        </div>
      </Card>

      {success ? (
        <Card className="text-center">
          <CheckCircle2 className="w-16 h-16 text-[var(--mint)] mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">উত্তোলন রিকোয়েস্ট সফল!</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">আপনার রিকোয়েস্ট প্রসেস হচ্ছে — ২৪-৪৮ ঘণ্টার মধ্যে টাকা পাবেন</p>
          <Button onClick={() => { setSuccess(false); setAmount(''); setAccount('') }}>
            আরেকটি রিকোয়েস্ট
          </Button>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Method Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-2">পেমেন্ট মেথড</label>
              <div className="grid grid-cols-2 gap-2">
                {WITHDRAWAL_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-2 p-3 rounded-[var(--radius-md)] border text-sm font-semibold transition-all ${
                      method === m.id
                        ? 'border-[var(--mint)] bg-[var(--mint-glow)] text-[var(--mint)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)]'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="অ্যাকাউন্ট নম্বর"
              value={account}
              onChange={setAccount}
              placeholder={method === 'bank' ? 'ব্যাংক অ্যাকাউন্ট নম্বর' : `${method.toUpperCase()} নম্বর`}
              required
            />

            <Input
              label={`পয়েন্ট (সর্বনিম্ন ${MIN_WITHDRAW})`}
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder={`সর্বনিম্ন ${MIN_WITHDRAW} পয়েন্ট`}
              required
            />

            {error && (
              <div className="flex items-center gap-2 text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              উত্তোলন রিকোয়েস্ট করুন
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
