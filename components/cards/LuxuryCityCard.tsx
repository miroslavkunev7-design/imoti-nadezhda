'use client'

import Link from 'next/link'
import type { City } from '@/types'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'
import { isCitySlug } from '@/lib/design/brand'
import { resolveCityHeroPanorama } from '@/lib/design/city-panoramas'

interface LuxuryCityCardProps {
  city: City
  cardHeight?: number
}

export default function LuxuryCityCard({ city, cardHeight = 156 }: LuxuryCityCardProps) {
  const { setSelectedCity } = useCitySelection()
  const bg = city.image_url || resolveCityHeroPanorama(city.slug)

  function onSelect() {
    if (isCitySlug(city.slug)) setSelectedCity(city.slug)
  }

  return (
    <Link
      href={`/cities/${city.slug}`}
      onClick={onSelect}
      className="lux-city-card lux-shimmer block"
      style={{ height: cardHeight }}
    >
      <div className="lux-city-card__image" style={{ backgroundImage: `url('${bg}')` }} />
      <div className="lux-city-card__dissolve" />
      <div className="lux-city-card__particles" />
      <div className="lux-city-card__content">
        <h3 className="lux-city-card__title">{city.name}</h3>
      </div>
    </Link>
  )
}
