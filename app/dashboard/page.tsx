'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Task, Submission } from '@/lib/types'
import TaskCard from '@/components/TaskCard'
import ActionModal from '@/components/ActionModal'
import NewTaskModal from '@/components/NewTaskModal'
import SubmissionList from '@/components/SubmissionList'
import AdsterraBanner from '@/components/AdsterraBanner'
import ReferralCard from '@/components/ReferralCard'

type Tab = 'browse' | 'mine' | 'history'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'browse', label: 'টাস্ক করুন', icon: '🎯' },
  { id: 'mine', label: 'আমার টাস্ক', icon: '📦' },
  { id: 'history', label: 'হিস্টোরি', icon: '🕓' },
]

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('browse')
  const [tasks, setTasks] = useState<Task[]>([])
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [history, setHistory] = useState<Submission[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  const loadTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'active')
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setTasks(data as Task[])
  }, [user, supabase])

  const loadMyTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setMyTasks(data as Task[])
  }, [user, supabase])

  const loadHistory = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setHistory(data as Submission[])
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadTasks()
      loadMyTasks()
      loadHistory()
    }
  }, [user, loadTasks, loadMyTasks, loadHistory])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  async function handleSubmitted() {
    setActiveTask(null)
    await loadHistory()
    showToast('সাবমিট হয়েছে — অনুমোদনের জন্য অপেক্ষা করুন')
  }

  async function handleNewTaskCreated() {
    setShowNewTask(false)
    await refreshProfile()
    await loadMyTasks()
    setBump(true)
    setTimeout(() => setBump(false), 200)
    showToast('✓ টাস্ক পোস্ট হয়েছে')
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#8B8F99] text-sm">
        লোড হচ্ছে...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* Sidebar (desktop) / Header (mobile) */}
      <header className="lg:w-64 lg:border-r lg:border-b-0 lg:flex-col lg:items-stretch lg:justify-start lg:px-5 lg:py-6 lg:sticky lg:top-0 lg:h-screen px-5 py-4 border-b border-[#2A2E38] flex items-center justify-between sticky top-0 bg-[#0F1115] z-10">
        <div className="flex items-center gap-2 font-bold text-[19px] lg:mb-8">
          <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br from-[#00D9A3] to-[#00B589] flex items-center justify-center text-sm lg:text-base font-bold text-[#04261D]">
            M
          </div>
          MINTIQ
        </div>

        {/* Nav tabs - shown in sidebar on desktop */}
        <nav className="hidden lg:flex lg:flex-col lg:gap-1 lg:mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition ${
                tab === t.id
                  ? 'bg-[#00D9A3]/10 text-[#00D9A3]'
                  : 'text-[#8B8F99] hover:bg-[#1A1D24]'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:gap-3 lg:mt-auto">
          <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-full lg:rounded-xl px-3.5 py-1.5 lg:py-2.5 flex items-center justify-center gap-1.5 text-sm font-semibold">
            <span className="w-[7px] h-[7px] bg-[#FFB020] rounded-full" />
            <span className={`tabular-nums transition-transform ${bump ? 'scale-125 text-[#FFB020]' : ''}`}>
              {profile.points}
            </span>{' '}
            পয়েন্ট
          </div>
          <button
            onClick={signOut}
            className="text-[#8B8F99] text-xs underline lg:no-underline lg:bg-[#1A1D24] lg:border lg:border-[#2A2E38] lg:rounded-xl lg:py-2 lg:text-center"
          >
            লগআউট
          </button>
        </div>
      </header>

      {/* Tabs (mobile only) */}
      <div className="flex lg:hidden px-5 gap-6 border-b border-[#2A2E38] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`pb-3 pt-3.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap ${
              tab === t.id ? 'text-[#00D9A3] border-[#00D9A3]' : 'text-[#8B8F99] border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 px-5 lg:px-10 py-4 lg:py-8 pb-28 lg:pb-10 w-full lg:overflow-y-auto">
        <div className="max-w-[480px] lg:max-w-[1100px] mx-auto lg:mx-0">
        {tab === 'browse' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-xs font-semibold text-[#8B8F99] uppercase tracking-wide">
                আজকের জন্য উপলব্ধ টাস্ক
              </div>
              <button
                onClick={() => setShowNewTask(true)}
                className="hidden lg:inline-flex bg-[#E8E8EA] text-[#0F1115] font-bold text-xs px-4 py-2 rounded-xl whitespace-nowrap"
              >
                + নতুন টাস্ক পোস্ট করুন
              </button>
            </div>
            {tasks.length === 0 ? (
              <EmptyState icon="📭" title="এখন কোনো টাস্ক নেই" desc="কিছুক্ষণ পর আবার চেক করুন" />
            ) : (
              <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
                {tasks.map((t, i) => (
                  <React.Fragment key={t.id}>
                    <TaskCard task={t} onStart={setActiveTask} />
                    {(i + 1) % 3 === 0 && (
                      <div className="lg:col-span-full">
                        <AdsterraBanner />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'mine' && (
          <div>
            <ReferralCard profile={profile} />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-xs font-semibold text-[#8B8F99] uppercase tracking-wide">
                আপনার পোস্ট করা টাস্ক
              </div>
              <button
                onClick={() => setShowNewTask(true)}
                className="hidden lg:inline-flex bg-[#E8E8EA] text-[#0F1115] font-bold text-xs px-4 py-2 rounded-xl whitespace-nowrap"
              >
                + নতুন টাস্ক পোস্ট করুন
              </button>
            </div>
            {myTasks.length === 0 ? (
              <EmptyState icon="📦" title="কোনো টাস্ক পোস্ট করেননি" desc="নিচের বাটনে ক্লিক করে শুরু করুন" />
            ) : (
              <div className="lg:grid lg:grid-cols-2 lg:gap-4">
                {myTasks.map((t) => (
                  <div key={t.id} className="bg-[#1A1D24] border border-[#2A2E38] rounded-2xl p-4 mb-3 lg:mb-0">
                    <div className="text-sm font-semibold line-clamp-1 mb-1">{t.content_link}</div>
                    <div className="text-xs text-[#8B8F99] mb-2.5">স্ট্যাটাস: {t.status === 'active' ? 'চলমান' : t.status}</div>
                    <div className="w-full h-[5px] bg-[#2A2E38] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00D9A3] to-[#00B589] rounded-full"
                        style={{ width: `${Math.min(100, (t.total_completed / t.total_needed) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#8B8F99] mt-1.5">
                      {t.total_completed}/{t.total_needed} সম্পন্ন
                    </div>
                    <button
                      onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                      className="text-xs text-[#00D9A3] font-semibold mt-2.5"
                    >
                      {expandedTaskId === t.id ? '▲ সাবমিশন বন্ধ করুন' : '▼ সাবমিশন রিভিউ করুন'}
                    </button>
                    {expandedTaskId === t.id && (
                      <SubmissionList
                        taskId={t.id}
                        onUpdated={() => {
                          loadMyTasks()
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div className="text-xs font-semibold text-[#8B8F99] uppercase tracking-wide mb-3">
              আপনার সাবমিশন
            </div>
            {history.length === 0 ? (
              <EmptyState icon="🕓" title="এখনও কোনো সাবমিশন নেই" desc="টাস্ক করলে এখানে দেখাবে" />
            ) : (
              <div className="lg:grid lg:grid-cols-2 lg:gap-3">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="bg-[#1A1D24] border border-[#2A2E38] rounded-2xl p-4 mb-3 lg:mb-0 flex justify-between items-start"
                  >
                    <div>
                      <div className="text-sm font-semibold mb-1">
                        {new Date(h.created_at).toLocaleString('bn-BD')}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                        h.status === 'approved'
                          ? 'text-[#00D9A3] bg-[#00D9A3]/10'
                          : h.status === 'rejected'
                          ? 'text-[#FF5C5C] bg-[#FF5C5C]/10'
                          : 'text-[#FFB020] bg-[#FFB020]/10'
                      }`}
                    >
                      {h.status === 'approved' ? 'অনুমোদিত' : h.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* FAB (mobile only) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5">
        <button
          onClick={() => setShowNewTask(true)}
          className="w-full bg-[#E8E8EA] text-[#0F1115] font-bold py-[15px] rounded-2xl text-sm shadow-2xl"
        >
          + নতুন টাস্ক পোস্ট করুন
        </button>
      </div>

      {/* Modals */}
      {activeTask && (
        <ActionModal
          task={activeTask}
          userId={user.id}
          onClose={() => setActiveTask(null)}
          onSubmitted={handleSubmitted}
        />
      )}
      {showNewTask && (
        <NewTaskModal
          userId={user.id}
          currentPoints={profile.points}
          onClose={() => setShowNewTask(false)}
          onCreated={handleNewTaskCreated}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#00D9A3] text-[#04261D] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl z-[200] max-w-[90%]">
          {toast}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-16 px-5 text-[#8B8F99]">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <div className="text-sm font-semibold text-[#E8E8EA] mb-1">{title}</div>
      <div className="text-xs">{desc}</div>
    </div>
  )
}
