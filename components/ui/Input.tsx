'use client'

import { cn } from '@/lib/utils'

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  error,
  icon,
  className = '',
}: {
  label?: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  error?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </div>
        )}
        <input
          type={type}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-[var(--radius-md)]',
            'px-3 py-2.5 text-sm text-[var(--text-primary)]',
            'focus:outline-none focus:border-[var(--mint)] focus:shadow-[0_0_0_2px_var(--mint-glow)]',
            'transition-all duration-200 placeholder:text-[var(--text-muted)]',
            icon && 'pl-10',
            error && 'border-[var(--danger)]',
          )}
        />
      </div>
      {error && (
        <p className="text-xs text-[var(--danger)] mt-1">{error}</p>
      )}
    </div>
  )
}
