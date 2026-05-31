'use client'

import Link from 'next/link'

type HeaderVariant = 'marble' | 'on-photo'

/** Споделен header + nav за трите Burgas екрана (макет 1–3). */
export function BurgasHeader({
  marbleId = 'burgasMarble',
  variant = 'marble',
}: {
  marbleId?: string
  variant?: HeaderVariant
}) {
  if (variant === 'on-photo') {
    return (
      <header className="cb-top cb-top--photo" aria-label="Главна навигация">
        <Link href="/" className="cb-brand-badge" aria-label="Начало">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-nadezhda-brand.png" alt="Имоти Надежда" className="cb-brand-badge__img" draggable={false} />
        </Link>
        <nav className="cb-nav cb-nav--light" aria-label="Навигация">
          <Link href="/buy" className="cb-nav__link">За продажба</Link>
          <span className="cb-nav__sep" aria-hidden />
          <Link href="/buy?deal=rent" className="cb-nav__link">Под наем</Link>
          <span className="cb-nav__sep" aria-hidden />
          <Link href="/about" className="cb-nav__link">За нас</Link>
          <Link href="/admin/login" className="cb-nav__user" aria-label="Вход">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </nav>
      </header>
    )
  }

  return (
    <header className="cb-top" aria-label="Главна навигация">
      <svg className="cb-top__surface" viewBox="0 0 940 166" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id={marbleId} patternUnits="userSpaceOnUse" width="940" height="166">
            <image
              href="/images/texture-marble-white-gold.png"
              x="0"
              y="0"
              width="940"
              height="166"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
          <linearGradient id={`${marbleId}Gold`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#3d2006" />
            <stop offset="0.15" stopColor="#8b5e1a" />
            <stop offset="0.30" stopColor="#c9882e" />
            <stop offset="0.42" stopColor="#e6b44a" />
            <stop offset="0.50" stopColor="#f0cc6a" />
            <stop offset="0.58" stopColor="#e6b44a" />
            <stop offset="0.70" stopColor="#c08025" />
            <stop offset="0.85" stopColor="#7a4c14" />
            <stop offset="1" stopColor="#3a1e05" />
          </linearGradient>
        </defs>
        <path
          d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"
          fill={`url(#${marbleId})`}
          stroke="rgba(190,138,42,0.35)"
          strokeWidth="1"
        />
        <path
          d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0 H478 C438 25 416 52 371 70 C330 86 300 89 281 105 C257 125 246 147 216 159 C153 181 70 174 0 164 Z"
          fill={`url(#${marbleId}Gold)`}
          opacity="0.96"
        />
        <path
          d="M274 88 C329 71 365 47 392 0 H449 C412 24 394 49 354 64 C315 79 294 79 274 88 Z"
          fill="rgba(255,242,184,0.64)"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
      <Link href="/" className="cb-brand" aria-label="Начало">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-nadezhda-brand.png" alt="Имоти Надежда" className="cb-brand__img" draggable={false} />
      </Link>
      <nav className="cb-nav" aria-label="Навигация">
        <Link href="/buy" className="cb-nav__link">За продажба</Link>
        <span className="cb-nav__sep" aria-hidden />
        <Link href="/buy?deal=rent" className="cb-nav__link">Под наем</Link>
        <span className="cb-nav__sep" aria-hidden />
        <Link href="/about" className="cb-nav__link">За нас</Link>
        <Link href="/admin/login" className="cb-nav__user" aria-label="Вход">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
      </nav>
    </header>
  )
}
