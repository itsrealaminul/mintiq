'use client'

import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { Users, Copy, Gift, Share2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { generateReferralLink } from '@/lib/utils'

export default function ReferralPage() {
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!profile) return null

  const referralLink = generateReferralLink(profile.referral_code || '')

  function handleCopy() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'MINTIQ — ফ্রি টাকা আয় করুন!',
        text: 'MINTIQ-এ যোগ দিন এবং ১০০ পয়েন্ট ফ্রি পান!',
        url: referralLink,
      })
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-[var(--indigo)]" />
          রেফারেল
        </h1>
        <p className="text-sm text-[var(--text-muted)]">বন্ধুকে দাওয়াত দিন — দুজনেই ১০০ পয়েন্ট পাবেন</p>
      </motion.div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <Users className="w-6 h-6 text-[var(--indigo)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--indigo)]">{profile.referral_count}</div>
          <div className="text-xs text-[var(--text-muted)]">রেফার করেছেন</div>
        </Card>
        <Card className="text-center">
          <Gift className="w-6 h-6 text-[var(--amber)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--amber)]">{profile.referral_count * 100}</div>
          <div className="text-xs text-[var(--text-muted)]">রেফার বোনাস</div>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="mb-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-[var(--mint)]" />
          আপনার রেফারেল লিংক
        </h3>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--mint)] truncate font-mono">
            {referralLink || 'লোড হচ্ছে...'}
          </div>
          <Button size="sm" onClick={handleCopy} variant={copied ? 'secondary' : 'primary'}>
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'কপি!' : 'কপি'}
          </Button>
        </div>

        {typeof navigator.share === "function" && (
          <Button fullWidth variant="secondary" onClick={handleShare}>
            <Share2 className="w-4 h-4" /> শেয়ার করুন
          </Button>
        )}
      </Card>

      {/* How it works */}
      <Card>
        <h3 className="font-bold mb-3">কিভাবে কাজ করে?</h3>
        <div className="space-y-3">
          {[
            { step: '১', text: 'আপনার রেফারেল লিংক কপি করুন' },
            { step: '২', text: 'বন্ধুর সাথে শেয়ার করুন' },
            { step: '৩', text: 'বন্ধু সাইন আপ করলে দুজনেই ১০০ পয়েন্ট পাবেন' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--indigo-glow)] flex items-center justify-center text-sm font-bold text-[var(--indigo)]">
                {s.step}
              </div>
              <span className="text-sm">{s.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
