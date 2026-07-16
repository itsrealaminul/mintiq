'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Play, Trophy, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Game } from '@/lib/types'

export default function GamesPage() {
  const { profile, refreshProfile } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [playing, setPlaying] = useState<Game | null>(null)
  const [playsLeft, setPlaysLeft] = useState<Record<string, number>>({})
  const [toast, setToast] = useState('')
  const supabase = createClient()

  useEffect(() => { loadGames() }, [])

  async function loadGames() {
    const { data } = await supabase.from('games').select('*').eq('is_active', true).order('points_per_play', { ascending: false })
    if (data) setGames(data as Game[])

    // Load plays today
    if (profile) {
      const today = new Date().toISOString().split('T')[0]
      const { data: plays } = await supabase
        .from('game_plays')
        .select('game_id')
        .eq('user_id', profile.id)
        .gte('played_at', today)

      if (plays) {
        const counts: Record<string, number> = {}
        for (const p of plays) {
          counts[p.game_id] = (counts[p.game_id] || 0) + 1
        }
        const left: Record<string, number> = {}
        for (const g of data) {
          left[g.id] = g.max_plays_per_day - (counts[g.id] || 0)
        }
        setPlaysLeft(left)
      }
    }
  }

  async function handlePlay(game: Game) {
    if (!profile || (playsLeft[game.id] || 0) <= 0) return

    if (game.game_type === 'iframe') {
      setPlaying(game)
    } else {
      window.open(game.game_url, '_blank')
    }

    // Record play
    const { data, error } = await supabase.rpc('record_game_play', {
      _game_id: game.id,
      _user_id: profile.id,
      _score: Math.floor(Math.random() * 100),
    })
    if (!error && data > 0) {
      setPlaysLeft((prev) => ({ ...prev, [game.id]: (prev[game.id] || 1) - 1 }))
      await refreshProfile()
      showToast(`+${data} পয়েন্ট পেয়েছেন! 🎮`)
    }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold mb-1 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-[var(--pink)]" />
          গেম খেলুন
        </h1>
        <p className="text-sm text-[var(--text-muted)]">মজার গেম খেলে পয়েন্ট আয় করুন — প্রতিদিন সীমিত সংখ্যক পারবেন</p>
      </motion.div>

      {/* Game Play Modal */}
      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-4 max-w-lg w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{playing.title}</h3>
                <button onClick={() => setPlaying(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-deep)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-square bg-[var(--bg-deep)] rounded-[var(--radius-md)] flex items-center justify-center">
                <iframe src={playing.game_url} className="w-full h-full rounded-[var(--radius-md)]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 gap-3">
        {games.length === 0 ? (
          <Card className="sm:col-span-2">
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">এখন কোনো গেম নেই</p>
            </div>
          </Card>
        ) : (
          games.map((g, i) => {
            const left = playsLeft[g.id] || 0
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover glow="amber" className={left <= 0 ? 'opacity-50' : ''}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[rgba(236,72,153,0.15)] flex items-center justify-center mx-auto mb-3">
                      <Gamepad2 className="w-8 h-8 text-[var(--pink)]" />
                    </div>
                    <div className="font-bold mb-1">{g.title}</div>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{g.description}</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge color="mint">+{g.points_per_play} পয়েন্ট</Badge>
                      <Badge color="amber">{left}/{g.max_plays_per_day} বাকি</Badge>
                    </div>
                    <Button size="sm" fullWidth disabled={left <= 0} onClick={() => handlePlay(g)}>
                      <Play className="w-4 h-4" /> খেলুন
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-[var(--mint)] text-[#04261D] px-5 py-3 rounded-[var(--radius-lg)] text-sm font-semibold shadow-[var(--shadow-lg)] z-[200]">
          {toast}
        </motion.div>
      )}
    </div>
  )
}
