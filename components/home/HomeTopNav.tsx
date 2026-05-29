'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

export default function HomeTopNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isRent = searchParams.get('deal') === 'rent'

  return (
    <header className="m1-nav" role="banner">
      <nav className="m1-nav__links" aria-label="Основна навигация">
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
              {i > 0 && <span className="m1-nav__sep" aria-hidden />}
              <Link href={href} className={`m1-nav__link ${active ? 'is-active' : ''}`}>
                {label}
              </Link>
            </span>
          )
        })}
      </nav>
      <div className="m1-nav__tools">
        <span className="m1-nav__ring inline-flex">
          <ThemeToggle inPanel />
        </span>
        <Link href="/admin/login" className="m1-nav__ring" aria-label="Вход">
          <UserIcon />
        </Link>
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
