'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { setSelectedCity } from '@/lib/client/selected-city'
import { getCityPanoramaAsset } from '@/lib/data/city-background'
import MarbleQuarterCard from '@/components/city/MarbleQuarterCard'

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
  const panorama = getCityPanoramaAsset(city.slug, city.image_url ?? null)

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
    const params = new URLSearchParams({ city: city.slug })
    if (quarterSlug) params.set('quarter', quarterSlug)
    if (propType) params.set('type', propType)
    router.push(`/buy?${params.toString()}`)
  }

  const areaStat = city.area_km2 ? `${Math.round(city.area_km2)} km² площ` : '256 km² площ'
  const listingsStat =
    activeListings > 0 ? `${activeListings}+ активни имоти` : '850+ активни имоти'

  const description =
    'Бургас е второто по големина черноморско пристанище в България с уникална атмосфера, езера и прекрасна морска среда.'

  return (
    <div className="cb-page" aria-label={`Имоти в ${city.name}`}>
      <div className="cb-hero-stage">
        <picture className="hp-bg" aria-hidden>
          {panorama.webp && <source srcSet={panorama.webp} type="image/webp" />}
          <img
            src={panorama.jpg}
            alt=""
            className="hp-bg__img"
            style={{ objectPosition: panorama.position ?? 'center 42%' }}
            draggable={false}
          />
        </picture>
        <div className="hp__vignette cb-hero__vignette" aria-hidden />

        <header className="hp-top" aria-label="Главна навигация">
          <svg className="hp-top__surface" viewBox="0 0 940 166" preserveAspectRatio="none" aria-hidden>
            <defs>
              <pattern id="cbMarbleTile" patternUnits="userSpaceOnUse" width="940" height="166">
                <image
                  href="/images/texture-marble-white-gold.png"
                  x="0"
                  y="0"
                  width="940"
                  height="166"
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
              <linearGradient id="cbGoldRibbon" x1="0" y1="0" x2="0.7" y2="1">
                <stop offset="0" stopColor="#3d2006" />
                <stop offset="0.42" stopColor="#e6b44a" />
                <stop offset="0.58" stopColor="#e6b44a" />
                <stop offset="1" stopColor="#3a1e05" />
              </linearGradient>
            </defs>
            <path
              d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"
              fill="url(#cbMarbleTile)"
              stroke="rgba(190,138,42,0.35)"
              strokeWidth="1"
            />
            <path
              d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0 H478 C438 25 416 52 371 70 C330 86 300 89 281 105 C257 125 246 147 216 159 C153 181 70 174 0 164 Z"
              fill="url(#cbGoldRibbon)"
              opacity="0.96"
            />
          </svg>
          <Link href="/" className="hp-brand" aria-label="Начало">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-nadezhda-brand.png"
              alt="Имоти Надежда"
              className="hp-brand__img"
              draggable={false}
            />
          </Link>
          <nav className="hp-nav" aria-label="Навигация">
            <Link href="/buy" className="hp-nav__link">
              За продажба
            </Link>
            <span className="hp-nav__sep" aria-hidden />
            <Link href="/buy?deal=rent" className="hp-nav__link">
              Под наем
            </Link>
            <span className="hp-nav__sep" aria-hidden />
            <Link href="/about" className="hp-nav__link">
              За нас
            </Link>
            <Link href="/admin/login" className="hp-nav__user" aria-label="Вход">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </Link>
          </nav>
        </header>

        <aside className="cb-about" aria-labelledby="cb-about-title">
          <p className="cb-about__eyebrow">ЗА ГРАДА</p>
          <h1 id="cb-about-title" className="cb-about__title">
            {city.name}
          </h1>
          <p className="cb-about__text">{description}</p>
          <ul className="cb-about__stats">
            <li>
              <GridIcon />
              <span>{areaStat}</span>
            </li>
            <li>
              <BuildingIcon />
              <span>{listingsStat}</span>
            </li>
          </ul>
        </aside>

        <div className="hp-search cb-search-bridge" role="search">
          <div className="hp-search__field hp-search__field--city">
            <PinFieldIcon />
            <div className="hp-search__select-wrap">
              <span>Град</span>
              <strong>Бургас</strong>
            </div>
          </div>
          <div className="hp-search__field hp-search__field--quarter">
            <PinFieldIcon />
            <div className="hp-search__select-wrap">
              <span>Квартал</span>
              <select
                value={quarterSlug}
                onChange={e => setQuarterSlug(e.target.value)}
                className="hp-search__select"
                aria-label="Квартал"
              >
                <option value="">Всички</option>
                {sortedQuarters.map(q => (
                  <option key={q.slug} value={q.slug}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="hp-search__field hp-search__field--type">
            <BagIcon />
            <div className="hp-search__select-wrap">
              <span>Вид имот</span>
              <select
                value={propType}
                onChange={e => setPropType(e.target.value)}
                className="hp-search__select"
                aria-label="Вид имот"
              >
                <option value="">Всички</option>
                {PROPERTY_TYPES_BG.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="hp-search__field hp-search__field--price">
            <EuroIcon />
            <div className="hp-search__select-wrap">
              <span>Цена</span>
              <strong>Без ограничение</strong>
            </div>
          </div>
          <div className="hp-search__field hp-search__field--area">
            <AreaIcon />
            <div className="hp-search__select-wrap">
              <span>Площ</span>
              <strong>Без ограничение</strong>
            </div>
          </div>
          <button
            type="button"
            className="hp-search__filter"
            onClick={() => router.push(`/buy?city=${city.slug}`)}
          >
            <FilterIcon />
            Филтри
          </button>
          <button type="button" className="hp-search__submit" onClick={runSearch}>
            <SearchIcon />
            Търси
          </button>
        </div>
      </div>

      <section className="cb-quarters" aria-labelledby="cb-quarters-title">
        <div className="cb-quarters__head">
          <Link
            href={`/buy?city=${city.slug}`}
            className="cb-quarters__all-btn"
            onClick={handleExplore}
          >
            Виж всички квартали
            <span className="cb-quarters__all-arrow" aria-hidden>
              →
            </span>
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
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  )
}
function PinFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  )
}
function EuroIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M5 10h11M5 14h9M19 5.5A8 8 0 1020 18.5" />
    </svg>
  )
}
function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  )
}
