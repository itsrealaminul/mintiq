'use client'

import { useEffect, useRef } from 'react'

export default function AdsterraBanner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return
    loadedRef.current = true

    ;(window as unknown as { atOptions?: Record<string, unknown> }).atOptions = {
      key: 'bf8f7cbc1766450400c5c7f6f579333f',
      format: 'iframe',
      height: 250,
      width: 300,
      params: {},
    }

    const script = document.createElement('script')
    script.src = 'https://www.highperformanceformat.com/bf8f7cbc1766450400c5c7f6f579333f/invoke.js'
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} style={{ width: 300, height: 250 }} />
    </div>
  )
}
