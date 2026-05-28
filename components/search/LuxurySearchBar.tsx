'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'
import { isCitySlug } from '@/lib/design/brand'

interface LuxurySearchBarProps {
  cities: City[]
  initialCity?: string
  initialQuarters?: Quarter[]
  variant?: 'marble' | 'burgundy'
  className?: string
}

export default function LuxurySearchBar({
  cities,
  initialCity = '',
  initialQuarters = [],
  variant = 'marble',
  className = '',
}: LuxurySearchBarProps) {
  const router = useRouter()
  const { setSelectedCity } = useCitySelection()
  const [city, setCity] = useState(initialCity)
  const [quarter, setQuarter] = useState('')
  const [quarters, setQuarters] = useState<Quarter[]>(initialQuarters)
  const [propType, setPropType] = useState('')

  const handleCityChange = useCallback(
    async (slug: string) => {
      setCity(slug)
      setQuarter('')
      if (slug && isCitySlug(slug)) setSelectedCity(slug)
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
    [setSelectedCity],
  )

  function handleSearch() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (quarter) params.set('quarter', quarter)
    if (propType) params.set('type', propType)
    router.push(`/buy?${params.toString()}`)
  }

  const stripClass = variant === 'burgundy' ? 'lux-filter-bar' : 'lux-search-strip'

  return (
    <div className={`${stripClass} w-full max-w-[900px] mx-auto ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div>
          <label>Град</label>
          <select value={city} onChange={e => handleCityChange(e.target.value)}>
            <option value="">Всички</option>
            {cities.map(c => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Квартал</label>
          <select
            value={quarter}
            onChange={e => setQuarter(e.target.value)}
            disabled={!city}
          >
            <option value="">Всички</option>
            {quarters.map(q => (
              <option key={q.slug} value={q.slug}>
                {q.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Тип имот</label>
          <select value={propType} onChange={e => setPropType(e.target.value)}>
            <option value="">Всички</option>
            {PROPERTY_TYPES_BG.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            className={variant === 'burgundy' ? 'lux-btn-gold w-full' : 'lux-btn-burgundy w-full'}
            onClick={handleSearch}
          >
            Търси
          </button>
        </div>
      </div>
    </div>
  )
}
