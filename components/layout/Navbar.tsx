'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlobalSiteHeader from './GlobalSiteHeader'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/components/providers/ThemeProvider'

const MOBILE_LINKS = [
  { href: '/', label: 'Начало' },
  { href: '/buy', label: 'За продажба' },
  { href: '/buy?deal=rent', label: 'Под наем' },
  { href: '/sell', label: 'Продай' },
  { href: '/about', label: 'За нас' },
  { href: '/contacts', label: 'Контакти' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  return (
    <>
      <GlobalSiteHeader />

      <button
        type="button"
        onClick={() => setMobileOpen(v => !v)}
        className="fixed top-3 right-3 z-[53] md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-sm border border-[var(--gold-border)] bg-[var(--burgundy-primary)] text-[var(--gold-light)] pointer-events-auto"
        aria-label="Меню"
      >
        <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
        <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
      </button>

      <div
        className={`fixed inset-0 z-[51] md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.55)' }}
      />
      <div
        ref={mobileRef}
        className={`fixed top-0 right-0 bottom-0 z-[52] w-72 md:hidden flex flex-col pt-24 pb-8 px-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: isLight ? 'var(--marble-white)' : 'rgba(20,10,16,0.98)',
          borderLeft: '1px solid var(--gold-border)',
        }}
      >
        <nav className="flex flex-col gap-1">
          {MOBILE_LINKS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0])
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium tracking-wider uppercase transition-colors duration-200 ${
                  active
                    ? 'text-[var(--gold-light)]'
                    : 'text-themed-secondary hover:text-themed-primary'
                }`}
                style={active ? { background: 'var(--burgundy-primary)' } : undefined}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-6 flex items-center gap-3">
          <ThemeToggle inPanel />
          <span className="text-xs text-themed-secondary uppercase tracking-wider">Тема</span>
        </div>
        <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/admin/login" className="btn-marble-luxury w-full justify-center">
            Вход
          </Link>
        </div>
      </div>
    </>
  )
}
