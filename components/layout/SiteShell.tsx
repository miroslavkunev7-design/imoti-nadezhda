'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isHome = pathname === '/'
  const isBurgasCity = pathname === '/cities/burgas'
  const isBurgasQuarter =
    pathname.startsWith('/cities/burgas/') &&
    !pathname.includes('/property/') &&
    pathname !== '/cities/burgas'
  const isBurgasProperty = /^\/cities\/burgas\/[^/]+\/property\/\d+/.test(pathname)

  if (isAdmin) return <>{children}</>

  if (isHome) {
    return (
      <main className="main--home-exact">
        {children}
      </main>
    )
  }

  if (isBurgasProperty) {
    return <main className="main--property-detail">{children}</main>
  }

  if (isBurgasCity) {
    return <main className="main--city-burgas-exact">{children}</main>
  }

  if (isBurgasQuarter) {
    return <main className="main--quarter-burgas-exact">{children}</main>
  }

  return (
    <>
      <Suspense fallback={<div style={{ height: 'var(--rd-header-h, 88px)' }} />}>
        <SiteHeader />
      </Suspense>
      <main className="rd-page-content" style={{ paddingBottom: 'var(--rd-footer-h, 58px)' }}>
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
