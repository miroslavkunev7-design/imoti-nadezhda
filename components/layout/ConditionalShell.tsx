'use client'

import { usePathname } from 'next/navigation'
import NavbarWrapper from './NavbarWrapper'
import { CitySelectionProvider } from '@/components/providers/CitySelectionProvider'
import { HEADER_HEIGHT } from '@/lib/design/tokens'

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <CitySelectionProvider>
      <NavbarWrapper />
      <main className="min-h-screen" style={{ paddingTop: HEADER_HEIGHT }}>
        {children}
      </main>
    </CitySelectionProvider>
  )
}
