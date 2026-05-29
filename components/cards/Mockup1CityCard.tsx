'use client'

import Link from 'next/link'
import type { City } from '@/types'
import { setSelectedCity } from '@/lib/client/selected-city'

const CITY_GRADIENTS: Record<string, string> = {
  shumen: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1a 50%, #0f0a1a 100%)',
  varna: 'linear-gradient(135deg, #0a1a2d 0%, #0f2040 50%, #091525 100%)',
  burgas: 'linear-gradient(135deg, #0a1820 0%, #0f2530 50%, #071015 100%)',
  'novi-pazar': 'linear-gradient(135deg, #0f1a0a 0%, #162010 50%, #0a1208 100%)',
}

interface Props {
  city: City
  onSelect?: (slug: string) => void
}

export default function Mockup1CityCard({ city, onSelect }: Props) {
  const bg = city.image_url
    ? `url(${city.image_url})`
    : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen

  return (
    <Link
      href={`/cities/${city.slug}`}
      className="m1-city-card"
      onClick={() => {
        setSelectedCity(city.slug)
        onSelect?.(city.slug)
      }}
    >
      <div className="m1-city-card__photo-wrap">
        <div className="m1-city-card__photo" style={{ backgroundImage: bg }} />
        <div className="m1-city-card__dust" aria-hidden />
      </div>
      <div className="m1-city-card__body">
        <h3 className="m1-city-card__name">{city.name}</h3>
        <div className="m1-city-card__footer">
          <span className="m1-city-card__cta">Виж града</span>
          <span className="m1-city-card__plus" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
