'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { iconW: 72,  textSize: 11 },
  md: { iconW: 96,  textSize: 13 },
  lg: { iconW: 128, textSize: 15 },
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
      className={`flex flex-col items-center group select-none -mt-1 ${className}`}
      aria-label="Имоти Надежда — начало"
    >
      <div
        className="flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
        style={{ width: s.iconW, height: containerH }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-icon-transparent.png"
          alt="Имоти Надежда"
          style={{ width: s.iconW, height: naturalH, display: 'block' }}
        />
      </div>

      <span
        className="font-display font-bold text-crimson-700 uppercase leading-none mt-0.5"
        style={{ fontSize: `${s.textSize}px`, letterSpacing: '0.14em' }}
      >
        «НАДЕЖДА»
      </span>
    </Link>
  )
}
