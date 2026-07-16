'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Users, Send, Headphones, ExternalLink } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SupportPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <Headphones className="w-12 h-12 text-[var(--mint)] mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">সাপোর্ট ও কমিউনিটি</h1>
        <p className="text-sm text-[var(--text-muted)]">আমাদের সাথে যোগাযোগ করুন</p>
      </motion.div>

      <div className="space-y-4">
        {/* Personal Telegram */}
        <Card hover glow="mint">
          <a href="https://t.me/aminulislam_34" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--mint-glow)] flex items-center justify-center">
              <Send className="w-7 h-7 text-[var(--mint)]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">পার্সনাল সাপোর্ট</div>
              <div className="text-sm text-[var(--text-muted)]">@aminulislam_34</div>
              <div className="text-xs text-[var(--mint)] mt-1">সরাসরি মেসেজ করুন</div>
            </div>
            <ExternalLink className="w-5 h-5 text-[var(--text-muted)]" />
          </a>
        </Card>

        {/* Community Channel */}
        <Card hover glow="amber">
          <a href="https://t.me/mintiqbd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--amber-glow)] flex items-center justify-center">
              <Users className="w-7 h-7 text-[var(--amber)]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">MINTIQ Community</div>
              <div className="text-sm text-[var(--text-muted)]">@mintiqbd</div>
              <div className="text-xs text-[var(--amber)] mt-1">আপডেট, টিপস, অফার</div>
            </div>
            <ExternalLink className="w-5 h-5 text-[var(--text-muted)]" />
          </a>
        </Card>

        {/* WhatsApp */}
        <Card hover glow="indigo">
          <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--indigo-glow)] flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-[var(--indigo)]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">WhatsApp সাপোর্ট</div>
              <div className="text-sm text-[var(--text-muted)]">শীঘ্রই আসছে</div>
              <div className="text-xs text-[var(--indigo)] mt-1">WhatsApp এ যোগাযোগ</div>
            </div>
            <ExternalLink className="w-5 h-5 text-[var(--text-muted)]" />
          </a>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="mt-6">
        <h3 className="font-bold mb-3">সাধারণ প্রশ্ন</h3>
        <div className="space-y-3">
          {[
            { q: 'পয়েন্ট কিভাবে আয় করব?', a: 'বিজ্ঞাপন দেখুন, ভিডিও দেখুন, সার্ভে করুন, গেম খেলুন, টাস্ক সম্পন্ন করুন।' },
            { q: 'টাকা কিভাবে তুলব?', a: 'ড্যাশবোর্ড → টাকা তুলুন → bKash/Nagad/Rocket/Bank সিলেক্ট করুন।' },
            { q: 'উত্তোলন কতক্ষণে পাব?', a: '২৪-৪৮ ঘণ্টার মধ্যে আপনার অ্যাকাউন্টে পাঠানো হবে।' },
            { q: 'রেফার কিভাবে করব?', a: 'ড্যাশবোর্ড → রেফারেল → লিংক কপি করে বন্ধুকে পাঠান।' },
          ].map((faq, i) => (
            <div key={i} className="bg-[var(--bg-deep)] rounded-[var(--radius-md)] p-3">
              <div className="text-sm font-semibold mb-1">❓ {faq.q}</div>
              <div className="text-xs text-[var(--text-muted)]">{faq.a}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
