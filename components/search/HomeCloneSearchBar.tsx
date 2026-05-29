'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000
const AREA_MIN = 30
const AREA_MAX = 500

interface Props {
  cities: City[]
  citySlug: string
  onCityChange?: (slug: string) => void
}

export default function HomeCloneSearchBar({ cities, citySlug, onCityChange }: Props) {
  const router = useRouter()
  const [quarter, setQuarter] = useState('')
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [propType, setPropType] = useState('')
  const [detailedType, setDetailedType] = useState('')
  const [priceMax, setPriceMax] = useState(500_000)
  const [areaMin, setAreaMin] = useState(100)
  const [areaMax, setAreaMax] = useState(200)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const loadQuarters = useCallback(async (slug: string) => {
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

  useEffect(() => {
    loadQuarters(citySlug)
  }, [citySlug, loadQuarters])

  const handleCityChange = useCallback(
    async (slug: string) => {
      onCityChange?.(slug)
      await loadQuarters(slug)
    },
    [onCityChange, loadQuarters]
  )

  const toggleFeature = useCallback((key: string) => {
    setFeatures(prev => (prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]))
  }, [])

  function formatPriceRange() {
    const lo = PRICE_MIN
    const hi = priceMax >= PRICE_MAX ? PRICE_MAX : priceMax
    return `от ${lo.toLocaleString('bg-BG')} € до ${hi.toLocaleString('bg-BG')} €`
  }

  function formatAreaRange() {
    return `от ${areaMin} m² до ${areaMax} m²`
  }

  function formatPrice(val: number) {
    if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(1)} млн.+`
    return `€${(val / 1000).toFixed(0)}к`
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (citySlug) params.set('city', citySlug)
    if (quarter) params.set('quarter', quarter)
    if (propType) params.set('type', propType)
    if (detailedType) params.set('detailed_type', detailedType)
    if (priceMax < PRICE_MAX) params.set('price_max', String(priceMax))
    if (areaMin > AREA_MIN) params.set('area_min', String(areaMin))
    if (areaMax < AREA_MAX) params.set('area_max', String(areaMax))
    if (bathrooms) params.set('bathrooms', bathrooms.replace('+', ''))
    if (features.length) params.set('features', features.join(','))
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <div className="relative">
      <div className="hc-search">
        <div className="hc-search__segments">
          <div className="hc-search__seg">
            <span className="hc-search__icon"><PinIcon /></span>
            <div className="hc-search__meta">
              <span className="hc-search__label">Град</span>
              <select
                value={citySlug}
                onChange={e => handleCityChange(e.target.value)}
                className="hc-search__select"
                aria-label="Град"
              >
                {cities.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hc-search__seg">
            <span className="hc-search__icon"><MapIcon /></span>
            <div className="hc-search__meta">
              <span className="hc-search__label">Квартал</span>
              <select
                value={quarter}
                onChange={e => setQuarter(e.target.value)}
                className="hc-search__select"
                disabled={!citySlug}
                aria-label="Квартал"
              >
                <option value="">Квартал</option>
                {quarters.map(q => (
                  <option key={q.slug} value={q.slug}>
                    {q.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hc-search__seg">
            <span className="hc-search__icon"><BagIcon /></span>
            <div className="hc-search__meta">
              <span className="hc-search__label">Вид имот</span>
              <select
                value={propType}
                onChange={e => setPropType(e.target.value)}
                className="hc-search__select"
                aria-label="Вид имот"
              >
                <option value="">Вид имот</option>
                {PROPERTY_TYPES_BG.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" className="hc-search__seg hc-search__field-btn" onClick={() => setMoreFilters(true)}>
            <span className="hc-search__icon"><WalletIcon /></span>
            <div className="hc-search__meta">
              <span className="hc-search__label">Цена</span>
              <span className="hc-search__value">{formatPriceRange()}</span>
            </div>
          </button>

          <button type="button" className="hc-search__seg hc-search__field-btn" onClick={() => setMoreFilters(true)}>
            <span className="hc-search__icon"><AreaIcon /></span>
            <div className="hc-search__meta">
              <span className="hc-search__label">Площ</span>
              <span className="hc-search__value">{formatAreaRange()}</span>
            </div>
          </button>
        </div>

        <button type="button" className="hc-search__filters" onClick={() => setMoreFilters(v => !v)} aria-expanded={moreFilters}>
          <FilterIcon />
          Филтри
        </button>
        <button type="button" className="hc-search__submit" onClick={handleSearch}>
          <SearchIcon />
          Търси
        </button>
      </div>

      {moreFilters && (
        <div className="hc-search-expanded search-panel">
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
            toggleFeature={toggleFeature}
            priceMin={PRICE_MIN}
            priceMaxLimit={PRICE_MAX}
            formatPrice={formatPrice}
            showTypeChips
          />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="filter-label block mb-1">Площ от (m²)</label>
              <input
                type="number"
                value={areaMin}
                onChange={e => setAreaMin(Number(e.target.value))}
                className="input-dark text-sm w-full"
              />
            </div>
            <div>
              <label className="filter-label block mb-1">Площ до (m²)</label>
              <input
                type="number"
                value={areaMax}
                onChange={e => setAreaMax(Number(e.target.value))}
                className="input-dark text-sm w-full"
              />
            </div>
          </div>
        </div>
      )}
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

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
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
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  )
}
