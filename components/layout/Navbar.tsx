'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/components/providers/ThemeProvider'

const NAV_LINKS = [
  { href: '/',         label: 'Начало'   },
  { href: '/buy',      label: 'Купи'     },
  { href: '/sell',     label: 'Продай'   },
  { href: '/contacts', label: 'Контакти' },
]

interface NavbarProps {
  cityName?: string
}

export default function Navbar({ cityName }: NavbarProps) {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()
  const isLight  = theme === 'light'
  const isHome   = pathname === '/'
  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node))
        setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const solid = scrolled || !isHome

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 76,
          background: solid ? 'rgba(0,0,0,0.06)' : 'transparent',
          backdropFilter:       solid ? (isLight ? 'none' : 'blur(14px) saturate(1.6)') : 'none',
          WebkitBackdropFilter: solid ? (isLight ? 'none' : 'blur(14px) saturate(1.6)') : 'none',
          borderBottom: solid ? '1px solid rgba(196,30,58,0.15)' : 'none',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 h-full flex items-center gap-4">

          {/* Logo */}
          <Logo size="sm" />

          {/* City / page name — shown on interior pages (right of logo) */}
          {cityName && (
            <div
              className="flex items-center gap-1.5 pl-3 ml-1"
              style={{ borderLeft: '1px solid rgba(196,30,58,0.3)' }}
            >
              <svg className="text-crimson-700 flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="font-display text-themed-primary font-semibold" style={{ fontSize: 18 }}>
                {cityName}
              </span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative px-4 py-2 text-sm font-medium tracking-wider uppercase rounded-full',
                    'transition-colors duration-200',
                    active
                      ? 'bg-crimson-700 text-white'
                      : isLight
                        ? 'text-[#5a4a42] hover:text-[#1a1218]'
                        : 'text-[#9b8f82] hover:text-white',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className={[
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200',
                isLight
                  ? 'border border-[rgba(0,0,0,0.12)] text-[#6b5e58] hover:text-[#1a1218] hover:border-[rgba(0,0,0,0.25)]'
                  : 'border border-[rgba(255,255,255,0.12)] text-[#9b8f82] hover:text-white hover:border-[rgba(255,255,255,0.3)]',
              ].join(' ')}
              aria-label="Вход"
            >
              <UserIcon />
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] transition-colors text-themed-secondary hover:text-themed-primary"
            >
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.6)' }}
      />
      <div
        ref={mobileRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col pt-20 pb-8 px-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: isLight ? 'rgba(255,251,244,0.97)' : 'rgba(8,6,18,0.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-colors duration-200 ${active ? 'bg-crimson-700 text-white' : 'text-themed-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-themed-primary'}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/auth/login" className="btn-ghost w-full justify-center">
            <UserIcon /> Вход / Регистрация
          </Link>
        </div>
      </div>
    </>
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
