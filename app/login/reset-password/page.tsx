'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-10 max-w-[440px] mx-auto w-full">
      <Link href="/login" className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        লগইনে ফিরুন
      </Link>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[var(--mint-glow)] flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-[var(--mint)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">পাসওয়ার্ড রিসেট</h1>
        <p className="text-sm text-[var(--text-muted)]">আপনার ইমেইল দিন — আমি রিসেট লিংক পাঠাবো</p>
      </motion.div>

      {success ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center">
            <CheckCircle2 className="w-16 h-16 text-[var(--mint)] mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">ইমেইল পাঠানো হয়েছে!</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {email} এ একটা লিংক পাঠানো হয়েছে। ইমেইল চেক করুন এবং লিংকে ক্লিক করুন।
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              ⚠️ Spam/Junk folder ও চেক করুন
            </p>
            <Link href="/login">
              <Button fullWidth>লগইনে ফিরুন</Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="ইমেইল"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />

              {error && (
                <div className="flex items-center gap-2 text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" loading={loading}>
                রিসেট লিংক পাঠান
              </Button>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
