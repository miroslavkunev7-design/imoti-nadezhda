'use client'

import Link from 'next/link'
import type { City } from '@/types'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface LuxuryCityCardProps {
  city: City
  cardHeight?: number
}

export default function LuxuryCityCard({ city, cardHeight = 156 }: LuxuryCityCardProps) {
  const { setCitySlug } = useCitySelection()

  function handleClick() {
    if (city.slug) setCitySlug(city.slug as CitySlug)
  }

  return (
    <Link
      href={`/cities/${city.slug}`}
      onClick={handleClick}
      className="lux-city-card block"
      style={{ height: cardHeight }}
    >
      <div
        className="lux-city-card__img"
        style={{
          backgroundImage: city.image_url
            ? `url(${city.image_url})`
            : undefined,
        }}
      />
      <div className="lux-city-card__dissolve" aria-hidden />
      <div className="lux-city-card__content">
        <h3 className="lux-city-card__name">{city.name}</h3>
        <span className="lux-city-card__cta">Разгледай квартали →</span>
      </div>
    </Link>
  )
}
