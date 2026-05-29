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

export default function HomeCloneCityCard({ city, onSelect }: Props) {
  const bg = city.image_url
    ? `url(${city.image_url})`
    : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen

  return (
    <Link
      href={`/cities/${city.slug}`}
      className="hc-card"
      onClick={() => {
        setSelectedCity(city.slug)
        onSelect?.(city.slug)
      }}
    >
      <div className="hc-card__media">
        <div className="hc-card__photo" style={{ backgroundImage: bg }} />
        <div className="hc-card__dust" aria-hidden />
      </div>
      <div className="hc-card__body">
        <div className="hc-card__title-row">
          <span className="hc-card__pin" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </span>
          <h3 className="hc-card__name">{city.name}</h3>
        </div>
        <div className="hc-card__footer">
          <span className="hc-card__cta">Виж града</span>
          <span className="hc-card__arrow" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
