'use client'

import { useRouter } from 'next/navigation'
import type { Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'

type Variant = 'city' | 'quarter' | 'property'

interface Props {
  variant: Variant
  citySlug: string
  cityName: string
  className?: string
  quarters?: Quarter[]
  quarterSlug?: string
  quarterName?: string
  onSearch?: () => void
  propType?: string
  onPropTypeChange?: (v: string) => void
  quarterValue?: string
  onQuarterChange?: (slug: string) => void
}

export function BurgasSearchBar({
  variant,
  citySlug,
  cityName,
  className = '',
  quarters = [],
  quarterSlug = '',
  quarterName = '',
  onSearch,
  propType = '',
  onPropTypeChange,
  quarterValue = '',
  onQuarterChange,
}: Props) {
  const router = useRouter()
  const priceLabel = 'Без значение'
  const areaLabel = 'Без значение'

  function handleFilters() {
    const params = new URLSearchParams({ city: citySlug })
    if (quarterSlug && variant !== 'city') params.set('quarter', quarterSlug)
    router.push(`/buy?${params.toString()}`)
  }

  function handleSubmit() {
    if (onSearch) {
      onSearch()
      return
    }
    handleFilters()
  }

  return (
    <div className={`cb-search ${className}`.trim()} role="search">
      <div className="cb-search__field cb-search__field--city">
        <PinFieldIcon />
        <div className="cb-search__wrap">
          <span>Град</span>
          <strong>{cityName}</strong>
        </div>
      </div>

      {variant === 'city' && (
        <div className="cb-search__field cb-search__field--quarter">
          <PinFieldIcon />
          <div className="cb-search__wrap">
            <span>Квартал</span>
            <select
              className="cb-search__select"
              value={quarterValue}
              aria-label="Квартал"
              onChange={e => onQuarterChange?.(e.target.value)}
            >
              <option value="">Всички</option>
              {quarters.map(q => (
                <option key={q.slug} value={q.slug}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {variant === 'quarter' && (
        <div className="cb-search__field cb-search__field--type">
          <BagIcon />
          <div className="cb-search__wrap">
            <span>Вид имот</span>
            <select
              className="cb-search__select"
              value={propType}
              aria-label="Вид имот"
              onChange={e => onPropTypeChange?.(e.target.value)}
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
      )}

      {(variant === 'city' || variant === 'quarter') && (
        <>
          {variant === 'city' && (
            <div className="cb-search__field cb-search__field--type">
              <BagIcon />
              <div className="cb-search__wrap">
                <span>Вид имот</span>
                <select
                  className="cb-search__select"
                  value={propType}
                  aria-label="Вид имот"
                  onChange={e => onPropTypeChange?.(e.target.value)}
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
          )}
          <div className="cb-search__field cb-search__field--price">
            <EuroIcon />
            <div className="cb-search__wrap">
              <span>Цена</span>
              <strong>{priceLabel}</strong>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--area">
            <AreaIcon />
            <div className="cb-search__wrap">
              <span>Площ</span>
              <strong>{areaLabel}</strong>
            </div>
          </div>
        </>
      )}

      {variant === 'property' && (
        <>
          <div className="cb-search__field cb-search__field--quarter">
            <PinFieldIcon />
            <div className="cb-search__wrap">
              <span>Квартал</span>
              <strong>{quarterName}</strong>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--type">
            <BagIcon />
            <div className="cb-search__wrap">
              <span>Вид имот</span>
              <select
                className="cb-search__select"
                value={propType}
                aria-label="Вид имот"
                onChange={e => onPropTypeChange?.(e.target.value)}
              >
                {PROPERTY_TYPES_BG.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <button type="button" className="cb-search__filter" onClick={handleFilters}>
        <FilterIcon />
        Филтри
      </button>
      <button type="button" className="cb-search__submit" onClick={handleSubmit}>
        <SearchIcon />
        Търси
      </button>
    </div>
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
function AreaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
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
