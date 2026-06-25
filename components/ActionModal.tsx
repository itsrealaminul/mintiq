'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/lib/types'

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
function toBn(n: number) {
  return String(Math.max(n, 0))
    .split('')
    .map((d) => bnDigits[parseInt(d)])
    .join('')
}

export default function ActionModal({
  task,
  userId,
  onClose,
  onSubmitted,
}: {
  task: Task
  userId: string
  onClose: () => void
  onSubmitted: () => void
}) {
  const [linkOpened, setLinkOpened] = useState(false)
  const [timeLeft, setTimeLeft] = useState(11)
  const [timerDone, setTimerDone] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const TOTAL = 11
  const RADIUS = 48
  const CIRC = 2 * Math.PI * RADIUS

  useEffect(() => {
    if (!linkOpened) return
    if (timeLeft <= 0) {
      setTimerDone(true)
      return
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000)
    return () => clearTimeout(t)
  }, [linkOpened, timeLeft])

  function handleOpenLink() {
    window.open(task.content_link, '_blank')
    setLinkOpened(true)
  }

  async function handleSubmit() {
    if (!file) return
    setSubmitting(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${task.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(path, file)

      if (uploadError) {
        setError('আপলোড সমস্যা: ' + uploadError.message)
        setSubmitting(false)
        return
      }

      const { data: urlData } = supabase.storage.from('screenshots').getPublicUrl(path)

      const { error: insertError } = await supabase.from('submissions').insert({
        task_id: task.id,
        user_id: userId,
        screenshot_url: urlData.publicUrl,
        timer_completed: true,
        status: 'pending',
      })

      if (insertError) {
        setError('সাবমিট সমস্যা: ' + insertError.message)
        setSubmitting(false)
        return
      }

      onSubmitted()
    } catch (err) {
      setError('কিছু ভুল হয়েছে, আবার চেষ্টা করুন')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A1D24] rounded-t-[20px] sm:rounded-[20px] w-full max-w-[480px] p-6 pb-8 animate-in">
        <div className="w-9 h-1 bg-[#2A2E38] rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-[17px] font-bold mb-1">{task.content_link}</h3>
        <p className="text-[13px] text-[#8B8F99] mb-5">
          লিংকে গিয়ে কমপক্ষে ১১ সেকেন্ড থাকুন, তারপর স্ক্রিনশট দিন
        </p>

        <button
          onClick={handleOpenLink}
          disabled={linkOpened}
          className="block w-full text-center bg-[#0F1115] border border-[#2A2E38] text-[#00D9A3] py-3 rounded-xl text-[13px] font-semibold mb-4 disabled:opacity-50"
        >
          🔗 লিংক খুলুন
        </button>

        {linkOpened && (
          <div className="w-[110px] h-[110px] mx-auto mb-4 relative">
            <svg width="110" height="110" className="-rotate-90">
              <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="#2A2E38" strokeWidth="7" />
              <circle
                cx="55"
                cy="55"
                r={RADIUS}
                fill="none"
                stroke="#00D9A3"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (timeLeft / TOTAL)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums">
              {toBn(timeLeft)}
            </div>
          </div>
        )}

        <p className="text-center text-[13px] text-[#8B8F99] mb-4">
          {!linkOpened
            ? 'প্রথমে লিংক খুলুন'
            : !timerDone
            ? 'টাইমার চলছে... পেজে থাকুন'
            : '✓ সময় সম্পন্ন — এখন স্ক্রিনশট দিন'}
        </p>

        {timerDone && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-[1.5px] border-dashed rounded-2xl p-6 text-center cursor-pointer mb-4 transition ${
              file
                ? 'border-[#00D9A3] border-solid bg-[#00D9A3]/10'
                : 'border-[#2A2E38]'
            }`}
          >
            <div className="text-[28px] mb-2">📸</div>
            <div className="text-[13px] font-semibold mb-0.5">
              {file ? '✓ ' + file.name : 'স্ক্রিনশট আপলোড করুন'}
            </div>
            {!file && (
              <div className="text-[11px] text-[#8B8F99]">প্রমাণ হিসেবে এটাই যাবে</div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || submitting}
          className="w-full bg-[#00D9A3] disabled:bg-[#2A2E38] disabled:text-[#8B8F99] text-[#04261D] font-bold py-3 rounded-xl text-sm"
        >
          {submitting ? 'সাবমিট হচ্ছে...' : 'সাবমিট করুন'}
        </button>
      </div>
    </div>
  )
}
