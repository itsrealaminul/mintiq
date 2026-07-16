'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles, Eye, Video, ClipboardList, Gamepad2,
  Wallet, Shield, Zap, Users, Star, ArrowRight, TrendingUp
} from 'lucide-react'
import Button from '@/components/ui/Button'

const FEATURES = [
  { icon: Eye, title: 'বিজ্ঞাপন দেখুন', desc: 'ছোট বিজ্ঞাপন দেখে পয়েন্ট আয় করুন', color: 'var(--mint)' },
  { icon: Video, title: 'ভিডিও দেখুন', desc: 'ভিডিও দেখে বোনাস পয়েন্ট পান', color: 'var(--cyan)' },
  { icon: ClipboardList, title: 'সার্ভে সম্পন্ন করুন', desc: 'সার্ভে পূরণ করে বেশি আয় করুন', color: 'var(--indigo)' },
  { icon: Gamepad2, title: 'গেম খেলুন', desc: 'মজার গেম খেলে পয়েন্ট পান', color: 'var(--pink)' },
  { icon: Users, title: 'বন্ধুকে দাওয়াত দিন', desc: 'রেফার করে ১০০ পয়েন্ট বোনাস', color: 'var(--amber)' },
  { icon: Wallet, title: 'টাকা তুলুন', desc: 'bKash, Nagad-এ সরাসরি টাকা তুলুন', color: 'var(--mint)' },
]

const STATS = [
  { value: '৫০,০০০+', label: 'সক্রিয় সদস্য' },
  { value: '১০ লক্ষ+', label: 'পয়েন্ট বিতরণ' },
  { value: '৫,০০০+', label: 'সফল উত্তোলন' },
  { value: '৪.৮★', label: 'ইউজার রেটিং' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--mint)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-deep)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--mint)] to-[var(--mint-dark)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#04261D]" />
            </div>
            <span className="text-lg font-bold">MINTIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">লগইন</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">শুরু করুন</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-5">
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--mint)]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[var(--mint-glow)] border border-[var(--mint)]/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-[var(--mint)]" />
              <span className="text-sm font-semibold text-[var(--mint)]">বাংলাদেশের #১ মাইক্রো আর্নিং প্ল্যাটফর্ম</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">সহজে আয় করুন</span>
              <br />
              <span className="text-[var(--text-secondary)] text-2xl sm:text-3xl lg:text-4xl font-medium">
                বিজ্ঞাপন • ভিডিও • সার্ভে • গেম
              </span>
            </h1>

            <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              বিজ্ঞাপন দেখুন, ভিডিও দেখুন, সার্ভে সম্পন্ন করুন, গেম খেলুন — পয়েন্ট আয় করুন এবং
              bKash, Nagad-এ সরাসরি টাকা তুলুন। কোনো বিনিয়োগ লাগে না।
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button size="lg" fullWidth className="sm:w-auto">
                  <Sparkles className="w-5 h-5" />
                  ফ্রি শুরু করুন
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                  কিভাবে কাজ করে?
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-[var(--text-muted)]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">কিভাবে আয় করবেন?</h2>
            <p className="text-[var(--text-muted)]">৬টি সহজ উপায়ে পয়েন্ট আয় করুন</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--mint)]/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.1)] transition-all duration-300 group"
              >
                <div
                  className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold mb-1 group-hover:text-[var(--mint)] transition-colors">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5 bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">৩ ধাপে শুরু করুন</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '১', title: 'অ্যাকাউন্ট বানান', desc: 'ফ্রি সাইন আপ করুন — ১০০ পয়েন্ট বোনাস পান', icon: Users },
              { step: '২', title: 'কাজ করুন', desc: 'বিজ্ঞাপন, ভিডিও, সার্ভে, গেম — যেকোনো করুন', icon: TrendingUp },
              { step: '৩', title: 'টাকা তুলুন', desc: 'পয়েন্ট জমা করুন এবং টাকা তুলুন', icon: Wallet },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--mint)] to-[var(--mint-dark)] flex items-center justify-center mx-auto mb-4 text-xl font-bold text-[#04261D]">
                  {s.step}
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-2xl)] p-10"
          >
            <Star className="w-10 h-10 text-[var(--amber)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">এখনই শুরু করুন!</h2>
            <p className="text-[var(--text-muted)] mb-6">ফ্রি সাইন আপ — ১০০ পয়েন্ট বোনাস পান</p>
            <Link href="/login">
              <Button size="lg">
                <Sparkles className="w-5 h-5" />
                এখনই যোগ দিন
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--mint)]" />
            <span className="font-semibold text-[var(--text-primary)]">MINTIQ</span>
          </div>
          <p>© ২০২৫ MINTIQ — সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </footer>
    </div>
  )
}
