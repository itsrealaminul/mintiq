'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'

export default function ReferralCard({ profile }: { profile: Profile }) {
  const [copied, setCopied] = useState(false)

  const referralLink =
    typeof window !== 'undefined' && profile.referral_code
      ? `${window.location.origin}/login?ref=${profile.referral_code}`
      : ''

  function handleCopy() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-2xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎁</span>
        <h3 className="text-sm font-bold">বন্ধুকে দাওয়াত দিন, ১০০ পয়েন্ট পান</h3>
      </div>
      <p className="text-xs text-[#8B8F99] mb-4">
        আপনার লিংক দিয়ে কেউ MINTIQ-এ যোগ দিলে আপনি পাবেন ১০০ পয়েন্ট — তিনিও পাবেন ১০০ পয়েন্ট ফ্রি।
      </p>

      <div className="flex gap-2">
        <div className="flex-1 bg-[#0F1115] border border-[#2A2E38] rounded-lg px-3 py-2.5 text-xs text-[#00D9A3] truncate">
          {referralLink || 'লোড হচ্ছে...'}
        </div>
        <button
          onClick={handleCopy}
          className="bg-[#00D9A3] text-[#04261D] text-xs font-bold px-4 rounded-lg whitespace-nowrap"
        >
          {copied ? '✓ কপি হয়েছে' : 'কপি করুন'}
        </button>
      </div>
    </div>
  )
}
