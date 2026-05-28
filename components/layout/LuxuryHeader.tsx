'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { HEADER_HEIGHT } from '@/lib/design/tokens'

const NAV_LINKS = [
  { href: '/buy',    label: 'За продажба' },
  { href: '/rent',   label: 'Под наем'    },
  { href: '/about',  label: 'За нас'      },
]

export default function LuxuryHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileRef = useRef<HTMLDivElement>(null)

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

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: HEADER_HEIGHT }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(107,0,28,0.06) 0%, transparent 100%)',
          }}
        />

        <div className="relative h-full max-w-[1440px] mx-auto flex items-stretch px-0">
          {/* LEFT — marble curved panel + gold ribbon */}
          <div className="relative flex-shrink-0" style={{ width: 'clamp(260px, 28vw, 380px)' }}>
            <div
              className="absolute inset-0 luxury-header-marble"
              style={{
                borderBottomRightRadius: 48,
                boxShadow: '4px 4px 24px rgba(107,0,28,0.12), inset 0 -1px 0 rgba(207,165,74,0.25)',
              }}
            />
            {/* Gold metallic flowing ribbon edge */}
            <div
              className="absolute top-0 bottom-0 right-0 w-[6px] gold-ribbon-edge"
              style={{
                borderBottomRightRadius: 48,
              }}
            />
            <div className="relative z-10 h-full flex items-center pl-6 pr-10">
              <Logo size="lg" />
            </div>
          </div>

          {/* RIGHT — navigation */}
          <div className="flex-1 flex items-center justify-end gap-2 pr-6 lg:pr-10">
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === '/buy'
                  ? pathname === '/buy' || pathname.startsWith('/cities')
                  : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      'px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-280',
                      active
                        ? 'text-[#6B001C] border-b-2 border-[#CFA54A]'
                        : 'text-[#7A0D28] hover:text-[#6B001C] border-b-2 border-transparent hover:border-[#CFA54A]/50',
                    ].join(' ')}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <Link
              href="/admin/login"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-280 gold-shimmer-hover"
              style={{
                border: '1.5px solid #CFA54A',
                background: 'linear-gradient(145deg, rgba(250,247,242,0.95) 0%, rgba(207,165,74,0.15) 100%)',
                color: '#6B001C',
                boxShadow: '0 2px 12px rgba(107,0,28,0.12)',
              }}
              aria-label="Профил"
            >
              <UserIcon />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] text-[#6B001C]"
              aria-label="Меню"
            >
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom gold accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, #CFA54A 20%, #A97A1F 50%, #CFA54A 80%, transparent 100%)',
            opacity: 0.65,
          }}
        />
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(107,0,28,0.35)' }}
      />
      <div
        ref={mobileRef}
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col pt-24 pb-8 px-6 transition-transform duration-300 ease-luxury ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'linear-gradient(180deg, #FAF7F2 0%, #F5F0E8 100%)',
          borderLeft: '2px solid #CFA54A',
          boxShadow: '-8px 0 32px rgba(107,0,28,0.15)',
        }}
      >
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-colors ${active ? 'bg-[#6B001C] text-white' : 'text-[#7A0D28] hover:bg-[#6B001C]/8'}`}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/contact"
            className={`px-4 py-3.5 rounded-lg text-sm font-semibold tracking-wide transition-colors ${pathname === '/contact' ? 'bg-[#6B001C] text-white' : 'text-[#7A0D28] hover:bg-[#6B001C]/8'}`}
          >
            Контакти
          </Link>
        </nav>
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
