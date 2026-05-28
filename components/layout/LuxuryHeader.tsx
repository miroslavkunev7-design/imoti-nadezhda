'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LuxuryLogo from '@/components/ui/LuxuryLogo'

const NAV = [
  { href: '/buy', label: 'За продажба' },
  { href: '/rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
] as const

export default function LuxuryHeader() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/buy') return pathname === '/buy' || pathname.startsWith('/cities')
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className="lux-header" role="banner">
      <div className="lux-header__inner">
        <div className="lux-header__brand-panel">
          <LuxuryLogo />
          <span className="lux-header__gold-ribbon" aria-hidden />
        </div>

        <nav className="lux-header__nav-area" aria-label="Основна навигация">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`lux-header__link lux-header__link--hide-mobile ${isActive(href) ? 'is-active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="lux-header__profile"
            aria-label="Профил"
          >
            <ProfileIcon />
          </Link>
        </nav>
      </div>
    </header>
  )
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
