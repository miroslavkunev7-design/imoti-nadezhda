'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import BrandLogo from '@/components/ui/BrandLogo'

const NAV = [
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

export default function HomeCloneHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isRent = searchParams.get('deal') === 'rent'

  return (
    <header className="hc-header">
      <div className="hc-marble-panel">
        <svg className="hc-marble-panel__svg" viewBox="0 0 420 160" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="hcMarbleFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="55%" stopColor="#FAF7F2" />
              <stop offset="100%" stopColor="#F0E8DE" />
            </linearGradient>
            <linearGradient id="hcGoldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E8C878" />
              <stop offset="50%" stopColor="#CFA54A" />
              <stop offset="100%" stopColor="#E8C878" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L420,0 L420,88 Q380,108 340,118 Q280,132 220,138 Q140,148 70,152 Q30,156 0,158 Z"
            fill="url(#hcMarbleFill)"
          />
          <path
            d="M0,158 Q80,142 180,128 Q300,108 420,92"
            fill="none"
            stroke="url(#hcGoldEdge)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M-20,120 Q60,95 140,105 Q200,112 260,100"
            fill="none"
            stroke="#CFA54A"
            strokeWidth="2"
            opacity="0.55"
          />
        </svg>

        <BrandLogo size="hc" className="hc-logo" />
      </div>

      <nav className="hc-nav" aria-label="Навигация">
        {NAV.map(({ href, label }) => {
          const active =
            href === '/about'
              ? pathname === '/about' || pathname === '/contacts'
              : href.includes('rent')
                ? pathname.startsWith('/buy') && isRent
                : pathname === '/' ||
                  ((pathname.startsWith('/buy') || pathname.startsWith('/cities')) && !isRent)
          return (
            <Link key={href} href={href} className={`hc-nav__link ${active ? 'is-active' : ''}`}>
              {label}
            </Link>
          )
        })}
        <Link href="/admin/login" className="hc-nav__user" aria-label="Вход">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
      </nav>
    </header>
  )
}
