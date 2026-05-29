'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'
import CrmAiAssistant from '@/components/admin/CrmAiAssistant'
import { AdminAiProvider } from '@/components/admin/AdminAiContext'
import type { SidebarBadges } from '@/lib/queries/admin-sidebar'
import type { SessionUser } from '@/lib/auth/session'

interface Props {
  children: React.ReactNode
  badges: SidebarBadges
  session: SessionUser | null
  restrictedPages: string[]
}

export default function AdminDashboardShell({ children, badges, session, restrictedPages }: Props) {
  return (
    <AdminAiProvider>
      <AdminTopbar />
      <AdminSidebar badges={badges} session={session} restrictedPages={restrictedPages} />

      <main
        className="min-h-screen overflow-y-auto admin-scroll-main admin-panel"
        style={{
          marginLeft: 200,
          paddingTop: 56,
          paddingBottom: 80,
          backgroundImage: "url('/images/texture-burgundy-wall.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="p-7">{children}</div>
      </main>

      <CrmAiAssistant />
    </AdminAiProvider>
  )
}
