'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { setSelectedCity } from '@/lib/client/selected-city'
import { getCityPanoramaAsset } from '@/lib/data/city-background'
import MarbleQuarterCard from '@/components/city/MarbleQuarterCard'
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import { BurgasSearchBar } from '@/burgas-complete/shared/BurgasSearchBar'

const QUARTER_ORDER: string[] = [
  'lazur',
  'slaveykov',
  'centar',
  'meden-rudnik',
  'zornica',
  'izgrev',
  'vazrajdane',
  'bratya-miladinovi',
  'sarafovo',
  'horizont',
  'kraimorie',
]

interface Props {
  city: City
  quarters: Quarter[]
  activeListings: number
}

export default function CityBurgasView({ city, quarters, activeListings }: Props) {
  const router = useRouter()
  const hero = getCityPanoramaAsset(city.slug, city.image_url ?? null)

  const sortedQuarters = useMemo(() => {
    const order = new Map(QUARTER_ORDER.map((s, i) => [s, i]))
    return [...quarters].sort(
      (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99)
    )
  }, [quarters])

  const [quarterSlug, setQuarterSlug] = useState('')
  const [propType, setPropType] = useState('')

  const handleExplore = useCallback(() => {
    setSelectedCity(city.slug)
  }, [city.slug])

  function runSearch() {
    if (quarterSlug) {
      const params = new URLSearchParams()
      if (propType) params.set('type', propType)
      const q = params.toString()
      router.push(`/cities/burgas/${quarterSlug}${q ? `?${q}` : ''}`)
      return
    }
    const params = new URLSearchParams({ city: city.slug })
    if (propType) params.set('type', propType)
    router.push(`/buy?${params.toString()}`)
  }

  const populationLabel = city.population
    ? `~${Math.round(city.population / 1000)} 000 жители`
    : '~210 000 жители'
  const areaLabel = city.area_km2 ? `${Math.round(city.area_km2)} km² площ` : '253 km² площ'
  const regionLabel = 'Югоизточен регион'
  const listingsLabel =
    activeListings > 0 ? `${activeListings}+ активни имоти` : '850+ активни имоти'

  const description =
    city.description ||
    'Бургас е морски град с уникална атмосфера, развита инфраструктура и отлични възможности за живот и инвестиции край Черно море.'

  return (
    <div className="cb-page" aria-label={`Имоти в ${city.name}`}>
      <section className="cb-hero" aria-label="Бургас — hero и информация">
        <picture className="cb-hero__bg" aria-hidden>
          {hero.webp && <source srcSet={hero.webp} type="image/webp" />}
          <img
            src={hero.jpg}
            alt=""
            className="cb-hero__bg-img"
            style={{ objectPosition: hero.position ?? 'center 45%' }}
            draggable={false}
          />
        </picture>
        <div className="cb-hero__shade" aria-hidden />
        <div className="cb-hero__gold-inset" aria-hidden />

        <BurgasHeader variant="on-photo" />

        <div className="cb-hero__overlay" aria-labelledby="cb-about-title">
          <div className="cb-hero__panel">
            <p className="cb-hero__eyebrow">ЗА ГРАДА</p>
            <h1 id="cb-about-title" className="cb-hero__title">
              {city.name}
            </h1>
            <p className="cb-hero__text">{description}</p>
            <ul className="cb-hero__stats">
              <li>
                <PeopleIcon />
                <span>{populationLabel}</span>
              </li>
              <li>
                <GridIcon />
                <span>{areaLabel}</span>
              </li>
              <li>
                <PinLineIcon />
                <span>{regionLabel}</span>
              </li>
              <li>
                <BuildingIcon />
                <span>{listingsLabel}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="cb-hero__search-wrap" aria-label="Търсене на имоти">
          <BurgasSearchBar
            variant="city"
            citySlug={city.slug}
            cityName={city.name}
            className="cb-search cb-search--hero-dark"
            quarters={sortedQuarters}
            quarterValue={quarterSlug}
            onQuarterChange={setQuarterSlug}
            propType={propType}
            onPropTypeChange={setPropType}
            onSearch={runSearch}
          />
        </div>
      </section>

      <section className="cb-quarters cb-quarters--marble" aria-labelledby="cb-quarters-title">
        <div className="cb-quarters__head">
          <Link
            href={`/buy?city=${city.slug}`}
            className="cb-quarters__all-btn"
            onClick={handleExplore}
          >
            Виж всички квартали
            <span aria-hidden>→</span>
          </Link>
          <h2 id="cb-quarters-title" className="cb-quarters__title">
            Избери квартал в гр. {city.name}
          </h2>
        </div>
        <div className="cb-quarters__track">
          {sortedQuarters.map((q, i) => (
            <MarbleQuarterCard key={q.id} quarter={q} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function PinLineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  )
}
