'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Database, Video, ClipboardList, Gamepad2, ListChecks, CheckCircle2, Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { SAMPLE_VIDEOS, SAMPLE_SURVEYS, SAMPLE_GAMES, SAMPLE_TASKS } from '@/lib/seed-data'

export default function ContentPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const ADMIN_PASSWORD = '***'

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) setAuthenticated(true)
  }

  async function addVideos() {
    setLoading(prev => ({ ...prev, videos: true }))
    for (const v of SAMPLE_VIDEOS) {
      await supabase.from('video_tasks').insert({
        title: v.title,
        video_url: v.url,
        duration_seconds: v.duration,
        points_reward: v.points,
        watch_seconds_required: v.watch,
        max_watches: 500,
        is_active: true,
      })
    }
    setDone(prev => ({ ...prev, videos: true }))
    setLoading(prev => ({ ...prev, videos: false }))
  }

  async function addSurveys() {
    setLoading(prev => ({ ...prev, surveys: true }))
    for (const s of SAMPLE_SURVEYS) {
      await supabase.from('surveys').insert({
        title: s.title,
        description: s.desc,
        survey_url: s.url,
        points_reward: s.points,
        estimated_minutes: s.mins,
        max_completions: 1000,
        is_active: true,
      })
    }
    setDone(prev => ({ ...prev, surveys: true }))
    setLoading(prev => ({ ...prev, surveys: false }))
  }

  async function addGames() {
    setLoading(prev => ({ ...prev, games: true }))
    for (const g of SAMPLE_GAMES) {
      await supabase.from('games').insert({
        title: g.title,
        description: g.desc,
        game_url: g.url,
        points_per_play: g.points,
        max_plays_per_day: g.max,
        game_type: 'iframe',
        is_active: true,
      })
    }
    setDone(prev => ({ ...prev, games: true }))
    setLoading(prev => ({ ...prev, games: false }))
  }

  async function addTasks() {
    setLoading(prev => ({ ...prev, tasks: true }))
    // Get first user as owner
    const { data: users } = await supabase.from('profiles').select('id').limit(1)
    if (users && users.length > 0) {
      for (const t of SAMPLE_TASKS) {
        await supabase.from('tasks').insert({
          owner_id: users[0].id,
          content_link: t.link,
          task_type: t.type,
          points_per_action: t.points,
          total_needed: t.needed,
          total_completed: 0,
          status: 'active',
        })
      }
    }
    setDone(prev => ({ ...prev, tasks: true }))
    setLoading(prev => ({ ...prev, tasks: false }))
  }

  async function addAll() {
    await addVideos()
    await addSurveys()
    await addGames()
    await addTasks()
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <div className="text-center mb-6">
            <Database className="w-12 h-12 text-[var(--mint)] mx-auto mb-3" />
            <h1 className="text-xl font-bold">Content Manager</h1>
            <p className="text-sm text-[var(--text-muted)]">Admin access required</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--mint)]" />
            <Button type="submit" fullWidth>Access Content Manager</Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[var(--mint)]" />
            <h1 className="text-xl font-bold">MINTIQ Content Manager</h1>
          </div>
          <Button onClick={addAll} loading={Object.values(loading).some(Boolean)}>
            সব একসাথে যোগ করুন
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Videos */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[var(--cyan)]" />
                <h3 className="font-bold">Videos ({SAMPLE_VIDEOS.length})</h3>
              </div>
              {done.videos && <Badge color="mint">✓ Done</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3">YouTube videos যোগ করুন</p>
            <Button onClick={addVideos} loading={loading.videos} disabled={done.videos} fullWidth variant={done.videos ? 'secondary' : 'primary'}>
              {done.videos ? 'যোগ হয়েছে ✓' : 'Videos যোগ করুন'}
            </Button>
          </Card>

          {/* Surveys */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[var(--indigo)]" />
                <h3 className="font-bold">Surveys ({SAMPLE_SURVEYS.length})</h3>
              </div>
              {done.surveys && <Badge color="mint">✓ Done</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3">Google Forms surveys যোগ করুন</p>
            <Button onClick={addSurveys} loading={loading.surveys} disabled={done.surveys} fullWidth variant={done.surveys ? 'secondary' : 'primary'}>
              {done.surveys ? 'যোগ হয়েছে ✓' : 'Surveys যোগ করুন'}
            </Button>
          </Card>

          {/* Games */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[var(--pink)]" />
                <h3 className="font-bold">Games ({SAMPLE_GAMES.length})</h3>
              </div>
              {done.games && <Badge color="mint">✓ Done</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3">Online games যোগ করুন</p>
            <Button onClick={addGames} loading={loading.games} disabled={done.games} fullWidth variant={done.games ? 'secondary' : 'primary'}>
              {done.games ? 'যোগ হয়েছে ✓' : 'Games যোগ করুন'}
            </Button>
          </Card>

          {/* Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[var(--amber)]" />
                <h3 className="font-bold">Tasks ({SAMPLE_TASKS.length})</h3>
              </div>
              {done.tasks && <Badge color="mint">✓ Done</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3">Social media tasks যোগ করুন</p>
            <Button onClick={addTasks} loading={loading.tasks} disabled={done.tasks} fullWidth variant={done.tasks ? 'secondary' : 'primary'}>
              {done.tasks ? 'যোগ হয়েছে ✓' : 'Tasks যোগ করুন'}
            </Button>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <h3 className="font-bold mb-3">📋 Real Content যোগ করার নির্দেশনা:</h3>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold text-[var(--cyan)]">🎬 Videos:</div>
              <div className="text-[var(--text-muted)]">YouTube থেকে real video links নিন → Supabase video_tasks table এ যোগ করুন</div>
            </div>
            <div>
              <div className="font-semibold text-[var(--indigo)]">📝 Surveys:</div>
              <div className="text-[var(--text-muted)]">Google Forms এ survey বানান → link কপি করুন → Supabase surveys table এ যোগ করুন</div>
            </div>
            <div>
              <div className="font-semibold text-[var(--pink)]">🎮 Games:</div>
              <div className="text-[var(--text-muted)]">Free online games খুঁজুন (playsnake.org, 2048.io) → Supabase games table এ যোগ করুন</div>
            </div>
            <div>
              <div className="font-semibold text-[var(--amber)]">📋 Tasks:</div>
              <div className="text-[var(--text-muted)]">Facebook/Instagram/YouTube links দিন → Supabase tasks table এ যোগ করুন</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
