'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskType, TASK_TYPE_LABEL, TASK_REWARD } from '@/lib/types'

export default function NewTaskModal({
  userId,
  currentPoints,
  onClose,
  onCreated,
}: {
  userId: string
  currentPoints: number
  onClose: () => void
  onCreated: () => void
}) {
  const [taskType, setTaskType] = useState<TaskType>('view')
  const [link, setLink] = useState('')
  const [quantity, setQuantity] = useState(20)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const reward = TASK_REWARD[taskType]
  const cost = reward * quantity

  async function handleSubmit() {
    setError('')
    if (!link.trim()) {
      setError('কন্টেন্ট লিংক দিন')
      return
    }
    if (quantity < 5) {
      setError('কমপক্ষে ৫ জনের জন্য টাস্ক বানাতে হবে')
      return
    }
    if (cost > currentPoints) {
      setError(`পর্যাপ্ত পয়েন্ট নেই — আপনার আছে ${currentPoints} পয়েন্ট`)
      return
    }

    setSubmitting(true)

    const { error: taskError } = await supabase.from('tasks').insert({
      owner_id: userId,
      content_link: link.trim(),
      task_type: taskType,
      points_per_action: reward,
      total_needed: quantity,
      total_completed: 0,
      status: 'active',
    })

    if (taskError) {
      setError('সমস্যা হয়েছে: ' + taskError.message)
      setSubmitting(false)
      return
    }

    const { error: pointsError } = await supabase
      .from('profiles')
      .update({ points: currentPoints - cost })
      .eq('id', userId)

    if (pointsError) {
      setError('পয়েন্ট কাটতে সমস্যা: ' + pointsError.message)
      setSubmitting(false)
      return
    }

    onCreated()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end justify-center z-[100]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1A1D24] rounded-t-[20px] w-full max-w-[480px] p-6 pb-8">
        <div className="w-9 h-1 bg-[#2A2E38] rounded-full mx-auto mb-4" />
        <h3 className="text-[17px] font-bold mb-1">নতুন টাস্ক পোস্ট করুন</h3>
        <p className="text-[13px] text-[#8B8F99] mb-5">
          আপনার কন্টেন্ট অন্য ক্রিয়েটররা দেখবে — real মানুষ, real এনগেজমেন্ট
        </p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
            টাস্কের ধরন
          </label>
          <div className="flex gap-2">
            {(['view', 'follow', 'comment'] as TaskType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTaskType(t)}
                className={`flex-1 py-2.5 rounded-[10px] border text-[13px] font-semibold ${
                  taskType === t
                    ? 'border-[#00D9A3] bg-[#00D9A3]/10 text-[#00D9A3]'
                    : 'border-[#2A2E38] text-[#8B8F99]'
                }`}
              >
                {TASK_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
            কন্টেন্ট লিংক
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://facebook.com/..."
            className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
          />
        </div>

        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-[#8B8F99] mb-1.5">
            কতজনের কাছে পাঠাতে চান
          </label>
          <input
            type="number"
            min={5}
            max={200}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0F1115] border border-[#2A2E38] rounded-[10px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#00D9A3]"
          />
        </div>

        <div className="bg-[#0F1115] border border-[#2A2E38] rounded-xl px-3.5 py-3 flex justify-between items-center my-4 text-sm">
          <span>মোট খরচ হবে</span>
          <span className="font-bold text-[#FFB020]">{cost} পয়েন্ট</span>
        </div>

        {error && (
          <p className="text-xs text-[#FF5C5C] bg-[#FF5C5C]/10 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#00D9A3] text-[#04261D] font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {submitting ? 'পোস্ট হচ্ছে...' : 'টাস্ক পোস্ট করুন'}
        </button>
      </div>
    </div>
  )
}
