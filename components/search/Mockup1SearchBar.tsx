'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

interface Props {
  citySlug: string
}

export default function Mockup1SearchBar({ citySlug }: Props) {
  const router = useRouter()
  const [propType, setPropType] = useState('')
  const [detailedType, setDetailedType] = useState('')
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const toggleFeature = useCallback((key: string) => {
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }, [])

  function formatPrice(val: number) {
    if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(1)} млн.+`
    if (val <= PRICE_MIN) return 'Без лимит'
    return `до €${(val / 1000).toFixed(0)}к`
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (citySlug) params.set('city', citySlug)
    if (propType) params.set('type', propType)
    if (detailedType) params.set('detailed_type', detailedType)
    if (priceMax < PRICE_MAX) params.set('price_max', String(priceMax))
    if (bathrooms) params.set('bathrooms', bathrooms.replace('+', ''))
    if (features.length) params.set('features', features.join(','))
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <div className="relative w-full">
      <div className="m1-search">
        <div className="m1-search__cream">
          <div className="m1-search__field">
            <span className="m1-search__icon" aria-hidden>
              <HomeIcon />
            </span>
            <div className="m1-search__meta">
              <span className="m1-search__label">Вид имот</span>
              <select
                value={propType}
                onChange={e => setPropType(e.target.value)}
                className="m1-search__select"
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

          <button
            type="button"
            className="m1-search__field m1-search__field--btn"
            onClick={() => setMoreFilters(true)}
            aria-label="Настройка на цена"
          >
            <span className="m1-search__icon" aria-hidden>
              <EuroIcon />
            </span>
            <div className="m1-search__meta">
              <span className="m1-search__label">Цена</span>
              <span className="m1-search__value">{formatPrice(priceMax)}</span>
            </div>
          </button>
        </div>

        <div className="m1-search__burgundy">
          <button
            type="button"
            className="m1-search__action"
            onClick={() => setMoreFilters(v => !v)}
            aria-expanded={moreFilters}
          >
            <FilterIcon />
            Филтри
          </button>
          <button type="button" className="m1-search__action m1-search__action--submit" onClick={handleSearch}>
            <SearchIcon />
            Търси
          </button>
        </div>
      </div>

      {moreFilters && (
        <div className="m1-search-expanded search-panel">
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
        </div>
      )}
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}

function EuroIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10h12M4 14h9M20 6a8 8 0 100 12" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  )
}
