'use client'

import type { City } from '@/types'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchBar from '@/components/search/LuxurySearchBar'
import LuxuryCityCard from '@/components/cards/LuxuryCityCard'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface LuxuryHomeProps {
  cities: City[]
}

const HEADER_H = 96
const CARD_H = 156

export default function LuxuryHome({ cities }: LuxuryHomeProps) {
  const { selectedCity } = useCitySelection()

  return (
    <div>
      <TerraceHero citySlug={selectedCity} height="calc(100dvh - 0px)" className="min-h-[620px]">
        <div
          className="max-w-[1280px] mx-auto w-full px-5 lg:px-8 flex flex-col justify-between flex-1"
          style={{
            paddingTop: HEADER_H + 24,
            paddingBottom: 32,
            minHeight: 'calc(100dvh - 0px)',
          }}
        >
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <LuxurySearchBar cities={cities} initialCity={selectedCity ?? ''} />
          </div>

          <div className="flex-shrink-0">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
              style={{ color: 'rgba(255,255,255,0.85)' }}
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
        </div>
      </TerraceHero>
    </div>
  )
}
