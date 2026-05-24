import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar  from '@/components/admin/AdminTopbar'
import { getSidebarBadges } from '@/lib/queries/admin-sidebar'

export const metadata: Metadata = { title: { template: '%s | Имоти Надежда Admin', default: 'Admin' } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = await getSidebarBadges()

  return (
    <div className="min-h-screen relative">

      {/* ── Background — Shumen image with heavy dark overlay ── */}
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover"
        style={{ backgroundImage: "url('/images/admin-bg.jpg')" }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(6,4,14,0.88)' }} />

      {/* ── Top admin bar ── */}
      <AdminTopbar />

      {/* ── Sidebar ── */}
      <AdminSidebar badges={badges} />

      {/* ── Main content ── */}
      <main
        className="min-h-screen overflow-y-auto admin-scroll-main"
        style={{ marginLeft: 200, paddingTop: 56, paddingBottom: 80 }}
      >
        <div className="p-7">
          {children}
        </div>
      </main>
    </div>
  )
}
