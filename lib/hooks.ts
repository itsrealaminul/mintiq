'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from './supabase/client'
import type { Transaction, Achievement, UserAchievement } from './types'

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => { load() }, [load])

  return { transactions, loading, refresh: load }
}

export function useAchievements(userId: string | undefined) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const [achRes, uaRes] = await Promise.all([
      supabase.from('achievements').select('*').order('requirement_value'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
    ])
    if (achRes.data) setAchievements(achRes.data as Achievement[])
    if (uaRes.data) setUnlocked(uaRes.data.map((u: { achievement_id: string }) => u.achievement_id))
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => { load() }, [load])

  return { achievements, unlocked, loading, refresh: load }
}

export function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (end === 0) { setCount(0); return }
    let start = 0
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const current = Math.floor(eased * end)
      setCount(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration])

  return count
}
