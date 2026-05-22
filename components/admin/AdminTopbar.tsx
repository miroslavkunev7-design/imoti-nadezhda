'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const BREADCRUMB: Record<string, string> = {
  '/admin':               'Табло',
  '/admin/properties':    'Имоти',
  '/admin/properties/new':'Добави имот',
  '/admin/clients':       'CRM Клиенти',
  '/admin/brokers':       'Брокери',
  '/admin/inquiries':     'Запитвания',
}

export default function AdminTopbar() {
  const pathname = usePathname()
  const current  = BREADCRUMB[pathname] ?? 'Admin'

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
        background: 'rgba(8,6,18,0.72)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(196,30,58,0.20)',
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin" className="text-themed-muted hover:text-themed-primary transition-colors">
          Admin
        </Link>
        {pathname !== '/admin' && (
          <>
            <span className="text-themed-muted">/</span>
            <span className="text-themed-primary font-medium">{current}</span>
          </>
        )}
      </div>

      {/* Right: go to site + logout */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-themed-secondary hover:text-themed-primary transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Към сайта
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-themed-secondary hover:text-crimson-700 transition-colors px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
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
