'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-[var(--danger)] mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">কিছু ভুল হয়েছে!</h1>
        <p className="text-[var(--text-muted)] mb-6">
          একটা অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="secondary">
            <RefreshCw className="w-4 h-4" /> আবার চেষ্টা
          </Button>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4" /> হোম
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
