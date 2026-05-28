'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import type { CitySlug } from '@/lib/design/city-panoramas'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface LuxurySearchStripProps {
  cities: City[]
  initialCity?: string
  initialQuarters?: Quarter[]
  variant?: 'marble' | 'burgundy'
  compact?: boolean
}

const PRICE_MAX = 2_000_000

export default function LuxurySearchStrip({
  cities,
  initialCity = '',
  initialQuarters = [],
  variant = 'marble',
  compact = false,
}: LuxurySearchStripProps) {
  const router = useRouter()
  const { setCitySlug } = useCitySelection()

  const [city, setCity] = useState(initialCity)
  const [quarter, setQuarter] = useState('')
  const [quarters, setQuarters] = useState<Quarter[]>(initialQuarters)
  const [propType, setPropType] = useState('')
  const [priceMax, setPriceMax] = useState(PRICE_MAX)

  const wrapClass = variant === 'burgundy' ? 'lux-filter-bar' : 'lux-search-strip'

  const handleCityChange = useCallback(
    async (slug: string) => {
      setCity(slug)
      setQuarter('')
      if (slug && cities.some(c => c.slug === slug)) {
        setCitySlug(slug as CitySlug)
      }
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
    },
    [cities, setCitySlug]
  )

  function handleSearch() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (quarter) params.set('quarter', quarter)
    if (propType) params.set('type', propType)
    if (priceMax < PRICE_MAX) params.set('price_max', String(priceMax))
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <div className={wrapClass} style={{ maxWidth: compact ? 900 : 960, width: '100%' }}>
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${compact ? 'mb-3' : 'mb-4'}`}>
        <div>
          <label className="lux-field-label">Град</label>
          <select value={city} onChange={e => handleCityChange(e.target.value)}>
            <option value="">Всички градове</option>
            {cities.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lux-field-label">Квартал</label>
          <select value={quarter} onChange={e => setQuarter(e.target.value)} disabled={!city}>
            <option value="">Квартал</option>
            {quarters.map(q => (
              <option key={q.slug} value={q.slug}>{q.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lux-field-label">Тип имот</label>
          <select value={propType} onChange={e => setPropType(e.target.value)}>
            <option value="">Всички типове</option>
            {PROPERTY_TYPES_BG.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lux-field-label">Макс. цена</label>
          <select
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
          >
            <option value={PRICE_MAX}>Без лимит</option>
            <option value={100000}>до €100 000</option>
            <option value={200000}>до €200 000</option>
            <option value={350000}>до €350 000</option>
            <option value={500000}>до €500 000</option>
            <option value={1000000}>до €1 000 000</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        {variant === 'burgundy' && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--lux-gold)' }}>
            <FilterIcon />
            <span className="font-semibold tracking-wide uppercase text-xs">Филтри</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSearch}
          className={variant === 'burgundy' ? 'lux-btn-gold lux-shimmer' : 'lux-btn-burgundy lux-shimmer'}
          style={{ marginLeft: 'auto' }}
        >
          Търси имоти
        </button>
      </div>
    </div>
  )
}

function FilterIcon() {
  return (
    <svg className="lux-filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  )
}
