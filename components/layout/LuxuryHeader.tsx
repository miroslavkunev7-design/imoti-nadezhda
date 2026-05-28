'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV = [
  {
    href: '/buy',
    label: 'За продажба',
    isActive: (path: string, listing: string) =>
      (path === '/buy' || path.startsWith('/cities')) && listing !== 'rent',
  },
  {
    href: '/buy?listing=rent',
    label: 'Под наем',
    isActive: (_path: string, listing: string) => listing === 'rent',
  },
  {
    href: '/about',
    label: 'За нас',
    isActive: (path: string) => path === '/about',
  },
] as const

export default function LuxuryHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const listing = searchParams.get('listing') ?? ''

  return (
    <header className="lux-header" role="banner">
      <div className="lux-header__bar" aria-hidden />
      <div className="lux-header__inner">
        <div className="lux-header__brand">
          <span className="lux-header__ribbon" aria-hidden />
          <Link href="/" className="lux-header__logo-wrap" aria-label="Имоти ИЛДЖ.ИА — начало">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-icon-transparent.png"
              alt=""
              className="lux-header__logo-icon"
              width={52}
              height={106}
            />
            <div className="lux-header__logo-text">
              <span className="lux-header__logo-line1">Недвижими</span>
              <span className="lux-header__logo-line2">Имоти</span>
              <span className="lux-header__logo-line3">ИЛДЖ.ИА</span>
            </div>
          </Link>
        </div>

        <nav className="lux-header__nav" aria-label="Основна навигация">
          {NAV.map(({ href, label, isActive }) => {
            const active =
              label === 'Под наем'
                ? isActive(pathname, listing)
                : isActive(pathname, listing)
            return (
              <Link
                key={href}
                href={href}
                className={`lux-header__link${active ? ' is-active' : ''}`}
              >
                {label}
              </Link>
            )
          })}
          <Link href="/admin/login" className="lux-header__profile" aria-label="Профил">
            <ProfileIcon />
          </Link>
        </nav>
      </div>
    </header>
  )
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
