'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/ui/BrandLogo'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  className?: string
  /** White glow on dark hero / panorama backgrounds */
  heroGlow?: boolean
  /** Large logo on homepage white ceiling — HQ asset + CSS scale */
  ceiling?: boolean
  /** Align icon + text to the left (homepage ceiling) */
  alignStart?: boolean
  /** Fixed 172px logo in marble homepage header */
  marbleHeader?: boolean
}

const sizes = {
  sm:   { iconW: 72,  textSize: 11 },
  md:   { iconW: 96,  textSize: 13 },
  lg:   { iconW: 128, textSize: 15 },
  xl:   { iconW: 156, textSize: 17 },
  hero: { iconW: 320, textSize: 22 },
}

export default function Logo({
  size = 'md',
  className = '',
  heroGlow = false,
  ceiling = false,
  alignStart = false,
  marbleHeader = false,
}: LogoProps) {
  const effectiveSize = ceiling ? 'hero' : size
  const s = sizes[effectiveSize]
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
      className={[
        'flex flex-col group select-none -mt-1',
        marbleHeader ? 'items-center logo--marble-header' : alignStart || ceiling ? 'items-start' : 'items-center',
        heroGlow ? 'logo-hero-glow' : '',
        ceiling ? 'logo--ceiling' : '',
        className,
      ].join(' ')}
      aria-label="Имоти Надежда — начало"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-nadezhda-brand.png"
        alt="Имоти Надежда"
        className={[
          'logo-hero-glow__img block h-auto',
          ceiling ? 'logo--ceiling__img' : '',
        ].join(' ')}
        style={ceiling ? undefined : { width: s.iconW }}
        draggable={false}
      />
    </Link>
  )
}
