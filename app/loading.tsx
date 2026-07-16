export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-3 border-[var(--mint)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">লোড হচ্ছে...</p>
      </div>
    </div>
  )
}
