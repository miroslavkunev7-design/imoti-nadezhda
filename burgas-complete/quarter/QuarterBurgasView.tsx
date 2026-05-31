'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Property, Quarter } from '@/types'
import { burgasQuarterHeroImage, burgasQuarterMapEmbedUrl } from '@/lib/data/burgas-quarter-meta'
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import { BurgasSearchBar } from '@/burgas-complete/shared/BurgasSearchBar'
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
  const heroImage = burgasQuarterHeroImage(quarter.slug, quarter.image_url)
  const mapEmbedUrl = burgasQuarterMapEmbedUrl(quarter.slug)

  const [propType, setPropType] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  const filtered = useMemo(() => {
    let list = [...properties]
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
    if (sort === 'price_asc') {
      list.sort((a, b) => a.price_eur - b.price_eur)
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price_eur - a.price_eur)
    }
    return list
  }, [properties, quickFilter, propType, sort])

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
        <div className="burgas-gold-frame" aria-hidden />

        <BurgasHeader marbleId="bqMarble" />

        <div className="bq-hero__quarter-switch">
          <label className="bq-hero__quarter-label" htmlFor="bq-quarter-select">
            Квартал
          </label>
          <select
            id="bq-quarter-select"
            className="bq-hero__quarter-select"
            value={quarter.slug}
            aria-label="Избери квартал"
            onChange={e => router.push(`/cities/burgas/${e.target.value}`)}
          >
            {allQuarters.map(q => (
              <option key={q.slug} value={q.slug}>
                {q.name}
              </option>
            ))}
          </select>
        </div>

        <BurgasSearchBar
          variant="quarter"
          citySlug={city.slug}
          cityName={city.name}
          quarterSlug={quarter.slug}
          className="bq-hero__search"
          propType={propType}
          onPropTypeChange={setPropType}
          onSearch={runSearch}
        />
      </section>

      <div className="burgas-marble-shell bq-body">
        <nav className="bq-crumb" aria-label="Breadcrumb">
          <Link href="/">Начало</Link>
          <span aria-hidden>/</span>
          <Link href="/cities/burgas">Бургас</Link>
          <span aria-hidden>/</span>
          <span>{quarter.name}</span>
        </nav>

        <header className="bq-intro">
          <div className="bq-intro__text">
            <p className="burgas-about-card__eyebrow">ЗА КВАРТАЛА</p>
            <h1 className="bq-intro__title">кв. {quarter.name}</h1>
            <p className="bq-intro__desc">{description}</p>
          </div>
          <ul className="bq-intro__stats burgas-about-card">
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
              <div className="bq-content__tools">
                <p className="bq-content__count">
                  Намерени: <strong>{filtered.length}</strong> от {total}
                </p>
                <label className="bq-sort">
                  <span>Подреди</span>
                  <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} aria-label="Подредба">
                    <option value="newest">Най-нови</option>
                    <option value="price_asc">Цена ↑</option>
                    <option value="price_desc">Цена ↓</option>
                  </select>
                </label>
              </div>
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
                  src={mapEmbedUrl}
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
