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
      {marbleHeader ? (
        <BrandLogo size="lg" asLink={false} className="logo--marble-header-brand" />
      ) : (
      <div
        className={[
          'logo-hero-glow__icon flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.03]',
          ceiling ? 'logo--ceiling__icon' : 'overflow-hidden',
        ].join(' ')}
        style={ceiling ? undefined : { width: s.iconW, height: containerH }}
      >
        {ceiling ? (
          <picture>
            <source
              srcSet="/images/logo-icon-hq-lossless.webp"
              type="image/webp"
            />
            <source srcSet="/images/logo-icon-hq.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-icon-hq.png"
              alt="Имоти Надежда"
              className="logo-hero-glow__img logo--ceiling__img"
              width={998}
              height={2048}
              decoding="sync"
              fetchPriority="high"
            />
          </picture>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/images/logo-icon-transparent.png"
            alt="Имоти Надежда"
            className="logo-hero-glow__img"
            style={{ width: s.iconW, height: naturalH, display: 'block' }}
          />
        )}
      </div>
      )}

      {!marbleHeader && (
        <span
          className={[
            'font-display font-bold uppercase leading-none mt-0.5 logo-hero-glow__text',
            ceiling ? 'logo--ceiling__text' : '',
            heroGlow && !ceiling ? '' : 'text-bordeaux',
          ].join(' ')}
          style={ceiling ? undefined : { fontSize: `${s.textSize}px`, letterSpacing: '0.14em' }}
        >
          ИМОТИ НАДЕЖДА
        </span>
      )}
    </Link>
  )
}
