'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { setSelectedCity } from '@/lib/client/selected-city'
import MarbleQuarterCard from '@/components/city/MarbleQuarterCard'

const BURGAS_HERO_IMAGE = '/images/cities/burgas-hero-panorama.jpg'
const BURGAS_HERO_WEBP = '/images/cities/burgas-hero-panorama.webp'

const QUARTER_ORDER = [
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

export default function CityBurgasView({ city, quarters }: Props) {
  const router = useRouter()

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

  return (
    <div className="cb-page" aria-label={`Имоти в ${city.name}`}>
      <div className="cb-upper">
        <header className="cb-header" aria-label="Главна навигация">
          <svg className="cb-header__wave" viewBox="0 0 940 166" preserveAspectRatio="none" aria-hidden>
            <defs>
              <pattern id="cbMarbleTile" patternUnits="userSpaceOnUse" x="0" y="0" width="940" height="166">
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
                <stop offset="0.15" stopColor="#8b5e1a" />
                <stop offset="0.30" stopColor="#c9882e" />
                <stop offset="0.42" stopColor="#e6b44a" />
                <stop offset="0.50" stopColor="#f0cc6a" />
                <stop offset="0.58" stopColor="#e6b44a" />
                <stop offset="0.70" stopColor="#c08025" />
                <stop offset="0.85" stopColor="#7a4c14" />
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
            <path
              d="M274 88 C329 71 365 47 392 0 H449 C412 24 394 49 354 64 C315 79 294 79 274 88 Z"
              fill="rgba(255,242,184,0.64)"
              style={{ mixBlendMode: 'screen' }}
            />
          </svg>
          <Link href="/" className="cb-header__brand" aria-label="Начало">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-nadezhda-brand.png"
              alt="Имоти Надежда"
              className="cb-header__brand-img"
              draggable={false}
            />
          </Link>
        </header>

        <div className="cb-stack">
          <figure className="cb-hero-card">
          <div className="cb-hero-card__frame">
            <picture>
              <source srcSet={BURGAS_HERO_WEBP} type="image/webp" />
              <img
                src={BURGAS_HERO_IMAGE}
                alt={`Изглед към ${city.name} — морска градина и пир`}
                className="cb-hero-card__img"
                draggable={false}
              />
            </picture>
          </div>
          </figure>

          <div className="cb-search" role="search">
          <div className="cb-search__field">
            <PinFieldIcon />
            <div className="cb-search__wrap">
              <span>Град</span>
              <strong>Бургас</strong>
            </div>
          </div>
          <div className="cb-search__field">
            <PinFieldIcon />
            <div className="cb-search__wrap">
              <span>Квартал</span>
              <select
                value={quarterSlug}
                onChange={e => {
                  setQuarterSlug(e.target.value)
                  if (e.target.value) runSearch()
                }}
                className="cb-search__select"
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
          <div className="cb-search__field">
            <BagIcon />
            <div className="cb-search__wrap">
              <span>Вид имот</span>
              <select
                value={propType}
                onChange={e => {
                  setPropType(e.target.value)
                  if (e.target.value) runSearch()
                }}
                className="cb-search__select"
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
        </div>
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

function PinFieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  )
}
