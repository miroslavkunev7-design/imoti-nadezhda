import type { Metadata } from 'next'
import { cache } from 'react'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import { getQuartersByCity } from '@/lib/queries/cities'
import { countLocalPropertiesForQuarter } from '@/lib/properties/merge-local'
import type { City, Quarter } from '@/types'
import CityBurgasView from '@/components/city/CityBurgasView'

export const revalidate = 120

const getData = cache(async (): Promise<{ city: City; quarters: Quarter[] }> => {
  const city = FALLBACK_CITIES.find(c => c.slug === 'burgas')!
  const baseQuarters = getQuartersForCity('burgas')
  const dbQuarters = await getQuartersByCity('burgas')
  const dbBySlug = new Map(dbQuarters.map(q => [q.slug, q]))

  const quarters = await Promise.all(
    baseQuarters.map(async q => {
      const fromDb = dbBySlug.get(q.slug)
      const localCount = await countLocalPropertiesForQuarter('burgas', q.slug)
      const dbCount = fromDb?.property_count ?? 0
      return {
        ...q,
        ...fromDb,
        property_count: Math.max(dbCount, localCount),
      }
    })
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
