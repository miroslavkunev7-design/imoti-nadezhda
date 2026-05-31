'use client'

import { useCallback, useMemo, useState, type SyntheticEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { setSelectedCity } from '@/lib/client/selected-city'
import { getCityPanoramaAsset } from '@/lib/data/city-background'
import MarbleQuarterCard from '@/components/city/MarbleQuarterCard'
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import { BurgasSearchBar } from '@/burgas-complete/shared/BurgasSearchBar'

/** Ред на картите като mockup #2 (първите 5 видими) */
const QUARTER_ORDER: string[] = [
  'lazur',
  'slaveykov',
  'izgrev',
  'vazrajdane',
  'centar',
  'meden-rudnik',
  'zornica',
  'bratya-miladinovi',
  'sarafovo',
  'horizont',
  'kraimorie',
]

const MOCKUP_STATS = {
  population: '~210 000 жители',
  area: '253 km² площ',
  region: 'Югоизточен регион',
  listings: '850+ активни имоти',
  description:
    'Бургас е морски град с уникална атмосфера, развита инфраструктура и отлични възможности за живот и инвестиции край Черно море.',
}

interface Props {
  city: City
  quarters: Quarter[]
  activeListings: number
}

const HERO_FALLBACK_CHAIN = [
  '/images/cities/burgas-hero-pier.jpg',
  '/images/cities/burgas-hero-panorama.jpg',
  '/images/cities/burgas-city-hero-sunset.jpg',
  '/images/cities/burgas.jpg',
]

export default function CityBurgasView({ city, quarters }: Props) {
  const router = useRouter()
  const hero = getCityPanoramaAsset(city.slug, city.image_url ?? null)

  const heroSources = useMemo(() => {
    const chain = [hero.jpg, ...HERO_FALLBACK_CHAIN.filter(u => u !== hero.jpg)]
    return [...new Set(chain)]
  }, [hero.jpg])

  const [heroIdx, setHeroIdx] = useState(0)
  const heroJpg = heroSources[heroIdx] ?? hero.jpg
  const heroWebp = heroJpg.endsWith('.jpg') ? heroJpg.replace('.jpg', '.webp') : hero.webp

  function onHeroError(_e: SyntheticEvent<HTMLImageElement>) {
    setHeroIdx(i => (i + 1 < heroSources.length ? i + 1 : i))
  }

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

  const populationLabel = MOCKUP_STATS.population
  const areaLabel = MOCKUP_STATS.area
  const regionLabel = MOCKUP_STATS.region
  const listingsLabel = MOCKUP_STATS.listings
  const description = MOCKUP_STATS.description

  return (
    <div className="cb-page" aria-label={`Имоти в ${city.name}`}>
      <section className="cb-hero" aria-label="Бургас — hero и информация">
        <picture className="cb-hero__bg" aria-hidden>
          <source
            media="(min-width: 1920px)"
            srcSet="/images/cities/burgas-hero-pier-4k.webp"
            type="image/webp"
          />
          {heroWebp && <source srcSet={heroWebp} type="image/webp" />}
          <img
            src={heroJpg}
            alt=""
            className="cb-hero__bg-img"
            sizes="100vw"
            style={{ objectPosition: hero.position ?? 'center 42%' }}
            draggable={false}
            fetchPriority="high"
            decoding="async"
            onError={onHeroError}
          />
        </picture>
        <div className="cb-hero__shade" aria-hidden />
        <div className="cb-hero__gold-inset" aria-hidden />

        <BurgasHeader marbleId="cbMarble" />

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
            className="cb-search--hero-dark"
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
          <h2 id="cb-quarters-title" className="cb-quarters__title">
            Избери квартал в гр. {city.name}
          </h2>
          <Link
            href={`/buy?city=${city.slug}`}
            className="cb-quarters__all-btn"
            onClick={handleExplore}
          >
            Виж всички квартали
            <span aria-hidden>→</span>
          </Link>
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
