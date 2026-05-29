'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

interface Props {
  cities: City[]
  initialCity: string
  initialQuarters: Quarter[]
}

export default function CityHeroSearchCard({ cities, initialCity, initialQuarters }: Props) {
  const router = useRouter()
  const [city, setCity] = useState(initialCity)
  const [quarter, setQuarter] = useState('')
  const [quarters, setQuarters] = useState<Quarter[]>(initialQuarters)
  const [propType, setPropType] = useState('')
  const [detailedType, setDetailedType] = useState('')
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const selectedCity = cities.find(c => c.slug === city)

  const handleCityChange = useCallback(async (slug: string) => {
    setCity(slug)
    setQuarter('')
    if (!slug) {
      setQuarters([])
      return
    }
    try {
      const res = await fetch(`/api/cities/${slug}`)
      const json = await res.json()
      if (json.success) setQuarters(json.data.quarters ?? [])
    } catch {
      setQuarters([])
    }
  }, [])

  function formatPrice(val: number) {
    if (val >= PRICE_MAX || val <= PRICE_MIN) return 'Без значение'
    if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(1)} млн.+`
    return `€${(val / 1000).toFixed(0)}к`
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (quarter) params.set('quarter', quarter)
    if (propType) params.set('type', propType)
    if (detailedType) params.set('detailed_type', detailedType)
    if (priceMax < PRICE_MAX) params.set('price_max', String(priceMax))
    if (bathrooms) params.set('bathrooms', bathrooms.replace('+', ''))
    if (features.length) params.set('features', features.join(','))
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <div className="city-hero-search-card">
      <Row icon={<PinIcon />} label="Град">
        <select
          value={city}
          onChange={e => handleCityChange(e.target.value)}
          className="city-hero-search-card__select"
          aria-label="Град"
        >
          {cities.map(c => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Row>
      <Row icon={<HomeIcon />} label="Вид имот">
        <select
          value={propType}
          onChange={e => setPropType(e.target.value)}
          className="city-hero-search-card__select"
          aria-label="Вид имот"
        >
          <option value="">Всички</option>
          {PROPERTY_TYPES_BG.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Row>
      <Row icon={<WalletIcon />} label="Цена">
        <span className="city-hero-search-card__value">{formatPrice(priceMax)}</span>
      </Row>
      <Row icon={<AreaIcon />} label="Площ">
        <span className="city-hero-search-card__value">Без значение</span>
      </Row>
      <button
        type="button"
        className="city-hero-search-card__filters-btn"
        onClick={() => setMoreFilters(v => !v)}
        aria-expanded={moreFilters}
      >
        <FilterIcon />
        Филтри
      </button>
      {moreFilters && (
        <div className="city-hero-search-card__expanded">
          <SearchFiltersExpanded
            detailedType={detailedType}
            setDetailedType={setDetailedType}
            bathrooms={bathrooms}
            setBathrooms={setBathrooms}
            propType={propType}
            setPropType={setPropType}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            features={features}
            toggleFeature={key =>
              setFeatures(prev =>
                prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
              )
            }
            priceMin={PRICE_MIN}
            priceMaxLimit={PRICE_MAX}
            formatPrice={formatPrice}
            showTypeChips
          />
          <button type="button" className="city-hero-search-card__search-btn" onClick={handleSearch}>
            Търси имоти
          </button>
        </div>
      )}
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="city-hero-search-card__row">
      <span className="city-hero-search-card__icon">{icon}</span>
      <div className="city-hero-search-card__row-body">
        <span className="city-hero-search-card__label">{label}</span>
        <div className="city-hero-search-card__control">{children}</div>
      </div>
    </div>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}
function WalletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}
function AreaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  )
}
