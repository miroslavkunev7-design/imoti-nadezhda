'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Property, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import BurgasListingCard from '@/burgas-complete/quarter/BurgasListingCard'

interface Props {
  city: City
  quarter: Quarter
  allQuarters: Quarter[]
  properties: Property[]
  total: number
}

const QUICK_FILTERS = [
  { id: 'all', label: 'Всички' },
  { id: 'apartment', label: 'Апартамент' },
  { id: 'house', label: 'Къща' },
  { id: 'new', label: 'Нови' },
  { id: 'featured', label: 'Топ оферти' },
]

export default function QuarterBurgasView({
  city,
  quarter,
  allQuarters,
  properties,
  total,
}: Props) {
  const router = useRouter()
  const heroImage = resolveMediaUrl(quarter.image_url) ?? '/images/quarters/burgas/lazur.jpg'

  const [propType, setPropType] = useState('')
  const [priceLabel] = useState('Без значение')
  const [quickFilter, setQuickFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = properties
    if (quickFilter === 'apartment') {
      list = list.filter(p => p.type === 'Апартамент')
    } else if (quickFilter === 'house') {
      list = list.filter(p => p.type === 'Къща')
    } else if (quickFilter === 'new') {
      list = list.filter(p => p.is_new)
    } else if (quickFilter === 'featured') {
      list = list.filter(p => p.is_featured)
    }
    if (propType) {
      list = list.filter(p => p.type === propType)
    }
    return list
  }, [properties, quickFilter, propType])

  const populationLabel = quarter.population
    ? `~${Math.round(quarter.population / 1000)}k жители`
    : '—'
  const areaLabelStat = quarter.area_km2 ? `${quarter.area_km2} km²` : '—'
  const listingsLabel = total > 0 ? `${total} обяви` : 'Скоро нови обяви'

  const runSearch = useCallback(() => {
    const params = new URLSearchParams({ city: city.slug, quarter: quarter.slug })
    if (propType) params.set('type', propType)
    router.push(`/buy?${params.toString()}`)
  }, [city.slug, quarter.slug, propType, router])

  const description =
    quarter.description ||
    `Открийте най-добрите имоти в кв. ${quarter.name}, ${city.name} — премиум локация с отлична инфраструктура.`

  return (
    <div className="bq-page" aria-label={`Имоти в кв. ${quarter.name}`}>
      <section className="bq-hero">
        <div
          className="bq-hero__bg"
          style={{ backgroundImage: `url(${heroImage})` }}
          role="img"
          aria-label={quarter.name}
        />
        <div className="bq-hero__vignette" aria-hidden />
        <div className="bq-hero__frame" aria-hidden />

        <BurgasHeader marbleId="bqMarble" />

        <div className="cb-search bq-hero__search" role="search">
          <div className="cb-search__field cb-search__field--city">
            <PinFieldIcon />
            <div className="cb-search__wrap">
              <span>Град</span>
              <strong>{city.name}</strong>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--quarter">
            <PinFieldIcon />
            <div className="cb-search__wrap">
              <span>Квартал</span>
              <select
                className="cb-search__select"
                value={quarter.slug}
                aria-label="Квартал"
                onChange={e => router.push(`/cities/burgas/${e.target.value}`)}
              >
                {allQuarters.map(q => (
                  <option key={q.slug} value={q.slug}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--type">
            <BagIcon />
            <div className="cb-search__wrap">
              <span>Вид имот</span>
              <select
                value={propType}
                onChange={e => setPropType(e.target.value)}
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
          <div className="cb-search__field cb-search__field--price">
            <EuroIcon />
            <div className="cb-search__wrap">
              <span>Цена</span>
              <strong>{priceLabel}</strong>
            </div>
          </div>
          <button type="button" className="cb-search__filter" onClick={() => router.push(`/buy?city=${city.slug}&quarter=${quarter.slug}`)}>
            <FilterIcon />
            Филтри
          </button>
          <button type="button" className="cb-search__submit" onClick={runSearch}>
            <SearchIcon />
            Търси
          </button>
        </div>
      </section>

      <div className="bq-body">
        <nav className="bq-crumb" aria-label="Breadcrumb">
          <Link href="/">Начало</Link>
          <span aria-hidden>/</span>
          <Link href="/cities/burgas">Бургас</Link>
          <span aria-hidden>/</span>
          <span>{quarter.name}</span>
        </nav>

        <header className="bq-intro">
          <div className="bq-intro__text">
            <p className="bq-intro__eyebrow">ЗА КВАРТАЛА</p>
            <h1 className="bq-intro__title">кв. {quarter.name}</h1>
            <p className="bq-intro__desc">{description}</p>
          </div>
          <ul className="bq-intro__stats">
            <li>
              <PeopleIcon />
              <span>{populationLabel}</span>
            </li>
            <li>
              <GridIcon />
              <span>{areaLabelStat}</span>
            </li>
            <li>
              <BuildingIcon />
              <span>{listingsLabel}</span>
            </li>
            <li>
              <PinLineIcon />
              <span>{city.name}</span>
            </li>
          </ul>
        </header>

        <div className="bq-main">
          <aside className="bq-sidebar" aria-label="Бързи филтри">
            <p className="bq-sidebar__title">Филтри</p>
            <ul className="bq-sidebar__list">
              {QUICK_FILTERS.map(f => (
                <li key={f.id}>
                  <button
                    type="button"
                    className={`bq-sidebar__btn${quickFilter === f.id ? ' is-active' : ''}`}
                    onClick={() => setQuickFilter(f.id)}
                  >
                    {f.label}
                  </button>
                </li>
              ))}
            </ul>
            <Link href={`/buy?city=${city.slug}&quarter=${quarter.slug}`} className="bq-sidebar__all">
              Разширено търсене →
            </Link>
          </aside>

          <div className="bq-content">
            <div className="bq-content__head">
              <h2 className="bq-content__title">Имоти в кв. {quarter.name}</h2>
              <p className="bq-content__count">
                Намерени: <strong>{filtered.length}</strong> от {total}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bq-empty">
                <p>Все още няма обяви в кв. {quarter.name}.</p>
                <Link href="/buy?city=burgas">Виж всички в Бургас</Link>
              </div>
            ) : (
              <div className="bq-grid">
                {filtered.map((p, i) => (
                  <BurgasListingCard key={p.id} property={p} index={i} />
                ))}
              </div>
            )}
          </div>

          <aside className="bq-map" aria-label="Карта на квартала">
            <div className="bq-map__panel">
              <p className="bq-map__label">Локация</p>
              <h3 className="bq-map__name">кв. {quarter.name}</h3>
              <div className="bq-map__embed">
                <iframe
                  title={`Карта — ${quarter.name}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=27.42%2C42.48%2C27.52%2C42.52&layer=mapnik&marker=42.5%2C27.47`}
                  loading="lazy"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
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
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function PinLineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" />
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
