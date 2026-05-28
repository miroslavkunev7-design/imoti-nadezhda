'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import LuxuryHeader from './LuxuryHeader'
import MarblePageShell from './MarblePageShell'
import { CitySelectionProvider } from '@/components/providers/CitySelectionProvider'

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <CitySelectionProvider>
      <MarblePageShell>
        <Suspense fallback={null}>
          <LuxuryHeader />
        </Suspense>
        <main>{children}</main>
      </MarblePageShell>
    </CitySelectionProvider>
  )
}
