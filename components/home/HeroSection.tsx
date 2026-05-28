'use client'

import { Suspense } from 'react'
import type { City } from '@/types'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchStrip from '@/components/search/LuxurySearchStrip'
import LuxuryCityCard from '@/components/cards/LuxuryCityCard'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface HeroSectionProps {
  cities: City[]
}

const CARD_H = 156

function HeroContent({ cities }: HeroSectionProps) {
  const { citySlug } = useCitySelection()

  return (
    <TerraceHero variant="full" citySlug={citySlug}>
      <div className="flex-1 flex flex-col justify-center items-center w-full min-h-0 py-4">
        <div className="w-full flex justify-center mb-8">
          <LuxurySearchStrip cities={cities} compact variant="marble" />
        </div>
      </div>

      <div className="flex-shrink-0 w-full pb-6">
        <p
          className="text-center mb-3"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--lux-gold)',
          }}
        >
          Избери град
        </p>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(cities.length, 4)}, 1fr)`,
            height: CARD_H,
          }}
        >
          {cities.map(city => (
            <LuxuryCityCard key={city.id} city={city} cardHeight={CARD_H} />
          ))}
        </div>
      </div>
    </TerraceHero>
  )
}

export default function HeroSection({ cities }: HeroSectionProps) {
  return (
    <Suspense fallback={<div className="lux-terrace lux-terrace--full" style={{ minHeight: '80vh' }} />}>
      <HeroContent cities={cities} />
    </Suspense>
  )
}
