'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

/** Locked global header — same on every public page (per brand design system). */
const NAV_LINKS = [
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

export default function GlobalSiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isRent = searchParams.get('deal') === 'rent'

  return (
    <header className="site-marble-header" role="banner">
      <div className="site-marble-header__inner">
        <div className="site-marble-header__marble">
          <Link href="/" className="site-marble-header__logo-link" aria-label="Имоти Надежда — начало">
            <Logo marbleHeader className="site-marble-header__logo" />
          </Link>
          <svg className="site-marble-header__wave" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden>
            <path d="M0,0 L0,28 Q90,50 180,32 T360,36 T400,28 L400,0 Z" fill="var(--marble-white)" />
            <path
              d="M0,0 L0,22 Q110,40 220,26 T400,24 L400,0 Z"
              fill="none"
              stroke="url(#globalHeaderGold)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="globalHeaderGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8C878" />
                <stop offset="50%" stopColor="#CFA54A" />
                <stop offset="100%" stopColor="#E8C878" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="site-marble-header__nav-area">
          <nav className="luxury-nav-panel" aria-label="Основна навигация">
            {NAV_LINKS.map(({ href, label }, i) => {
              const active =
                href === '/about'
                  ? pathname === '/about' || pathname === '/contacts'
                  : href.includes('rent')
                    ? pathname.startsWith('/buy') && isRent
                    : pathname === '/' ||
                      ((pathname.startsWith('/buy') ||
                        pathname.startsWith('/cities') ||
                        pathname.startsWith('/sell')) &&
                        !isRent)
              return (
                <span key={href} className="flex items-center">
                  {i > 0 && <span className="luxury-nav-sep" aria-hidden />}
                  <Link href={href} className={`luxury-nav-link ${active ? 'is-active' : ''}`}>
                    {label}
                  </Link>
                </span>
              )
            })}
            <span className="luxury-nav-sep" aria-hidden />
            <ThemeToggle inPanel />
            <span className="luxury-nav-sep" aria-hidden />
            <Link href="/admin/login" className="luxury-user-ring" aria-label="Вход">
              <UserIcon />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
