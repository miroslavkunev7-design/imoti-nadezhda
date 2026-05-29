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
          background: '#420B17',
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 30% 20%, rgba(90,16,40,0.85) 0%, transparent 65%),
            radial-gradient(ellipse 60% 80% at 75% 75%, rgba(56,8,18,0.9) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 5 L75 40 L40 75 L5 40 Z' fill='none' stroke='rgba(207,168,71,0.10)' stroke-width='0.8'/%3E%3Ccircle cx='40' cy='40' r='7' fill='none' stroke='rgba(207,168,71,0.07)' stroke-width='0.7'/%3E%3Cpath d='M40 17 L49 26 L40 35 L31 26 Z' fill='rgba(255,255,255,0.025)'/%3E%3Cpath d='M40 45 L49 54 L40 63 L31 54 Z' fill='rgba(255,255,255,0.025)'/%3E%3Cpath d='M17 40 L26 31 L35 40 L26 49 Z' fill='rgba(255,255,255,0.025)'/%3E%3Cpath d='M45 40 L54 31 L63 40 L54 49 Z' fill='rgba(255,255,255,0.025)'/%3E%3Ccircle cx='0' cy='0' r='2' fill='rgba(207,168,71,0.08)'/%3E%3Ccircle cx='80' cy='0' r='2' fill='rgba(207,168,71,0.08)'/%3E%3Ccircle cx='0' cy='80' r='2' fill='rgba(207,168,71,0.08)'/%3E%3Ccircle cx='80' cy='80' r='2' fill='rgba(207,168,71,0.08)'/%3E%3C/svg%3E")
          `,
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          backgroundSize: 'cover, cover, 80px 80px',
        }}
      >
        <div className="p-7">{children}</div>
      </main>

      <CrmAiAssistant />
    </AdminAiProvider>
  )
}
