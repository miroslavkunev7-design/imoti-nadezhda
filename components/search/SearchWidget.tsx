'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG, EXTRA_FILTERS_BG } from '@/lib/data/fallback'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'

interface SearchWidgetProps {
  cities: City[]
  initialCity?: string
  initialQuarter?: string
  initialQuarters?: Quarter[]
  compact?: boolean
  variant?: 'marble' | 'burgundy'
}

const BATHROOMS = ['1', '2', '3', '4', '4+']
const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

export default function SearchWidget({
  cities,
  initialCity = '',
  initialQuarter = '',
  initialQuarters = [],
  compact = false,
  variant = 'burgundy',
}: SearchWidgetProps) {
  const router = useRouter()
  const { setCitySlug } = useCitySelection()

  const [city, setCity] = useState(initialCity)
  const [quarter, setQuarter] = useState(initialQuarter)
  const [quarters, setQuarters] = useState<Quarter[]>(initialQuarters)
  const [propType, setPropType] = useState('')
  const [detailedType, setDetailedType] = useState('')
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const isMarble = variant === 'marble'
  const panelClass = isMarble ? 'marble-search-strip' : 'burgundy-filter-panel'
  const inputClass = isMarble ? 'input-luxury text-sm' : 'input-luxury text-sm'
  const labelStyle = isMarble ? { color: '#7A0D28' } : undefined

  const selectedCity = cities.find(c => c.slug === city)

  const handleCityChange = useCallback(async (slug: string) => {
    setCity(slug)
    setQuarter('')
    if (slug) setCitySlug(slug)
    if (!slug) { setQuarters([]); return }
    try {
      const res = await fetch(`/api/cities/${slug}`)
      const json = await res.json()
      if (json.success) setQuarters(json.data.quarters ?? [])
    } catch { setQuarters([]) }
  }, [setCitySlug])

  const toggleFeature = useCallback((key: string) => {
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }, [])

  function formatPriceVal(val: number) {
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

  const p = compact ? '16px 20px 14px' : '20px 22px 18px'

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`${panelClass} w-full`}
      style={{ maxWidth: isMarble ? 900 : 860, padding: p }}
    >
      <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? 'gap-2 mb-3' : 'gap-3 mb-4'}`}>
        <div className="flex flex-col gap-1.5">
          <label className="filter-label" style={labelStyle}>Град</label>
          <select
            value={city}
            onChange={e => handleCityChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Всички градове</option>
            {cities.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="filter-label" style={labelStyle}>Квартал</label>
          <select
            value={quarter}
            onChange={e => setQuarter(e.target.value)}
            className={inputClass}
            disabled={!selectedCity}
          >
            <option value="">Квартал</option>
            {quarters.map(q => (
              <option key={q.slug} value={q.slug}>{q.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="filter-label" style={labelStyle}>Тип имот</label>
          <select
            value={propType}
            onChange={e => setPropType(e.target.value)}
            className={inputClass}
          >
            <option value="">Всички типове</option>
            {PROPERTY_TYPES_BG.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="filter-label" style={labelStyle}>Детайлен тип</label>
            <select
              value={detailedType}
              onChange={e => setDetailedType(e.target.value)}
              className={inputClass}
            >
              <option value="">Въведете тип</option>
              <option value="ново строителство">Ново строителство</option>
              <option value="тухла">Тухла</option>
              <option value="панел">Панел</option>
              <option value="епк">ЕПК</option>
              <option value="монолит">Монолит</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="filter-label" style={labelStyle}>Бани</label>
            <div className="flex gap-1">
              {BATHROOMS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBathrooms(prev => prev === b ? '' : b)}
                  className={`bath-btn${bathrooms === b ? ' active' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={compact ? 'mb-3' : 'mb-4'}>
        <div className="flex items-center justify-between mb-2">
          <label className="filter-label" style={labelStyle}>Цена</label>
          <span
            className="text-xs font-medium"
            style={{ color: isMarble ? '#6B001C' : '#CFA54A' }}
          >
            €{(PRICE_MIN / 1000).toFixed(0)}к — {formatPriceVal(priceMax)}
          </span>
        </div>
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10_000}
          value={priceMax}
          onChange={e => setPriceMax(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #CFA54A 0%, #CFA54A ${((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%, rgba(207,165,74,0.25) ${((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%, rgba(207,165,74,0.25) 100%)`,
          }}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <span className="filter-label whitespace-nowrap" style={labelStyle}>Филтри</span>
          {EXTRA_FILTERS_BG.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer group">
              <span
                className={[
                  'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  features.includes(key)
                    ? 'border'
                    : 'border group-hover:border-[#CFA54A]',
                ].join(' ')}
                style={{
                  background: features.includes(key) ? '#CFA54A' : 'transparent',
                  borderColor: features.includes(key) ? '#CFA54A' : isMarble ? 'rgba(107,0,28,0.25)' : 'rgba(207,165,74,0.4)',
                }}
                onClick={() => toggleFeature(key)}
              >
                {features.includes(key) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B001C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span
                className="text-xs whitespace-nowrap transition-colors"
                style={{ color: isMarble ? '#7A0D28' : 'rgba(250,247,242,0.85)' }}
              >
                {label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span
            className="text-xs"
            style={{ color: isMarble ? '#7A0D28' : 'rgba(250,247,242,0.7)' }}
          >
            Още филтри
          </span>
          <button
            type="button"
            onClick={() => setMoreFilters(v => !v)}
            className={`toggle-switch ${moreFilters ? 'on' : 'off'}`}
            aria-checked={moreFilters}
            role="switch"
          >
            <span className={`toggle-knob ${moreFilters ? 'on' : 'off'}`} />
          </button>
        </div>

        <button onClick={handleSearch} className="btn-gold flex-shrink-0 px-8 py-3 text-sm uppercase tracking-wider">
          Търси
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      </div>

      {moreFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 pt-4 divider-themed grid grid-cols-3 gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="filter-label" style={labelStyle}>Площ от (м²)</label>
            <input type="number" placeholder="напр. 50" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="filter-label" style={labelStyle}>Площ до (м²)</label>
            <input type="number" placeholder="напр. 200" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="filter-label" style={labelStyle}>Спални</label>
            <div className="flex gap-1">
              {['1', '2', '3', '4+'].map(b => (
                <button key={b} type="button" className="bath-btn">{b}</button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
