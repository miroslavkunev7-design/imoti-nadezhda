'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// PNG is 499x1024. Houses span roughly y 5%–53% of height.
const sizes = {
  sm: { iconW: 48,  textTop: 7.5, textBot: 8.5 },
  md: { iconW: 60,  textTop: 9,   textBot: 10  },
  lg: { iconW: 76,  textTop: 11,  textBot: 12.5 },
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const s = sizes[size]
  const naturalH   = Math.round(s.iconW * (1024 / 499))
  const containerH = Math.round(naturalH * 0.54)
  const router     = useRouter()
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
      className={`flex flex-col items-center group select-none ${className}`}
      aria-label="Имоти Надежда — начало"
    >
      {/* House icon — cropped from PNG */}
      <div
        className="flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105"
        style={{ width: s.iconW, height: containerH }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-icon-transparent.png"
          alt="Имоти Надежда лого"
          style={{ width: s.iconW, height: naturalH, display: 'block' }}
        />
      </div>

      {/* Brand text — centered below icon */}
      <div className="flex flex-col items-center leading-none mt-0.5">
        <span
          className="font-body font-semibold uppercase text-themed-primary"
          style={{ fontSize: `${s.textTop}px`, letterSpacing: '0.10em' }}
        >
          Недвижими имоти
        </span>
        <span
          className="font-display font-bold text-crimson-700 uppercase"
          style={{ fontSize: `${s.textBot}px`, letterSpacing: '0.16em' }}
        >
          •Надежда•
        </span>
      </div>
    </Link>
  )
}
