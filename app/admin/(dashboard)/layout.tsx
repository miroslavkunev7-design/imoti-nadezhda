import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar  from '@/components/admin/AdminTopbar'
import { getSidebarBadges } from '@/lib/queries/admin-sidebar'

export const metadata: Metadata = { title: { template: '%s | Имоти Надежда Admin', default: 'Admin' } }
export const dynamic = 'force-dynamic'

async function getRestrictedPages(userId: number): Promise<string[]> {
  try {
    const { query } = await import('@/lib/db')
    const rows = await query<{ page_slug: string }>(
      `SELECT page_slug FROM broker_restrictions WHERE user_id = ?`,
      [userId]
    )
    return rows.map(r => r.page_slug)
  } catch { return [] }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = headers()
  const userId   = parseInt(hdrs.get('x-user-id') ?? '0', 10)
  const role     = hdrs.get('x-user-role') ?? 'broker'

  const [badges, restrictedPages] = await Promise.all([
    getSidebarBadges(),
    role !== 'admin' ? getRestrictedPages(userId) : Promise.resolve([]),
  ])

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-20 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/admin-bg.jpg')" }} />
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(6,4,14,0.88)' }} />

      <AdminTopbar />
      <AdminSidebar badges={badges} restrictedPages={restrictedPages} role={role} />

      <main className="min-h-screen overflow-y-auto admin-scroll-main"
        style={{ marginLeft: 200, paddingTop: 56, paddingBottom: 80 }}>
        <div className="p-7">
          {children}
        </div>
      </main>
    </div>
  )
}
