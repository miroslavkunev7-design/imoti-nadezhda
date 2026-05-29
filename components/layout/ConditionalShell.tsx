'use client'

import { usePathname } from 'next/navigation'
import SiteShell from './SiteShell'

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return <>{children}</>

  return <SiteShell>{children}</SiteShell>
}
