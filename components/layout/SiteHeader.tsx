'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV = [
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/about', label: 'За нас' },
]

interface Props {
  /** Dark background (panorama) — white text nav */
  dark?: boolean
}

export default function SiteHeader({ dark = false }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isRent = searchParams.get('deal') === 'rent'
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/about') return pathname === '/about' || pathname === '/contacts'
    if (href.includes('rent')) return pathname.startsWith('/buy') && isRent
    return (
      pathname === '/' ||
      ((pathname.startsWith('/buy') || pathname.startsWith('/cities') || pathname.startsWith('/sell')) && !isRent)
    )
  }

  return (
    <>
      <header className={`rd-header ${dark ? 'rd-header--dark' : ''}`} role="banner">
        {/* ── Marble logo panel ── */}
        <div className="rd-header__marble-panel">
          {/* Marble SVG background */}
          <svg className="rd-header__marble-svg" viewBox="0 0 308 88" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="rdMarble" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF8" />
                <stop offset="55%" stopColor="#FAF7F2" />
                <stop offset="100%" stopColor="#F0E8DE" />
              </linearGradient>
              <linearGradient id="rdGoldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E8C878" />
                <stop offset="50%" stopColor="#CFA54A" />
                <stop offset="100%" stopColor="#E8C878" />
              </linearGradient>
              {/* Marble vein texture */}
              <filter id="rdNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
                <feBlend in="SourceGraphic" mode="overlay" result="noisy" />
                <feComposite in="noisy" in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
            {/* Main shape */}
            <path
              d="M0,0 L308,0 L308,62 Q268,78 220,82 Q160,88 100,86 Q48,85 0,88 Z"
              fill="url(#rdMarble)"
            />
            {/* Marble noise overlay */}
            <path
              d="M0,0 L308,0 L308,62 Q268,78 220,82 Q160,88 100,86 Q48,85 0,88 Z"
              fill="rgba(180,160,130,0.06)"
            />
            {/* Gold bottom edge */}
            <path
              d="M0,88 Q60,80 130,82 Q200,84 260,75 Q285,70 308,62"
              fill="none"
              stroke="url(#rdGoldEdge)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Marble vein 1 */}
            <path
              d="M20,20 Q80,32 140,18 Q200,8 260,30"
              fill="none" stroke="rgba(207,165,74,0.18)" strokeWidth="1.5"
            />
            {/* Marble vein 2 */}
            <path
              d="M0,45 Q60,38 120,48 Q180,56 240,44"
              fill="none" stroke="rgba(200,180,155,0.22)" strokeWidth="1"
            />
          </svg>

          {/* Gold ribbon */}
          <svg className="rd-header__ribbon" viewBox="0 0 308 88" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="rdRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E8C878" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#CFA54A" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#A97A1F" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Diagonal gold stripe */}
            <path
              d="M-10,22 L50,0 L68,0 L8,22 Z"
              fill="url(#rdRibbon)"
            />
            <path
              d="M-10,36 L80,0 L94,0 L4,36 Z"
              fill="rgba(207,165,74,0.35)"
            />
          </svg>

          <div className="rd-header__logo-content">
            <Link href="/" className="rd-logo" aria-label="Имоти Надежда — начало" onClick={() => setMobileOpen(false)}>
              {/* SVG лого — три къщи точно като колажа */}
              <svg className="rd-logo__icon" viewBox="0 0 280 132" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g fill="#6B001C">
                  {/* Лява къща */}
                  <path d="M34 92V70L62 44L90 70V92H34Z" />
                  <rect x="52" y="73" width="20" height="15" fill="#FAF7F2" />
                  <path d="M62 73V88M52 80.5H72" stroke="#6B001C" strokeWidth="1.2" />
                  {/* Централна (висока) */}
                  <path d="M96 92V64L140 16L184 64V92H96Z" />
                  {/* Комин на централната */}
                  <rect x="164" y="22" width="14" height="18" fill="#6B001C" />
                  <rect x="126" y="73" width="28" height="17" fill="#FAF7F2" />
                  <path d="M140 73V90M126 81.5H154" stroke="#6B001C" strokeWidth="1.4" />
                  {/* Дясна къща */}
                  <path d="M190 90V70L216 46L242 70V90H190Z" />
                  <rect x="206" y="73" width="20" height="14" fill="#FAF7F2" />
                  <path d="M216 73V87M206 80H226" stroke="#6B001C" strokeWidth="1.2" />
                </g>
              </svg>
              <span className="rd-logo__sub">Недвижими имоти</span>
              <span className="rd-logo__brand">• Надежда •</span>
            </Link>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="rd-header__nav-area">
          <nav className="rd-nav" aria-label="Основна навигация">
            {NAV.map(({ href, label }, i) => (
              <span key={href} className="flex items-center">
                {i > 0 && <span className="rd-nav__sep" aria-hidden />}
                <Link
                  href={href}
                  className={`rd-nav__link ${isActive(href) ? 'is-active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              </span>
            ))}
            <span className="rd-nav__sep" aria-hidden />
            <Link href="/admin/login" className="rd-nav__user" aria-label="Вход">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile hamburger */}
      <button
        className="rd-mobile-menu-btn"
        aria-label="Меню"
        onClick={() => setMobileOpen(v => !v)}
      >
        <span className="rd-mobile-bar" />
        <span className="rd-mobile-bar" />
        <span className="rd-mobile-bar" />
      </button>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 65,
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 260,
              background: '#FAF7F2',
              padding: '80px 24px 32px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
            onClick={e => e.stopPropagation()}
          >
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 15, fontWeight: 600,
                  color: isActive(href) ? '#FAF7F2' : '#6B001C',
                  background: isActive(href) ? '#6B001C' : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              style={{
                marginTop: 16, padding: '12px 16px',
                borderRadius: 8, border: '1.5px solid #CFA54A',
                textDecoration: 'none', textAlign: 'center',
                color: '#6B001C', fontWeight: 600, fontSize: 13,
              }}
              onClick={() => setMobileOpen(false)}
            >
              Вход в CRM
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
