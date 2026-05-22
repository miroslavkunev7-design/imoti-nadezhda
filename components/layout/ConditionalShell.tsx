'use client'

import { usePathname } from 'next/navigation'
import NavbarWrapper from './NavbarWrapper'
import BottomBar    from './BottomBar'

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin  = pathname.startsWith('/admin')

  if (isAdmin) {
    // Admin pages manage their own layout — no global nav
    return <>{children}</>
  }

  return (
    <>
      <NavbarWrapper />
      <main className="min-h-screen">{children}</main>
      <BottomBar />
    </>
  )
}
