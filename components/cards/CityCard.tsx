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

interface CityCardProps {
  city: City
  index: number
  cardHeight?: number
  variant?: 'default' | 'home'
}

export default function CityCard({ city, index, cardHeight, variant = 'default' }: CityCardProps) {
  const isHome = variant === 'home'
  const h = cardHeight ?? (isHome ? 188 : 160)

  if (isHome) {
    return (
      <div
        className="relative flex-shrink-0 card-enter hero-city-card-wrap"
        style={{ '--card-i': index, width: 200 } as React.CSSProperties}
      >
        <Link
          href={`/cities/${city.slug}`}
          onClick={() => setSelectedCity(city.slug)}
          className="collage-city-card block h-full"
          style={{ height: h }}
        >
          <div
            className="collage-city-card__photo"
            style={{
              backgroundImage: city.image_url
                ? `url(${city.image_url})`
                : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen,
            }}
          />
          <div className="collage-city-card__dissolve" aria-hidden />
          <div className="collage-city-card__body">
            <h3 className="collage-city-card__name">{city.name}</h3>
            <div className="collage-city-card__cta">
              <span>Виж града</span>
              <span className="collage-city-card__plus" aria-hidden>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="relative flex-shrink-0 card-enter flex-1 min-w-0"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link
        href={`/cities/${city.slug}`}
        onClick={() => setSelectedCity(city.slug)}
        className="city-card-link collage-city-card block relative overflow-hidden h-full"
        style={{ height: h }}
      >
        <div
          className="collage-city-card__photo"
          style={{
            backgroundImage: city.image_url
              ? `url(${city.image_url})`
              : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen,
          }}
        />
        <div className="collage-city-card__dissolve" aria-hidden />
        <div className="collage-city-card__body">
          <h3 className="collage-city-card__name">{city.name}</h3>
          <div className="collage-city-card__cta">
            <span>Квартали</span>
            <span className="collage-city-card__plus" aria-hidden>→</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
