'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const BREADCRUMB: Record<string, string> = {
  '/admin':               'Табло',
  '/admin/properties':    'Имоти',
  '/admin/properties/new':'Добави имот',
  '/admin/clients':       'CRM Клиенти',
  '/admin/brokers':       'Брокери',
  '/admin/inquiries':     'Запитвания',
  '/admin/chat':          'Чат',
  '/admin/profile':       'Профил',
  '/admin/tasks':         'Задачи',
  '/admin/settings':      'Настройки',
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

export default function AdminTopbar() {
  const pathname = usePathname()
  const current  = BREADCRUMB[pathname] ?? 'Admin'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as 'dark' | 'light' | null
    if (stored) {
      setTheme(stored)
      document.documentElement.classList.toggle('light', stored === 'light')
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('admin-theme', next)
    document.documentElement.classList.toggle('light', next === 'light')
  }

  async function logout() {
    await fetch('/api/auth/admin-logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5"
      style={{
        height: 56,
        marginLeft: 200,
        background: 'rgba(253,250,245,0.97)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(207,168,71,0.30)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin" className="transition-colors font-medium" style={{ color: 'rgba(78,11,31,0.5)' }}>
          Admin
        </Link>
        {pathname !== '/admin' && (
          <>
            <span style={{ color: 'rgba(78,11,31,0.35)' }}>/</span>
            <span className="font-semibold" style={{ color: '#4E0B1F' }}>{current}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Светъл режим' : 'Тъмен режим'}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ border: '1px solid rgba(207,168,71,0.35)', color: '#4E0B1F' }}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
          style={{ border: '1px solid rgba(207,168,71,0.3)', color: '#4E0B1F' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Към сайта
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
          style={{ border: '1px solid rgba(207,168,71,0.3)', color: 'rgba(78,11,31,0.7)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Изход
        </button>
      </div>
    </header>
  )
}
