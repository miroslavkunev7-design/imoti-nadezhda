'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BRAND } from '@/lib/design/brand'

interface LuxuryLogoProps {
  className?: string
}

export default function LuxuryLogo({ className = '' }: LuxuryLogoProps) {
  const router = useRouter()
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLogoClick(e: React.MouseEvent) {
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      e.preventDefault()
      router.push('/admin')
      return
    }
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, 600)
  }

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={`relative z-10 flex flex-col gap-0.5 select-none ${className}`}
      aria-label={`${BRAND.fullName} — начало`}
    >
      <span className="lux-logo__line1">Недвижими Имоти</span>
      <span className="lux-logo__line2">{BRAND.name}</span>
    </Link>
  )
}
