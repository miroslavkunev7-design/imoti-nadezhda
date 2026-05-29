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
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #1a1016 0%, #0e080c 100%), url('/images/admin-bg.jpg')",
        }}
      />
      <div className="fixed inset-0 -z-10 admin-bg-overlay" />

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
