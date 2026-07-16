import { cn } from '@/lib/utils'

type Color = 'mint' | 'amber' | 'indigo' | 'danger' | 'cyan' | 'pink'

const colors: Record<Color, string> = {
  mint: 'bg-[var(--mint-glow)] text-[var(--mint)]',
  amber: 'bg-[var(--amber-glow)] text-[var(--amber)]',
  indigo: 'bg-[var(--indigo-glow)] text-[var(--indigo)]',
  danger: 'bg-[var(--danger-glow)] text-[var(--danger)]',
  cyan: 'bg-[rgba(6,182,212,0.15)] text-[var(--cyan)]',
  pink: 'bg-[rgba(236,72,153,0.15)] text-[var(--pink)]',
}

export default function Badge({
  children,
  color = 'mint',
  size = 'sm',
  className = '',
}: {
  children: React.ReactNode
  color?: Color
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-1',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span
      className={cn(
        'font-bold rounded-[var(--radius-sm)] uppercase',
        colors[color],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
