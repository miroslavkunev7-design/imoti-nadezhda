'use client'

import Link from 'next/link'
import type { City } from '@/types'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

const CITY_GRADIENTS: Record<string, string> = {
  shumen: 'linear-gradient(135deg, #3d1020, #6b001c)',
  varna: 'linear-gradient(135deg, #0a2840, #1a4060)',
  burgas: 'linear-gradient(135deg, #0a2030, #153545)',
  'novi-pazar': 'linear-gradient(135deg, #1a2810, #2a4020)',
}

export default function LuxuryCityCard({
  city,
  index,
  cardHeight,
}: {
  city: City
  index: number
  cardHeight?: number
}) {
  const { setSelectedCity } = useCitySelection()

  return (
    <div className="relative flex-1 min-w-0 card-enter" style={{ '--card-i': index } as React.CSSProperties}>
      <Link
        href={`/cities/${city.slug}`}
        className="lux-city-card block h-full"
        style={{ height: cardHeight ?? 160 }}
        onClick={() => setSelectedCity(city.slug)}
      >
        <div
          className="lux-city-card__img"
          style={{
            backgroundImage: city.image_url
              ? `url(${city.image_url})`
              : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen,
          }}
        />
        <div className="lux-city-card__dissolve" aria-hidden />
        <div className="lux-city-card__particles" aria-hidden />
        <div className="lux-city-card__content">
          <h3 className="lux-city-card__title">{city.name}</h3>
          <span className="lux-city-card__cta">Разгледай имоти →</span>
        </div>
      </Link>
    </div>
  )
}
