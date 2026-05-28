'use client'

import { usePathname } from 'next/navigation'
import LuxuryHeader from './LuxuryHeader'
import MarbleBackground from './MarbleBackground'

export default function NavbarWrapper() {
  const pathname = usePathname()

  return (
    <>
      <MarbleBackground />
      <LuxuryHeader key={pathname} />
    </>
  )
}
