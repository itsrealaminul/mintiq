export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer bg-[var(--bg-elevated)] rounded-[var(--radius-md)] ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-[var(--radius-md)]" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-3" />
      <Skeleton className="h-9 w-full rounded-[var(--radius-md)]" />
    </div>
  )
}
