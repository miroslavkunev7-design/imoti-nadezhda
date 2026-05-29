'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { City, Quarter } from '@/types'
import { getCityPanoramaAsset } from '@/lib/data/city-background'
import { setSelectedCity } from '@/lib/client/selected-city'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import CityHeroSearchCard from '@/components/city/CityHeroSearchCard'

interface Props {
  city: City
  quarters: Quarter[]
  activeListings: number
  quartersStrip: React.ReactNode
}

export default function CityLuxuryHero({ city, quarters, activeListings, quartersStrip }: Props) {
  useEffect(() => {
    setSelectedCity(city.slug)
  }, [city.slug])

  const panorama = getCityPanoramaAsset(city.slug, city.image_url)
  const description =
    city.description ||
    `${city.name} — исторически и модерен град с богато културно наследство и отлични възможности за инвестиции.`

  const populationLabel = city.population
    ? `~ ${city.population.toLocaleString('bg-BG')} жители`
    : '—'
  const areaLabel = city.area_km2 ? `${city.area_km2} km² площ` : '—'
  const regionLabel = city.region ?? 'България'

  return (
    <section className="city-luxury-hero" aria-label={`Имоти в ${city.name}`}>
      <div className="city-luxury-frame" aria-hidden />

      <picture className="city-luxury-hero__bg">
        {panorama.webp && <source srcSet={panorama.webp} type="image/webp" />}
        <img
          src={panorama.jpg}
          alt={panorama.label ?? `Панорама — ${city.name}`}
          className="city-luxury-hero__bg-img"
          style={{ objectPosition: panorama.position ?? 'center 42%' }}
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <div className="city-luxury-hero__vignette" aria-hidden />

      <aside className="city-luxury-sidebar">
        <div className="city-luxury-sidebar__filters marble-dispersion marble-dispersion--subtle">
          <CityHeroSearchCard
            cities={FALLBACK_CITIES}
            initialCity={city.slug}
            initialQuarters={quarters}
          />
        </div>

        <article className="city-luxury-about marble-dispersion marble-dispersion--burgundy">
          <p className="city-luxury-about__eyebrow">ЗА ГРАДА</p>
          <h1 className="city-luxury-about__title">{city.name}</h1>
          <p className="city-luxury-about__text">{description}</p>

          {city.image_url && (
            <div
              className="city-luxury-about__thumb"
              style={{ backgroundImage: `url(${city.image_url})` }}
              role="img"
              aria-label={`Изглед към ${city.name}`}
            />
          )}

          <ul className="city-luxury-about__stats">
            <li>
              <PeopleIcon />
              <span>{populationLabel}</span>
            </li>
            <li>
              <AreaIcon />
              <span>{areaLabel}</span>
            </li>
            <li>
              <RegionIcon />
              <span>{regionLabel}</span>
            </li>
            <li>
              <HomeIcon />
              <span>{activeListings} активни имоти</span>
            </li>
          </ul>

          <Link href={`/buy?city=${city.slug}`} className="city-luxury-about__cta btn-marble-luxury">
            Разгледай имоти в {city.name}
            <span aria-hidden>→</span>
          </Link>
        </article>
      </aside>

      <div className="city-luxury-hero__quarters">{quartersStrip}</div>
    </section>
  )
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}
function AreaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
function RegionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}
