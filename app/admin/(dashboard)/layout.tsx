import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'
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
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/admin-bg.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 admin-bg-overlay" style={{ background: 'rgba(6,4,14,0.88)' }} />

      <AdminTopbar />
      <AdminSidebar badges={badges} session={session} restrictedPages={restrictedPages} />

      <main
        className="min-h-screen overflow-y-auto admin-scroll-main"
        style={{ marginLeft: 200, paddingTop: 56, paddingBottom: 80 }}
      >
        <div className="p-7">{children}</div>
      </main>
    </div>
  )
}
