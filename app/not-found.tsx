'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">পেজ পাওয়া যায়নি</h1>
        <p className="text-[var(--text-muted)] mb-6">
          আপনি যে পেজ খুঁজছেন সেটা নেই বা সরানো হয়েছে।
        </p>
        <Link href="/">
          <Button>
            <Home className="w-4 h-4" /> হোমে ফিরুন
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
