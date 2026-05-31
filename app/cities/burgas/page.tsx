import type { Metadata } from 'next'
import { cache } from 'react'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import { countLocalPropertiesForQuarter } from '@/lib/properties/merge-local'
import type { City, Quarter } from '@/types'
import CityBurgasView from '@/components/city/CityBurgasView'

export const revalidate = 120

const getData = cache(async (): Promise<{ city: City; quarters: Quarter[] }> => {
  const city = FALLBACK_CITIES.find(c => c.slug === 'burgas')!
  const baseQuarters = getQuartersForCity('burgas')
  const quarters = await Promise.all(
    baseQuarters.map(async q => ({
      ...q,
      property_count: await countLocalPropertiesForQuarter('burgas', q.slug),
    }))
  )
  return { city, quarters }
})

export const metadata: Metadata = {
  title: 'Имоти в Бургас — Имоти Надежда',
}

export default async function BurgasCityPage() {
  const { city, quarters } = await getData()
  const activeListings = quarters.reduce((sum, q) => sum + (q.property_count ?? 0), 0)

  return (
    <CityBurgasView
      city={city}
      quarters={quarters}
      activeListings={activeListings}
    />
  )
}
