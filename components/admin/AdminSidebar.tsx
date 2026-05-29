'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { SidebarBadges } from '@/lib/queries/admin-sidebar'
import { pathnameToPageSlug } from '@/lib/auth/pages'
import type { SessionUser } from '@/lib/auth/session'
import { useAdminAi } from '@/components/admin/AdminAiContext'

const ip = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const DashIcon   = () => <svg {...ip}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
const HomeIcon   = () => <svg {...ip}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const BrokerIcon = () => <svg {...ip}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const CrmIcon    = () => <svg {...ip}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
const MailIcon   = () => <svg {...ip}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
const ChatIcon   = () => <svg {...ip}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
const CalIcon    = () => <svg {...ip}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const DocIcon    = () => <svg {...ip}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const FinIcon    = () => <svg {...ip}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
const MegaIcon   = () => <svg {...ip}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
const TaskIcon   = () => <svg {...ip}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
const FolderIcon = () => <svg {...ip}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
const GearIcon   = () => <svg {...ip}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
const AiIcon     = () => <svg {...ip}><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1a2 2 0 01-2 2h-1v1.27a2 2 0 11-4 0V17h-1a2 2 0 01-2-2v-1H8a7 7 0 017-7h1V5.73A2 2 0 0112 2z"/><path d="M9 21h6"/></svg>
const MarketIcon = () => <svg {...ip}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
const OwnerIcon  = () => <svg {...ip}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/></svg>

type NavKey = keyof SidebarBadges

const NAV: Array<{
  href: string
  label: string
  icon: React.ReactNode
  badgeKey?: NavKey
  adminOnly?: boolean
}> = [
  { href: '/admin',                  label: 'Дашборд',    icon: <DashIcon /> },
  { href: '/admin/properties',       label: 'Имоти',      icon: <HomeIcon />,     badgeKey: 'properties' },
  { href: '/admin/marketplace',      label: 'Извлечени имоти', icon: <MarketIcon />, adminOnly: true, badgeKey: 'extractedLeads' },
  { href: '/admin/brokers',          label: 'Брокери',    icon: <BrokerIcon />,   badgeKey: 'brokers', adminOnly: true },
  { href: '/admin/clients',          label: 'Клиенти',    icon: <CrmIcon />,      badgeKey: 'clients' },
  { href: '/admin/owners',           label: 'Собственици', icon: <OwnerIcon />,   badgeKey: 'owners' },
  { href: '/admin/inquiries',        label: 'Запитвания', icon: <MailIcon />,     badgeKey: 'inquiries' },
  { href: '/admin/chat',             label: 'Чат',        icon: <ChatIcon /> },
  { href: '/admin/calendar',         label: 'Календар',   icon: <CalIcon /> },
  { href: '/admin/contracts',        label: 'Договори',   icon: <DocIcon /> },
  { href: '/admin/finance',          label: 'Финанси',    icon: <FinIcon /> },
  { href: '/admin/marketing',        label: 'Маркетинг',  icon: <MegaIcon /> },
  { href: '/admin/tasks',            label: 'Задачи',     icon: <TaskIcon />,     badgeKey: 'tasks' },
  { href: '/admin/documents',        label: 'Документи',  icon: <FolderIcon /> },
  { href: '/admin/settings',         label: 'Настройки',  icon: <GearIcon /> },
]

interface Props {
  badges: SidebarBadges
  session: SessionUser | null
  restrictedPages: string[]
}

export default function AdminSidebar({ badges, session, restrictedPages }: Props) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { open: aiOpen, setOpen: setAiOpen } = useAdminAi()
  const clickRef  = useRef(0)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [systemOk, setSystemOk] = useState<boolean | null>(null)
  const isAdmin = session?.role === 'admin'

  useEffect(() => {
    fetch('/api/admin/health')
      .then(r => r.json())
      .then(json => setSystemOk(Boolean(json.db?.ok)))
      .catch(() => setSystemOk(false))
  }, [])

  function handleLogoClick(e: React.MouseEvent) {
    clickRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
    if (clickRef.current >= 3) { clickRef.current = 0; e.preventDefault(); router.push('/') }
    timerRef.current = setTimeout(() => { clickRef.current = 0 }, 600)
  }

  const visibleNav = NAV.filter(item => {
    const slug = pathnameToPageSlug(item.href)
    if (item.adminOnly && !isAdmin) return false
    if (restrictedPages.includes(slug)) return false
    return true
  })

  const statusColor = systemOk === null ? 'bg-yellow-400' : systemOk ? 'bg-green-400' : 'bg-red-400'
  const statusText =
    systemOk === null ? 'Проверка...' : systemOk ? 'Системата работи' : 'Проблем с базата'

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col admin-sidebar"
      style={{
        width: 200,
        backgroundImage: "url('/images/texture-marble-white-gold.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        borderRight: '2px solid rgba(207,168,71,0.45)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.22), inset -1px 0 0 rgba(207,168,71,0.15)',
      }}
    >
      <div
        className="flex items-center gap-2.5 px-4 cursor-pointer select-none"
        style={{ height: 56, borderBottom: '1px solid var(--gold-border)' }}
        onClick={handleLogoClick}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(78,11,31,0.08)', border: '1px solid rgba(207,168,71,0.4)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4E0B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div className="leading-none min-w-0">
          <p className="font-bold text-sm tracking-wide truncate" style={{ color: '#4E0B1F' }}>Имоти</p>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: '#CFA847' }}>Надежда</p>
        </div>
      </div>

      {session && (
        <Link href="/admin/profile"
          className="mx-2 mt-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(78,11,31,0.05)' }}>
          {session.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: '1.5px solid rgba(207,168,71,0.4)' }} />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#4E0B1F', color: '#F5EDD8', border: '1.5px solid rgba(207,168,71,0.4)' }}>
              {(session.name ?? 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#4E0B1F' }}>{session.name ?? 'Профил'}</p>
            <p className="text-[10px]" style={{ color: 'rgba(78,11,31,0.5)' }}>{isAdmin ? 'Админ' : 'Брокер'}</p>
          </div>
        </Link>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: 'none' }}>
        {visibleNav.map(item => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          const badge = item.badgeKey ? badges[item.badgeKey] : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-medium',
                'transition-all duration-150',
              ].join(' ')}
              style={active ? {
                background: 'rgba(78,11,31,0.09)',
                border: '1px solid rgba(207,168,71,0.38)',
                color: '#4E0B1F',
              } : {
                color: 'rgba(78,11,31,0.6)',
              }}
            >
              <span style={{ flexShrink: 0, color: active ? '#4E0B1F' : 'rgba(78,11,31,0.55)' }}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#4E0B1F', color: '#F5EDD8', minWidth: 18, textAlign: 'center' }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-3">
        <button
          type="button"
          onClick={() => setAiOpen(!aiOpen)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2 text-[13px] font-semibold transition-all"
          style={aiOpen ? {
            background: 'rgba(78,11,31,0.12)',
            border: '1px solid rgba(207,168,71,0.45)',
            color: '#4E0B1F',
          } : {
            border: '1px solid rgba(207,168,71,0.25)',
            color: 'rgba(78,11,31,0.65)',
          }}
        >
          <span style={{ flexShrink: 0, color: '#4E0B1F' }}><AiIcon /></span>
          <span className="flex-1 text-left truncate">AI Асистент</span>
        </button>
        <div className="rounded-lg px-3 py-2 mb-1 flex items-center gap-2"
          style={{ background: 'rgba(207,168,71,0.07)', border: '1px solid rgba(207,168,71,0.22)' }}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${statusColor}`} />
          <span className="text-[10px] font-medium" style={{ color: 'rgba(78,11,31,0.6)' }}>{statusText}</span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}

function LogoutButton() {
  return (
    <button
      onClick={async () => { await fetch('/api/auth/admin-logout', { method: 'POST' }); window.location.href = '/admin/login' }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] transition-colors w-full"
      style={{ color: 'rgba(78,11,31,0.45)' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Изход
    </button>
  )
}
