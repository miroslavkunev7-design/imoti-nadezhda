'use client'

import type { City } from '@/types'
import SearchWidget from '@/components/search/SearchWidget'
import CityCard from '@/components/cards/CityCard'
import TerraceHero from '@/components/layout/TerraceHero'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface HeroSectionProps {
  cities: City[]
}

const CARD_H = 168

export default function HeroSection({ cities }: HeroSectionProps) {
  const { citySlug } = useCitySelection()

  return (
    <div className="relative -mt-[96px]" style={{ marginTop: -96 }}>
      <TerraceHero citySlug={citySlug} height="100dvh" overlay="medium">
        <div
          className="h-full flex flex-col max-w-[1280px] mx-auto px-5 lg:px-8"
          style={{ paddingTop: 120, paddingBottom: 48 }}
        >
          <div className="flex-1 flex flex-col justify-center items-center min-h-0">
            <SearchWidget cities={cities} compact variant="marble" />
          </div>

          <div className="flex-shrink-0 marble-reveal">
            <p
              className="text-label uppercase tracking-[0.2em] mb-3 text-center"
              style={{ color: '#7A0D28' }}
            >
              Избери град
            </p>

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(cities.length, 4)}, 1fr)`,
                height: CARD_H,
              }}
            >
              {cities.map((city, i) => (
                <CityCard key={city.id} city={city} index={i} cardHeight={CARD_H} />
              ))}
            </div>
          </div>
        </div>
      </TerraceHero>
    </div>
  )
}
