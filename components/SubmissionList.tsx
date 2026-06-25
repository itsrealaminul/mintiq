'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Submission } from '@/lib/types'

export default function SubmissionList({
  taskId,
  onUpdated,
}: {
  taskId: string
  onUpdated: () => void
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  async function loadSubmissions() {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    if (data) setSubmissions(data as Submission[])
    setLoading(false)
  }

  async function handleApprove(submissionId: string) {
    setProcessingId(submissionId)
    const { error } = await supabase.rpc('approve_submission', {
      submission_id: submissionId,
    })
    if (!error) {
      await loadSubmissions()
      onUpdated()
    }
    setProcessingId(null)
  }

  async function handleReject(submissionId: string) {
    setProcessingId(submissionId)
    const { error } = await supabase.rpc('reject_submission', {
      submission_id: submissionId,
    })
    if (!error) {
      await loadSubmissions()
      onUpdated()
    }
    setProcessingId(null)
  }

  const pending = submissions.filter((s) => s.status === 'pending')
  const processed = submissions.filter((s) => s.status !== 'pending')

  if (loading) {
    return <div className="text-xs text-[#8B8F99] py-3">লোড হচ্ছে...</div>
  }

  if (submissions.length === 0) {
    return <div className="text-xs text-[#8B8F99] py-3">এখনো কোনো সাবমিশন নেই</div>
  }

  return (
    <div className="mt-3 border-t border-[#2A2E38] pt-3">
      {pending.length > 0 && (
        <div className="mb-2">
          <div className="text-[11px] font-semibold text-[#FFB020] mb-2">
            পেন্ডিং রিভিউ ({pending.length})
          </div>
          {pending.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-[#0F1115] border border-[#2A2E38] rounded-xl p-2.5 mb-2"
            >
              {s.screenshot_url && (
                <a href={s.screenshot_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={s.screenshot_url}
                    alt="proof"
                    className="w-12 h-12 rounded-lg object-cover border border-[#2A2E38]"
                  />
                </a>
              )}
              <div className="flex-1 text-[11px] text-[#8B8F99]">
                {new Date(s.created_at).toLocaleString('bn-BD')}
              </div>
              <button
                onClick={() => handleApprove(s.id)}
                disabled={processingId === s.id}
                className="bg-[#00D9A3] text-[#04261D] text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                ✓ অনুমোদন
              </button>
              <button
                onClick={() => handleReject(s.id)}
                disabled={processingId === s.id}
                className="bg-[#FF5C5C]/10 text-[#FF5C5C] text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-[#8B8F99] mb-2">প্রসেস হয়েছে</div>
          {processed.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-[#0F1115]/50 rounded-xl p-2.5 mb-1.5"
            >
              <span className="text-[11px] text-[#8B8F99]">
                {new Date(s.created_at).toLocaleString('bn-BD')}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                  s.status === 'approved'
                    ? 'text-[#00D9A3] bg-[#00D9A3]/10'
                    : 'text-[#FF5C5C] bg-[#FF5C5C]/10'
                }`}
              >
                {s.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
