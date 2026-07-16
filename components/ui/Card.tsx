'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Card({
  children,
  className = '',
  hover = false,
  glow,
  padding = true,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'mint' | 'amber' | 'indigo'
  padding?: boolean
  onClick?: () => void
}) {
  const glowStyles = {
    mint: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-[var(--mint)]/30',
    amber: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-[var(--amber)]/30',
    indigo: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-[var(--indigo)]/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] transition-all duration-300',
        !!padding && 'p-5',
        !!hover && 'cursor-pointer',
        hover && glow && glowStyles[glow],
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
