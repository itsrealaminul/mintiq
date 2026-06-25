'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [fbLink, setFbLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
      // fb profile link আপডেট করি profile তৈরি হওয়ার পর
      if (data.user && fbLink) {
        await supabase
          .from('profiles')
          .update({ fb_profile_link: fbLink })
          .eq('id', data.user.id)
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
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
    <div className="min-h-screen flex flex-col justify-center px-5 py-10 max-w-[480px] mx-auto w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00D9A3] to-[#00B589] flex items-center justify-center font-bold text-[#04261D]">
            M
          </div>
          <span className="text-xl font-bold">MINTIQ</span>
        </div>
        <p className="text-sm text-[#8B8F99]">Creator-দের মধ্যে real cross-promotion</p>
      </div>

      {refCode && (
        <div className="bg-[#00D9A3]/10 border border-[#00D9A3]/30 rounded-xl px-4 py-3 mb-5 text-center">
          <p className="text-sm text-[#00D9A3] font-semibold">
            🎁 কারো রেফারেল লিংক থেকে এসেছেন — সাইন আপ করলে আপনিও ১০০ পয়েন্ট পাবেন
          </p>
        </div>
      )}

      <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-2xl p-5">
        <div className="flex gap-2 mb-5 bg-[#0F1115] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'signup' ? 'bg-[#00D9A3] text-[#04261D]' : 'text-[#8B8F99]'
            }`}
          >
            নতুন অ্যাকাউন্ট
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              mode === 'login' ? 'bg-[#00D9A3] text-[#04261D]' : 'text-[#8B8F99]'
            }`}
          >
            লগইন
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
                আপনার নাম
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="যেমন: রহিম উদ্দিন"
                className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
              ইমেইল
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ ক্যারেক্টার"
              className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
                Facebook প্রোফাইল লিংক (যাচাইয়ের জন্য)
              </label>
              <input
                type="text"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                placeholder="https://facebook.com/yourprofile"
                className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#00D9A3] text-[#04261D] font-bold py-3 rounded-lg text-sm mt-1 disabled:opacity-50"
          >
            {loading ? 'অপেক্ষা করুন...' : mode === 'signup' ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
          </button>
        </form>
      </div>

      {mode === 'signup' && (
        <p className="text-center text-xs text-[#8B8F99] mt-4">
          নতুন অ্যাকাউন্টে ১০০ পয়েন্ট ফ্রি পাবেন 🎁
        </p>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
