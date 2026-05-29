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
            <pattern id="hpMarbleTile" patternUnits="userSpaceOnUse" x="0" y="0" width="940" height="166">
              <image href="/images/texture-marble-white-gold.png"
                x="0" y="0" width="940" height="166"
                preserveAspectRatio="xMidYMid slice" />
            </pattern>

            {/* 3D ribbon — vertical gradient across ribbon thickness */}
            <linearGradient id="hpGoldRibbon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2a1000" />
              <stop offset="7%"   stopColor="#6b3608" />
              <stop offset="18%"  stopColor="#c48518" />
              <stop offset="33%"  stopColor="#f5d560" />
              <stop offset="46%"  stopColor="#fff6b8" />
              <stop offset="56%"  stopColor="#ffe070" />
              <stop offset="70%"  stopColor="#c68e10" />
              <stop offset="84%"  stopColor="#7a4a08" />
              <stop offset="100%" stopColor="#1e0e00" />
            </linearGradient>

            <filter id="hpRibbonShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.42"/>
            </filter>
          </defs>

          {/* ── Marble panel — original shape ── */}
          <path
            d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z"
            fill="url(#hpMarbleTile)"
            stroke="rgba(190,138,42,0.35)"
            strokeWidth="1"
          />

          {/* ── 3D Gold ribbon — original curve, new gradient ── */}
          <path
            d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0 H478 C438 25 416 52 371 70 C330 86 300 89 281 105 C257 125 246 147 216 159 C153 181 70 174 0 164 Z"
            fill="url(#hpGoldRibbon)"
            filter="url(#hpRibbonShadow)"
          />

          {/* ── Bright top-edge highlight line ── */}
          <path
            d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0"
            fill="none" stroke="rgba(255,252,210,0.90)" strokeWidth="1.8"
          />

          {/* ── Second bright streak just inside top edge ── */}
          <path
            d="M0 157.5 C78 170 168 170 216 145 C238 130 248 109 278 93 C316 72 363 56 393 2"
            fill="none" stroke="rgba(255,245,170,0.50)" strokeWidth="1.0"
          />

          {/* ── Dark bottom-edge shadow ── */}
          <path
            d="M0 164 C70 174 153 181 216 159 C246 147 257 125 281 105 C300 89 330 86 371 70 C416 52 438 25 478 0"
            fill="none" stroke="rgba(25,8,0,0.62)" strokeWidth="1.4"
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
