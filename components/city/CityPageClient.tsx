'use client'

import { Suspense } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchStrip from '@/components/search/LuxurySearchStrip'
import type { City, Quarter } from '@/types'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'
import { useEffect } from 'react'

interface CityPageClientProps {
  city: City
  cities: City[]
  quarters: Quarter[]
}

function CityHero({ city, cities, quarters }: CityPageClientProps) {
  const { setCitySlug } = useCitySelection()

  useEffect(() => {
    setCitySlug(city.slug as CitySlug)
  }, [city.slug, setCitySlug])

  return (
    <TerraceHero variant="band" citySlug={city.slug}>
      <div className="flex items-end justify-center pb-8 w-full">
        <LuxurySearchStrip
          cities={cities}
          initialCity={city.slug}
          initialQuarters={quarters}
          variant="burgundy"
          compact
        />
      </div>
    </TerraceHero>
  )
}

export default function CityPageClient(props: CityPageClientProps) {
  return (
    <Suspense fallback={<div className="lux-terrace lux-terrace--band" />}>
      <CityHero {...props} />
    </Suspense>
  )
}
