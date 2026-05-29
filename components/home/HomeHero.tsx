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
            <linearGradient id="hpMarbleBase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f8ecda" />
              <stop offset="0.42" stopColor="#fffaf0" />
              <stop offset="0.72" stopColor="#f6ead7" />
              <stop offset="1" stopColor="#ead8bc" />
            </linearGradient>
            <linearGradient id="hpGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#87520f" />
              <stop offset="0.18" stopColor="#d4a844" />
              <stop offset="0.46" stopColor="#fff0a8" />
              <stop offset="0.67" stopColor="#c58a22" />
              <stop offset="1" stopColor="#6e3f0b" />
            </linearGradient>
            <filter id="hpMarbleNoise" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.032" numOctaves="4" seed="17" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.85 0 0 0 0 0.68 0 0 0 0 0.35 0 0 0 0.18 0" />
            </filter>
          </defs>
          <path className="hp-top__surface-main" d="M8 0 H934 Q940 0 940 6 V114 H277 C246 114 236 128 216 143 C166 180 72 171 0 156 V0 Z" />
          <path className="hp-top__surface-gold" d="M0 156 C77 169 168 168 216 143 C238 128 247 107 277 91 C315 70 363 54 392 0 H478 C438 25 416 52 371 70 C330 86 300 89 281 105 C257 125 246 147 216 159 C153 181 70 174 0 164 Z" />
          <path className="hp-top__surface-gold-light" d="M274 88 C329 71 365 47 392 0 H449 C412 24 394 49 354 64 C315 79 294 79 274 88 Z" />
          <path className="hp-top__surface-marble-lines" d="M30 18 C84 7 130 13 178 4 M34 119 C80 108 137 112 188 98 M500 20 C585 4 666 12 736 0 M652 92 C735 83 824 90 920 78" />
        </svg>
        <Link href="/" className="hp-brand" aria-label="Начало">
          <svg className="hp-brand__mark" viewBox="0 0 220 92" aria-hidden>
            <path className="hp-brand__roof" d="M18 58 L63 22 L101 58" />
            <path className="hp-brand__roof hp-brand__roof--mid" d="M69 58 L111 12 L154 58" />
            <path className="hp-brand__roof" d="M122 58 L160 28 L202 58" />
            <path className="hp-brand__wall" d="M40 58 H92 V79 H40 Z" />
            <path className="hp-brand__wall" d="M99 58 H158 V79 H99 Z" />
            <path className="hp-brand__wall" d="M166 58 H208 V79 H166 Z" />
            <path className="hp-brand__window" d="M56 64 H69 V77 H56 Z M72 64 H85 V77 H72 Z" />
            <path className="hp-brand__window" d="M113 64 H132 V77 H113 Z M135 64 H154 V77 H135 Z" />
            <path className="hp-brand__window" d="M176 64 H189 V77 H176 Z M192 64 H205 V77 H192 Z" />
            <path className="hp-brand__chimney" d="M142 13 H157 V29 H142 Z" />
            <path className="hp-brand__spark" d="M158 7 H170 V19 H158 Z" />
          </svg>
          <span className="hp-brand__small">НЕДВИЖИМИ ИМОТИ</span>
          <span className="hp-brand__name">•НАДЕЖДА•</span>
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
