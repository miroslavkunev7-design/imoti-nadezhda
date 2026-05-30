'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City } from '@/types'
import { setSelectedCity } from '@/lib/client/selected-city'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'

interface Props { cities: City[] }

const CITY_FALLBACK: Record<string, string> = {
  shumen: '/images/cities/shumen.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

const CITY_ORDER = ['shumen', 'varna', 'burgas', 'novi-pazar'] as const

export default function HomeHero({ cities }: Props) {
  const router = useRouter()
  const bySlug = (slug: string) => cities.find(c => c.slug === slug)
  const cityCards = CITY_ORDER.map(slug => bySlug(slug)).filter(Boolean) as City[]

  const [selectedCitySlug, setSelectedCitySlug] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [priceLabel, setPriceLabel] = useState('Без значение')
  const [areaLabel, setAreaLabel] = useState('Без значение')

  const selectedCityData = selectedCitySlug ? bySlug(selectedCitySlug) : null

  function handleSearch() {
    const params = new URLSearchParams()
    if (selectedCitySlug) params.set('city', selectedCitySlug)
    if (selectedType) params.set('type', selectedType)
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <main className="hp" aria-label="Начална страница">
      <picture className="hp-bg" aria-hidden>
        <source srcSet="/images/hero-bg.webp" type="image/webp" />
        <img src="/images/hero-bg.jpg" alt="" className="hp-bg__img" draggable={false} />
      </picture>
      <div className="hp__vignette" aria-hidden />

      <section className="hp-top" aria-label="Главна навигация">
        <svg className="hp-top__surface" viewBox="0 0 940 166" preserveAspectRatio="none" aria-hidden>
          <defs>
            <pattern id="hpMarbleTile" patternUnits="userSpaceOnUse" x="0" y="0" width="940" height="166">
              <image href="/images/texture-marble-white-gold.png"
                x="0" y="0" width="940" height="166"
                preserveAspectRatio="xMidYMid slice" />
            </pattern>
            <linearGradient id="hpGoldRibbon" x1="0" y1="0" x2="0.7" y2="1">
              <stop offset="0"    stopColor="#3d2006" />
              <stop offset="0.15" stopColor="#8b5e1a" />
              <stop offset="0.30" stopColor="#c9882e" />
              <stop offset="0.42" stopColor="#e6b44a" />
              <stop offset="0.50" stopColor="#f0cc6a" />
              <stop offset="0.58" stopColor="#e6b44a" />
              <stop offset="0.70" stopColor="#c08025" />
              <stop offset="0.85" stopColor="#7a4c14" />
              <stop offset="1"    stopColor="#3a1e05" />
            </linearGradient>
            <filter id="hpRibbonShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.30"/>
            </filter>
          </defs>
          <path
            d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"
            fill="url(#hpMarbleTile)"
            stroke="rgba(190,138,42,0.35)"
            strokeWidth="1"
          />
          <path
            d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0 H478 C438 25 416 52 371 70 C330 86 300 89 281 105 C257 125 246 147 216 159 C153 181 70 174 0 164 Z"
            fill="url(#hpGoldRibbon)"
            opacity="0.96"
          />
          <path
            d="M274 88 C329 71 365 47 392 0 H449 C412 24 394 49 354 64 C315 79 294 79 274 88 Z"
            fill="rgba(255,242,184,0.64)"
            style={{ mixBlendMode: 'screen' }}
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
          <Link href="/buy" className="hp-nav__link">За продажба</Link>
          <span className="hp-nav__sep" aria-hidden />
          <Link href="/buy?deal=rent" className="hp-nav__link">Под наем</Link>
          <span className="hp-nav__sep" aria-hidden />
          <Link href="/about" className="hp-nav__link">За нас</Link>
          <Link href="/admin/login" className="hp-nav__user" aria-label="Вход">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </nav>
      </section>

      {/* Interactive Search */}
      <div className="hp-search">
        <div className="hp-search__field hp-search__field--city">
          <PinIcon />
          <div className="hp-search__select-wrap">
            <span>Град</span>
            <select
              value={selectedCitySlug}
              onChange={e => setSelectedCitySlug(e.target.value)}
              className="hp-search__select"
            >
              <option value="">Всички</option>
              {cities.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hp-search__field hp-search__field--type">
          <BagIcon />
          <div className="hp-search__select-wrap">
            <span>Вид имот</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="hp-search__select"
            >
              <option value="">Всички</option>
              {PROPERTY_TYPES_BG.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="hp-search__field hp-search__field--price">
          <EuroIcon />
          <div>
            <span>Цена</span>
            <strong>{priceLabel}</strong>
          </div>
        </div>

        <button type="button" className="hp-search__filter" onClick={() => router.push('/buy')}>
          <FilterIcon />
          Филтри
        </button>

        <button type="button" className="hp-search__submit" onClick={handleSearch}>
          <SearchIcon />
          Търси
        </button>
      </div>

      {/* City Info Card — appears when city is selected */}
      {selectedCityData && (
        <div className="hp-citycard">
          <div className="hp-citycard__photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedCityData.image_url || CITY_FALLBACK[selectedCityData.slug]}
              alt={selectedCityData.name}
              className="hp-citycard__img"
            />
          </div>
          <div className="hp-citycard__body">
            <span className="hp-citycard__label">ЗА ГРАДА</span>
            <h2 className="hp-citycard__title">{selectedCityData.name}</h2>
            <p className="hp-citycard__desc">{selectedCityData.description}</p>
            <div className="hp-citycard__stats">
              <div>
                <strong>{selectedCityData.population ? `${(selectedCityData.population / 1000).toFixed(0)} 000` : '—'}</strong>
                <span>жители</span>
              </div>
              <div>
                <strong>{selectedCityData.area_km2 ?? '—'} km²</strong>
                <span>площ</span>
              </div>
              <div>
                <strong>{selectedCityData.region ?? '—'}</strong>
                <span>регион</span>
              </div>
              <div>
                <strong>{selectedCityData.property_count ?? 0}</strong>
                <span>активни имоти</span>
              </div>
            </div>
            <Link
              href={`/cities/${selectedCityData.slug}`}
              className="hp-citycard__btn"
              onClick={() => setSelectedCity(selectedCityData.slug)}
            >
              Разгледай имоти в {selectedCityData.name}
            </Link>
          </div>
        </div>
      )}

      {/* City cards at bottom */}
      <section className="hp-cities" aria-label="Градове">
        {cityCards.map(city => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="hp-city"
            onClick={() => setSelectedCity(city.slug)}
          >
            <div className="hp-city__photo" style={{ backgroundImage: `url(${city.image_url || CITY_FALLBACK[city.slug]})` }} />
            <div className="hp-city__fade" aria-hidden />
            <div className="hp-city__body">
              <h2>
                <PinSmallIcon />
                {city.name}
              </h2>
              <div>
                <span>Виж града</span>
                <b aria-hidden>→</b>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" /><circle cx="12" cy="9" r="2.4" /></svg>
}
function BagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
}
function EuroIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 10h11M5 14h9M19 5.5A8 8 0 1 0 19 18.5" /></svg>
}
function FilterIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
}
function PinSmallIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" /><circle cx="12" cy="9" r="2.2" /></svg>
}
