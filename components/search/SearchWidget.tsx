'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG, EXTRA_FILTERS_BG } from '@/lib/data/fallback'
import LuxurySearchBar from '@/components/search/LuxurySearchBar'

interface SearchWidgetProps {
  cities: City[]
  initialCity?: string
  initialQuarter?: string
  initialQuarters?: Quarter[]
  compact?: boolean
  /** Mockup horizontal burgundy search bar */
  luxuryBar?: boolean
  /** Homepage pill bar (mockup layout) */
  homeLayout?: boolean
  /** White marble search body + gold borders */
  marbleSearch?: boolean
  onCityChange?: (slug: string) => void
}

const BATHROOMS = ['1', '2', '3', '4', '4+']
const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

export default function SearchWidget(props: SearchWidgetProps) {
  if (props.luxuryBar) {
    return (
      <LuxurySearchBar
        cities={props.cities}
        initialCity={props.initialCity}
        initialQuarter={props.initialQuarter}
        initialQuarters={props.initialQuarters}
        homeLayout={props.homeLayout}
        marbleSearch={props.marbleSearch}
        onCityChange={props.onCityChange}
      />
    )
  }
  return <ClassicSearchPanel {...props} />
}

function ClassicSearchPanel({
  cities,
  initialCity = '',
  initialQuarter = '',
  initialQuarters = [],
  compact = false,
}: SearchWidgetProps) {
  const router = useRouter()

  const [city,        setCity]        = useState(initialCity)
  const [quarter,     setQuarter]     = useState(initialQuarter)
  const [quarters,    setQuarters]    = useState<Quarter[]>(initialQuarters)
  const [propType,    setPropType]    = useState('')
  const [detailedType,setDetailedType]= useState('')
  const [priceMax,    setPriceMax]    = useState(PRICE_MAX)
  const [bathrooms,   setBathrooms]   = useState('')
  const [features,    setFeatures]    = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const selectedCity = cities.find(c => c.slug === city)

  const handleCityChange = useCallback(async (slug: string) => {
    setCity(slug)
    setQuarter('')
    if (!slug) { setQuarters([]); return }
    try {
      const res  = await fetch(`/api/cities/${slug}`)
      const json = await res.json()
      if (json.success) setQuarters(json.data.quarters ?? [])
    } catch { setQuarters([]) }
  }, [])

  const toggleFeature = useCallback((key: string) => {
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }, [])

  function formatPrice(val: number) {
    if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(1)} млн.+`
    return `€${(val / 1000).toFixed(0)}к`
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (city)                params.set('city',          city)
    if (quarter)             params.set('quarter',       quarter)
    if (propType)            params.set('type',          propType)
    if (detailedType)        params.set('detailed_type', detailedType)
    if (priceMax < PRICE_MAX)params.set('price_max',     String(priceMax))
    if (bathrooms)           params.set('bathrooms',     bathrooms.replace('+', ''))
    if (features.length)     params.set('features',      features.join(','))
    router.push(`/buy?${params.toString()}`)
  }

  const p = compact ? '14px 18px 12px' : '20px 22px 18px'

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="search-panel w-full"
      style={{
        maxWidth: compact ? 820 : 860,
        padding: p,
      }}
    >
      {/* ── Row 1: City · Quarter · Types · Detail + Bathrooms ── */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${compact ? 'gap-2 mb-3' : 'gap-3 mb-4'}`}>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Select City</label>
          <select
            value={city}
            onChange={e => handleCityChange(e.target.value)}
            className="input-dark text-sm"
          >
            <option value="">Всички градове</option>
            {cities.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Neighborhood */}
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Select Neighborhood</label>
          <select
            value={quarter}
            onChange={e => setQuarter(e.target.value)}
            className="input-dark text-sm"
            disabled={!selectedCity}
          >
            <option value="">Квартал</option>
            {quarters.map(q => (
              <option key={q.slug} value={q.slug}>{q.name}</option>
            ))}
          </select>
        </div>

        {/* Property type list */}
        <div className="flex flex-col gap-1.5">
          <label className="filter-label">Тип имот</label>
          <div className="property-type-list-item rounded-lg overflow-hidden flex flex-col">
            {PROPERTY_TYPES_BG.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPropType(prev => prev === type ? '' : type)}
                className={`type-option${propType === type ? ' active' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed type + Bathrooms */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="filter-label">Detailed Property Type</label>
            <select
              value={detailedType}
              onChange={e => setDetailedType(e.target.value)}
              className="input-dark text-sm"
            >
              <option value="">Въведете тип имот</option>
              <option value="ново строителство">Ново строителство</option>
              <option value="тухла">Тухла</option>
              <option value="панел">Панел</option>
              <option value="епк">ЕПК</option>
              <option value="монолит">Монолит</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="filter-label">Bathrooms</label>
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

      {/* ── Price slider ── */}
      <div className={compact ? 'mb-3' : 'mb-4'}>
        <div className="flex items-center justify-between mb-2">
          <label className="filter-label">Цена</label>
          <span className="text-xs text-themed-primary font-medium">
            €{(PRICE_MIN / 1000).toFixed(0)}к — {formatPrice(priceMax)}
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
            background: `linear-gradient(to right, #A86B3D 0%, #A86B3D ${((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%, var(--border-subtle) ${((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%, var(--border-subtle) 100%)`,
          }}
        />
      </div>

      {/* ── Row 3: Extra filters + More Filters + Search ── */}
      <div className="flex items-center gap-4 flex-wrap">

        <div className="flex items-center gap-3 flex-wrap flex-1">
          <span className="filter-label whitespace-nowrap">Допълнителни филтри</span>
          {EXTRA_FILTERS_BG.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer group">
              <span
                className={[
                  'w-4 h-4 rounded flex items-center justify-center flex-shrink-0',
                  'transition-all duration-150',
                  features.includes(key)
                    ? 'bg-crimson-700 border-crimson-700 border'
                    : 'border border-themed group-hover:border-crimson-700',
                ].join(' ')}
                onClick={() => toggleFeature(key)}
              >
                {features.includes(key) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-themed-secondary group-hover:text-themed-primary transition-colors whitespace-nowrap">
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* More Filters toggle */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-themed-secondary">More Filters</span>
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

        {/* Search */}
        <button onClick={handleSearch} className="btn-crimson flex-shrink-0 px-8 py-3 text-sm">
          ТЪРСИ
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* More Filters expanded */}
      {moreFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 pt-4 divider-themed grid grid-cols-3 gap-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="filter-label">Площ от (м²)</label>
            <input type="number" placeholder="напр. 50" className="input-dark text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="filter-label">Площ до (м²)</label>
            <input type="number" placeholder="напр. 200" className="input-dark text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="filter-label">Спални</label>
            <div className="flex gap-1">
              {['1','2','3','4+'].map(b => (
                <button key={b} type="button" className="bath-btn">{b}</button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
