'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { FALLBACK_CITIES } from '@/lib/data/fallback'

export default function NavbarWrapper() {
  const pathname = usePathname()

  // Extract city name from /cities/[slug]/...
  const segments = pathname.split('/').filter(Boolean)
  let cityName: string | undefined

  if (segments[0] === 'cities' && segments[1]) {
    const city = FALLBACK_CITIES.find(c => c.slug === segments[1])
    cityName = city?.name
  }

  return <Navbar cityName={cityName} />
}
