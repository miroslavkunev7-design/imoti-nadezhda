'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { iconW: 56,  line1: 9,  line2: 11 },
  md: { iconW: 72,  line1: 10, line2: 13 },
  lg: { iconW: 88,  line1: 11, line2: 15 },
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const s = sizes[size]
  const naturalH = Math.round(s.iconW * (1024 / 499))
  const containerH = Math.round(naturalH * 0.54)
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

    clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 600)
  }

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={`flex items-center gap-3 group select-none ${className}`}
      aria-label="Недвижими Имоти ИЛДЖ.ИА — начало"
    >
      <div
        className="flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ width: s.iconW, height: containerH }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-icon-transparent.png"
          alt=""
          style={{ width: s.iconW, height: naturalH, display: 'block', marginTop: -(naturalH - containerH) / 2 }}
        />
      </div>

      <div className="flex flex-col leading-tight min-w-0">
        <span
          className="font-body font-medium uppercase tracking-[0.12em]"
          style={{ fontSize: s.line1, color: '#7A0D28' }}
        >
          Недвижими Имоти
        </span>
        <span
          className="font-display font-bold uppercase tracking-[0.08em]"
          style={{ fontSize: s.line2, color: '#6B001C' }}
        >
          ИЛДЖ.ИА
        </span>
      </div>
    </Link>
  )
}
