'use client'

import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchStrip from '@/components/search/LuxurySearchStrip'
import type { City } from '@/types'
import type { CitySlug } from '@/lib/design/city-panoramas'

interface BuyListingsClientProps {
  cities: City[]
  initialCity?: string
}

export default function BuyListingsClient({ cities, initialCity }: BuyListingsClientProps) {
  const citySlug = (initialCity as CitySlug | undefined) ?? null

  return (
    <TerraceHero variant="band" citySlug={citySlug}>
      <div className="flex-1 flex items-end justify-center pb-8 w-full">
        <LuxurySearchStrip
          cities={cities}
          initialCity={initialCity ?? ''}
          variant="burgundy"
          compact
        />
      </div>
    </TerraceHero>
  )
}
