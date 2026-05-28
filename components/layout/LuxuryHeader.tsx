'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/buy', label: 'За продажба' },
  { href: '/rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

export default function LuxuryHeader() {
  const pathname = usePathname()

  return (
    <header className="lux-header" role="banner">
      <div className="lux-header__bar" aria-hidden />
      <div className="lux-header__inner">
        <Link href="/" className="lux-header__brand" aria-label="Недвижими Имоти ИЛДЖ.ИА">
          <span className="lux-header__marble" aria-hidden />
          <span className="lux-header__ribbon" aria-hidden />
          <span className="lux-header__logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-icon-transparent.png"
              alt=""
              className="lux-header__logo-icon"
              width={52}
              height={106}
            />
            <span className="lux-header__logo-text">
              <span className="lux-header__logo-sub">Недвижими Имоти</span>
              <span className="lux-header__logo-main">ИЛДЖ.ИА</span>
            </span>
          </span>
        </Link>
        <nav className="lux-header__nav" aria-label="Основна навигация">
          {NAV.map(({ href, label }) => {
            const active =
              href === '/buy'
                ? pathname === '/buy' || pathname.startsWith('/cities')
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={`lux-header__link${active ? ' lux-header__link--active' : ''}`}
              >
                {label}
              </Link>
            )
          })}
          <Link href="/admin/login" className="lux-header__profile" aria-label="Профил">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  )
}
