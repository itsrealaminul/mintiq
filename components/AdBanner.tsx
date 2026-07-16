'use client'

import { useEffect, useRef } from 'react'

export function AdBanner300x250() {
  const ref = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true
    const s = document.createElement('script')
    s.src = 'https://pl29892400.effectivecpmnetwork.com/84/78/d4/8478d4246b380557aa79b8bf01df131d.js'
    s.async = true
    ref.current.appendChild(s)
  }, [])

  return <div ref={ref} className="flex justify-center my-4" />
}

export function AdSticky() {
  const ref = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true
    ;(window as any).atOptions = {
      key: 'bf8f7cbc1766450400c5c7f6f579333f',
      format: 'iframe',
      height: 250,
      width: 300,
      params: {},
    }
    const s = document.createElement('script')
    s.src = '//www.highperformanceformat.com/bf8f7cbc1766450400c5c7f6f579333f/invoke.js'
    s.async = true
    ref.current.appendChild(s)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-[var(--bg-deep)]/90 backdrop-blur-sm border-t border-[var(--border)]">
      <div ref={ref} />
    </div>
  )
}

export function AdNative() {
  const ref = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true
    const s = document.createElement('script')
    s.src = '//pl29892400.effectivecpmnetwork.com/84/78/d4/8478d4246b380557aa79b8bf01df131d.js'
    s.async = true
    ref.current.appendChild(s)
  }, [])

  return <div ref={ref} className="my-4" />
}
