import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import '@/app/admin/admin-luxury.css'
import AdminDashboardShell from '@/components/admin/AdminDashboardShell'
import { getSidebarBadges } from '@/lib/queries/admin-sidebar'
import { isPathRestricted } from '@/lib/auth/pages'
import { getBrokerRestrictions, getSession } from '@/lib/auth/session'
import { ensureDbSetup } from '@/lib/db/setup'

export const metadata: Metadata = { title: { template: '%s | Имоти Надежда Admin', default: 'Admin' } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureDbSetup()

  const session = await getSession()
  const pathname = headers().get('x-pathname') ?? '/admin'

  if (session && session.role !== 'admin') {
    const restricted = await getBrokerRestrictions(session.id)
    if (isPathRestricted(pathname, restricted)) {
      redirect('/admin?restricted=1')
    }
  }

  const badges = await getSidebarBadges()
  const restrictedPages = session?.role === 'admin'
    ? []
    : await getBrokerRestrictions(session?.id ?? 0)

  return (
    <div className="min-h-screen relative admin-luxury-root">
      {/* Bordeaux damask wallpaper background */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: 'linear-gradient(160deg, #5A1028 0%, #420B17 38%, #380812 62%, #4A0C1A 100%)',
        }}
      />
      {/* Damask pattern overlay */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 6 L74 40 L40 74 L6 40 Z' fill='none' stroke='rgba(207,168,71,0.09)' stroke-width='0.9'/%3E%3Ccircle cx='40' cy='40' r='6' fill='none' stroke='rgba(207,168,71,0.07)' stroke-width='0.8'/%3E%3Cpath d='M40 16 L48 24 L40 32 L32 24 Z M40 48 L48 56 L40 64 L32 56 Z M16 40 L24 32 L32 40 L24 48 Z M48 40 L56 32 L64 40 L56 48 Z' fill='rgba(255,255,255,0.022)'/%3E%3Ccircle cx='0' cy='0' r='2.5' fill='none' stroke='rgba(207,168,71,0.06)' stroke-width='0.6'/%3E%3Ccircle cx='80' cy='0' r='2.5' fill='none' stroke='rgba(207,168,71,0.06)' stroke-width='0.6'/%3E%3Ccircle cx='0' cy='80' r='2.5' fill='none' stroke='rgba(207,168,71,0.06)' stroke-width='0.6'/%3E%3Ccircle cx='80' cy='80' r='2.5' fill='none' stroke='rgba(207,168,71,0.06)' stroke-width='0.6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '80px 80px',
        }}
      />

      <AdminDashboardShell
        badges={badges}
        session={session}
        restrictedPages={restrictedPages}
      >
        {children}
      </AdminDashboardShell>
    </div>
  )
}
