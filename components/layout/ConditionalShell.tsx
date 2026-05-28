'use client'

import { usePathname } from 'next/navigation'
import LuxuryHeader from './LuxuryHeader'
import { CitySelectionProvider } from '@/components/providers/CitySelectionProvider'

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return <>{children}</>

  return (
    <CitySelectionProvider>
      <LuxuryHeader />
      <main className="min-h-screen">{children}</main>
    </CitySelectionProvider>
  )
}
