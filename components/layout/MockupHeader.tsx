'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

export default function MockupHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isRent = searchParams.get('deal') === 'rent'

  return (
    <header className="mockup-header" role="banner">
      <div className="mockup-header__grid">
        <div className="mockup-header__logo-zone">
          <Logo marbleHeader className="mockup-header__logo" />
        </div>

        <div className="mockup-header__nav-zone">
          <nav className="mockup-header__nav" aria-label="Основна навигация">
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
                  {i > 0 && <span className="mockup-header__nav-sep" aria-hidden />}
                  <Link href={href} className={`mockup-header__nav-link ${active ? 'is-active' : ''}`}>
                    {label}
                  </Link>
                </span>
              )
            })}
            <span className="mockup-header__nav-sep" aria-hidden />
            <span className="mockup-header__icon-btn inline-flex">
              <ThemeToggle inPanel />
            </span>
            <span className="mockup-header__nav-sep" aria-hidden />
            <Link href="/admin/login" className="mockup-header__icon-btn" aria-label="Вход">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
