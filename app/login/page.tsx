'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Mail, Lock, User, Facebook, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [fbLink, setFbLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            ...(refCode ? { referred_by_code: refCode } : {}),
          },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      // If session exists, user is logged in (email confirmation disabled)
      if (data.session) {
        // Save Facebook profile link if provided
        if (fbLink && data.user) {
          await supabase.from('profiles').update({ fb_profile_link: fbLink }).eq('id', data.user.id)
        }
        router.push('/dashboard')
        router.refresh()
      } else {
        // Email confirmation required — show confirmation message
        setConfirmationSent(true)
        setLoading(false)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-10 max-w-[440px] mx-auto w-full">
      {/* Back */}
      <Link href="/" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        হোমে ফিরুন
      </Link>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--mint)] to-[var(--mint-dark)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#04261D]" />
          </div>
          <span className="text-xl font-bold">MINTIQ</span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">টাকা আয় করুন — ফ্রি শুরু করুন</p>
      </motion.div>

      {/* Email Confirmation Screen */}
      {confirmationSent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--mint-glow)] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[var(--mint)]" />
          </div>
          <h2 className="text-lg font-bold mb-2">ইমেইল চেক করুন!</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            <span className="font-semibold text-[var(--text-primary)]">{email}</span> এ একটি কনফার্মেশন লিংক পাঠানো হয়েছে।
          </p>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            ইমেইলের লিংকে ক্লিক করে অ্যাকাউন্ট ভেরিফাই করুন, তারপর লগইন করুন।
          </p>
          <button
            onClick={() => { setConfirmationSent(false); setMode('login') }}
            className="w-full py-3 rounded-[var(--radius-lg)] bg-[var(--mint)] text-[#04261D] font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            লগইন পেজে যান
          </button>
        </motion.div>
      )}

      {/* Referral Banner */}
      {refCode && !confirmationSent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--mint-glow)] border border-[var(--mint)]/30 rounded-[var(--radius-lg)] px-4 py-3 mb-5 text-center"
        >
          <p className="text-sm text-[var(--mint)] font-semibold">
            🎁 রেফারেল বোনাস — সাইন আপ করলে ১০০ পয়েন্ট ফ্রি!
          </p>
        </motion.div>
      )}

      {/* Form Card */}
      {!confirmationSent && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6"
      >
        {/* Tab Switch */}
        <div className="flex gap-2 mb-6 bg-[var(--bg-deep)] p-1 rounded-[var(--radius-lg)]">
          {(['signup', 'login'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-[var(--mint)] text-[#04261D] shadow-[var(--shadow-glow-mint)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {m === 'signup' ? 'নতুন অ্যাকাউন্ট' : 'লগইন'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <Input
              label="আপনার নাম"
              value={displayName}
              onChange={setDisplayName}
              placeholder="যেমন: রহিম উদ্দিন"
              required
              icon={<User className="w-4 h-4" />}
            />
          )}

          <Input
            label="ইমেইল"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="পাসওয়ার্ড"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="কমপক্ষে ৬ ক্যারেক্টার"
            required
            minLength={6}
            icon={<Lock className="w-4 h-4" />}
          />

          {mode === 'signup' && (
            <Input
              label="Facebook প্রোফাইল লিংক (ঐচ্ছিক)"
              value={fbLink}
              onChange={setFbLink}
              placeholder="https://facebook.com/yourprofile"
              icon={<Facebook className="w-4 h-4" />}
            />
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-[var(--radius-md)] px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'অপেক্ষা করুন...' : mode === 'signup' ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
          </Button>

          {mode === 'login' && (
            <Link href="/login/reset-password" className="text-center text-sm text-[var(--mint)] hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          )}
        </form>
      </motion.div>}

      {mode === 'signup' && !confirmationSent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-[var(--text-muted)] mt-4"
        >
          নতুন অ্যাকাউন্টে ১০০ পয়েন্ট ফ্রি পাবেন 🎁
        </motion.p>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--mint)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
