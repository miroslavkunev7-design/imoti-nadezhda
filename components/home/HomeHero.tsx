'use client'

import Link from 'next/link'
import type { City } from '@/types'
import { setSelectedCity } from '@/lib/client/selected-city'

interface Props { cities: City[] }

const CITY_FALLBACK: Record<string, string> = {
  shumen: '/images/cities/shumen.jpg',
  varna: '/images/cities/varna.jpg',
  burgas: '/images/cities/burgas.jpg',
  'novi-pazar': '/images/cities/novi-pazar.jpg',
}

const CITY_ORDER = ['shumen', 'varna', 'burgas', 'novi-pazar'] as const

export default function HomeHero({ cities }: Props) {
  const bySlug = (slug: string) => cities.find(c => c.slug === slug)
  const cityCards = CITY_ORDER.map(slug => bySlug(slug)).filter(Boolean) as City[]

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
            {/* Marble texture */}
            <pattern id="hpMarbleTile" patternUnits="userSpaceOnUse" x="0" y="0" width="940" height="166">
              <image href="/images/texture-marble-white-gold.png"
                x="0" y="0" width="940" height="166"
                preserveAspectRatio="xMidYMid slice" />
            </pattern>

            {/* 3D gold ribbon — main body (dark→bright→dark across the band width) */}
            <linearGradient id="hpGoldRibbon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0"    stopColor="#3d1f00" />
              <stop offset="0.06" stopColor="#7a4210" />
              <stop offset="0.18" stopColor="#d4960a" />
              <stop offset="0.32" stopColor="#f7d96a" />
              <stop offset="0.46" stopColor="#fff3a0" />
              <stop offset="0.58" stopColor="#f0c836" />
              <stop offset="0.72" stopColor="#c68e10" />
              <stop offset="0.86" stopColor="#7a4a08" />
              <stop offset="1"    stopColor="#3a1e02" />
            </linearGradient>

            {/* Bright highlight streak on top edge of ribbon */}
            <linearGradient id="hpGoldEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0"    stopColor="rgba(255,255,255,0)" />
              <stop offset="0.15" stopColor="rgba(255,248,200,0.85)" />
              <stop offset="0.42" stopColor="rgba(255,252,220,0.96)" />
              <stop offset="0.70" stopColor="rgba(255,240,160,0.72)" />
              <stop offset="1"    stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Shadow under ribbon */}
            <linearGradient id="hpGoldShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0"   stopColor="rgba(0,0,0,0.32)" />
              <stop offset="1"   stopColor="rgba(0,0,0,0)" />
            </linearGradient>

            <filter id="hpRibbonBlur">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
            <clipPath id="hpClip">
              <path d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"/>
            </clipPath>
          </defs>

          {/* 1. Marble surface */}
          <path d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"
            fill="url(#hpMarbleTile)"
            stroke="rgba(190,138,42,0.38)" strokeWidth="1" />

          {/* 2. Drop shadow under ribbon */}
          <path d="M0 148 C72 165 158 165 210 143 C234 133 248 116 278 100 C318 80 362 60 394 8 H420 C388 62 342 84 300 104 C270 118 254 136 222 148 C168 170 72 172 0 158 Z"
            fill="url(#hpGoldShadow)" filter="url(#hpRibbonBlur)" opacity="0.6" />

          {/* 3. Thick 3D gold ribbon — main body */}
          <path d="M0 140 C72 158 156 158 208 136 C232 126 246 108 276 92 C316 70 360 50 392 0 H476 C444 18 428 38 396 56 C354 78 320 96 294 112 C266 128 248 144 216 154 C164 172 74 168 0 156 Z"
            fill="url(#hpGoldRibbon)" />

          {/* 4. Top bright highlight edge */}
          <path d="M0 140 C72 158 156 158 208 136 C232 126 246 108 276 92 C316 70 360 50 392 0 H406 C374 46 330 66 290 88 C264 104 248 120 220 132 C168 152 76 156 0 144 Z"
            fill="url(#hpGoldEdge)" opacity="0.9" />

          {/* 5. Fine bright line on top edge of ribbon */}
          <path d="M0 140 C72 158 156 158 208 136 C232 126 246 108 276 92 C316 70 360 50 392 0"
            fill="none" stroke="rgba(255,252,210,0.95)" strokeWidth="1.8" />

          {/* 6. Fine dark line on bottom edge */}
          <path d="M0 156 C74 168 164 172 216 154 C248 144 266 128 294 112 C320 96 354 78 396 56 C428 38 444 18 476 0"
            fill="none" stroke="rgba(60,30,0,0.55)" strokeWidth="1.2" />
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

      <form className="hp-search" action="/buy">
        <div className="hp-search__field hp-search__field--city">
          <PinIcon />
          <div>
            <span>Град</span>
            <strong>Бургас</strong>
          </div>
        </div>
        <div className="hp-search__field hp-search__field--quarter">
          <HomeMiniIcon />
          <div>
            <span>Квартал</span>
            <strong>Лазур</strong>
          </div>
        </div>
        <div className="hp-search__field hp-search__field--type">
          <BagIcon />
          <div>
            <span>Вид имот</span>
            <strong>Апартамент</strong>
          </div>
        </div>
        <div className="hp-search__field hp-search__field--price">
          <EuroIcon />
          <div>
            <span>Цена</span>
            <strong>от 200 000 €</strong>
            <em>до 500 000 €</em>
          </div>
        </div>
        <div className="hp-search__field hp-search__field--area">
          <AreaIcon />
          <div>
            <span>Площ</span>
            <strong>от 100 m²</strong>
            <em>до 200 m²</em>
          </div>
        </div>
        <button type="button" className="hp-search__filter">
          <FilterIcon />
          Филтри
        </button>
        <button type="submit" className="hp-search__submit">
          <SearchIcon />
          Търси
        </button>
        <input type="hidden" name="city" value="burgas" />
        <input type="hidden" name="quarter" value="lazur" />
        <input type="hidden" name="type" value="Апартамент" />
        <input type="hidden" name="price_min" value="200000" />
        <input type="hidden" name="price_max" value="500000" />
        <input type="hidden" name="area_min" value="100" />
        <input type="hidden" name="area_max" value="200" />
      </form>

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
function HomeMiniIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></svg>
}
function BagIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 7h12l1 14H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
}
function EuroIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 10h11M5 14h9M19 5.5A8 8 0 1 0 19 18.5" /></svg>
}
function AreaIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M8 8h4M8 8v4M16 16h-4M16 16v-4" /></svg>
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
