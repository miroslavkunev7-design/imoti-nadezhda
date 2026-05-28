'use client'

import { usePathname } from 'next/navigation'
import LuxuryHeader from './LuxuryHeader'
import { CitySelectionProvider } from '@/components/providers/CitySelectionProvider'

export default function LuxuryShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <CitySelectionProvider>
      <div className="luxury-brand luxury-marble-bg min-h-screen">
        <LuxuryHeader />
        <main>{children}</main>
      </div>
    </CitySelectionProvider>
  )
}
