'use client'

import { useCallback, useState } from 'react'
import type { City } from '@/types'
import SearchWidget from '@/components/search/SearchWidget'
import LuxuryCityCard from '@/components/cards/LuxuryCityCard'
import CityPanoramaHero from '@/components/layout/CityPanoramaHero'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

const CARD_H = 156
const LABEL_H = 28

export default function HeroSection({ cities }: { cities: City[] }) {
  const { selectedCity, setSelectedCity } = useCitySelection()
  const [previewCity, setPreviewCity] = useState<string | null>(null)
  const panoramaCity = previewCity ?? selectedCity

  const onCityHover = useCallback((slug: string | null) => {
    setPreviewCity(slug)
  }, [])

  return (
    <section className="relative w-full" style={{ minHeight: '100dvh' }}>
      <CityPanoramaHero citySlug={panoramaCity} height="100dvh" className="absolute inset-0">
        <div
          className="flex flex-col justify-between h-full max-w-[1280px] mx-auto w-full"
          style={{ paddingTop: 24, paddingBottom: 32 }}
        >
          <div className="flex-1 flex flex-col justify-center items-center gap-4 min-h-0 pt-8">
            <p
              className="text-center uppercase tracking-[0.28em] page-enter"
              style={{ fontSize: 11, color: '#6B001C', fontWeight: 600 }}
            >
              Намерете своя луксозен имот
            </p>
            <div className="w-full flex justify-center page-enter">
              <SearchWidget
                cities={cities}
                compact
                variant="marble"
                onCityChange={slug => {
                  setSelectedCity(slug || null)
                  setPreviewCity(null)
                }}
              />
            </div>
          </div>
          <div className="flex-shrink-0" style={{ height: CARD_H + LABEL_H + 8 }}>
            <p
              className="uppercase tracking-[0.22em] mb-3 text-center page-enter"
              style={{ fontSize: 11, color: '#7A0D28', fontWeight: 600 }}
            >
              Избери град
            </p>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${cities.length}, 1fr)`, height: CARD_H }}
              onMouseLeave={() => setPreviewCity(null)}
            >
              {cities.map((city, i) => (
                <div key={city.id} onMouseEnter={() => onCityHover(city.slug)}>
                  <LuxuryCityCard city={city} index={i} cardHeight={CARD_H} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CityPanoramaHero>
    </section>
  )
}
