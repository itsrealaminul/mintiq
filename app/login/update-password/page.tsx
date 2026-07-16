'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না')
      return
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-10 max-w-[440px] mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[var(--mint-glow)] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-[var(--mint)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">নতুন পাসওয়ার্ড</h1>
        <p className="text-sm text-[var(--text-muted)]">আপনার নতুন পাসওয়ার্ড দিন</p>
      </motion.div>

      {success ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center">
            <CheckCircle2 className="w-16 h-16 text-[var(--mint)] mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">পাসওয়ার্ড আপডেট হয়েছে!</h2>
            <p className="text-sm text-[var(--text-muted)]">আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="নতুন পাসওয়ার্ড"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="কমপক্ষে ৬ অক্ষর"
                required
                minLength={6}
                icon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="পাসওয়ার্ড নিশ্চিত করুন"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="আবার লিখুন"
                required
                minLength={6}
                icon={<Lock className="w-4 h-4" />}
              />

              {error && (
                <div className="flex items-center gap-2 text-xs text-[var(--danger)] bg-[var(--danger-glow)] rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" loading={loading}>
                পাসওয়ার্ড আপডেট করুন
              </Button>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--mint)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UpdatePasswordForm />
    </Suspense>
  )
}
