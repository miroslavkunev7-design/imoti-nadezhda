'use client'

import Link from 'next/link'
import { useTheme } from '@/components/providers/ThemeProvider'

const SECTIONS = [
  {
    href:    '/buy?featured=1',
    icon:    <HouseIcon />,
    label:   'Featured Listings',
    sub:     'Details View',
    border:  true,
  },
  {
    href:    '/buy?new=1',
    icon:    <TagIcon />,
    label:   'Newest Offers',
    sub:     'Details View',
    border:  true,
  },
  {
    href:    '/admin/login',
    icon:    <CrmIcon />,
    label:   'CRM система',
    sub:     'За брокери',
    border:  false,
  },
]

export default function BottomBar() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      className="bottom-bar-root fixed bottom-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: isLight
          ? 'rgba(250,246,238,0.18)'
          : 'rgba(6,5,14,0.20)',
        backdropFilter: 'blur(18px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.8)',
        borderTop: isLight
          ? '1px solid rgba(196,30,58,0.15)'
          : '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-3 divide-x divide-[rgba(255,255,255,0.06)]">
        {SECTIONS.map(({ href, icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 px-5 py-3 hover:bg-[rgba(196,30,58,0.08)] transition-colors duration-200"
          >
            {/* Icon circle */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-crimson-700 transition-colors duration-200 group-hover:text-crimson-400"
              style={{ border: '1px solid rgba(196,30,58,0.3)' }}
            >
              {icon}
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-themed-primary leading-tight truncate transition-colors">
                {label}
              </p>
              <p className="text-[11px] text-crimson-700 leading-tight mt-0.5 flex items-center gap-1 truncate">
                {sub}
                <ArrowIcon />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function HouseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function CrmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
