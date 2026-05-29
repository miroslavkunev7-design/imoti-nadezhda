'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG, EXTRA_FILTERS_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const BATHROOMS = ['1', '2', '3', '4', '4+']
const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

interface Props {
  cities: City[]
  initialCity?: string
  initialQuarter?: string
  initialQuarters?: Quarter[]
  homeLayout?: boolean
  marbleSearch?: boolean
  onCityChange?: (slug: string) => void
}

export default function LuxurySearchBar({
  cities,
  initialCity = '',
  initialQuarter = '',
  initialQuarters = [],
  homeLayout = false,
  marbleSearch = false,
  onCityChange,
}: Props) {
  const router = useRouter()
  const [city, setCity] = useState(initialCity)
  const [quarter, setQuarter] = useState(initialQuarter)
  const [quarters, setQuarters] = useState<Quarter[]>(initialQuarters)
  const [propType, setPropType] = useState('')
  const [detailedType, setDetailedType] = useState('')
  const [priceMin, setPriceMin] = useState(PRICE_MIN)
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [areaMin, setAreaMin] = useState(0)
  const [areaMax, setAreaMax] = useState(0)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)

  const selectedCity = cities.find(c => c.slug === city)

  const handleCityChange = useCallback(async (slug: string) => {
    setCity(slug)
    setQuarter('')
    onCityChange?.(slug)
    if (!slug) { setQuarters([]); return }
    try {
      const res = await fetch(`/api/cities/${slug}`)
      const json = await res.json()
      if (json.success) setQuarters(json.data.quarters ?? [])
    } catch { setQuarters([]) }
  }, [onCityChange])

  const toggleFeature = useCallback((key: string) => {
    setFeatures(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    )
  }, [])

  function fmt(val: number, prefix = '€') {
    if (!val || val <= 0) return '—'
    if (val >= 1_000_000) return `${prefix}${(val / 1_000_000).toFixed(1)} млн.`
    if (val >= 1000) return `${prefix}${(val / 1000).toFixed(0)}к`
    return `${prefix}${val}`
  }

  function priceLabel() {
    const lo = priceMin > PRICE_MIN ? fmt(priceMin) : `от ${fmt(PRICE_MIN)}`
    const hi = priceMax < PRICE_MAX ? fmt(priceMax) : `до ${fmt(PRICE_MAX)}`
    return `${lo} — ${hi}`
  }

  function areaLabel() {
    if (!areaMin && !areaMax) return 'Площ'
    const lo = areaMin ? `от ${areaMin} м²` : ''
    const hi = areaMax ? `до ${areaMax} м²` : ''
    return [lo, hi].filter(Boolean).join(' ')
  }

  function handleSearch() {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (quarter) params.set('quarter', quarter)
    if (propType) params.set('type', propType)
    if (detailedType) params.set('detailed_type', detailedType)
    if (priceMin > PRICE_MIN) params.set('price_min', String(priceMin))
    if (priceMax < PRICE_MAX) params.set('price_max', String(priceMax))
    if (areaMin) params.set('area_min', String(areaMin))
    if (areaMax) params.set('area_max', String(areaMax))
    if (bathrooms) params.set('bathrooms', bathrooms.replace('+', ''))
    if (features.length) params.set('features', features.join(','))
    router.push(`/buy?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`luxury-search-wrap w-full${homeLayout ? ' luxury-search-wrap--home' : ''}`}
    >
      <div
        className={`luxury-search-bar${homeLayout ? ' luxury-search-bar--home' : ''}${marbleSearch ? ' luxury-search-bar--marble marble-dispersion marble-dispersion--subtle' : ''}`}
      >
        <div className="luxury-search-bar__segments">
          <Segment icon={<PinIcon />} label="Град">
            <select
              value={city}
              onChange={e => handleCityChange(e.target.value)}
              className="luxury-search-select"
              aria-label="Град"
            >
              <option value="">Всички градове</option>
              {cities.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </Segment>
          <span className="luxury-search-vrule" aria-hidden />
          <Segment icon={<MapIcon />} label="Квартал">
            <select
              value={quarter}
              onChange={e => setQuarter(e.target.value)}
              className="luxury-search-select"
              disabled={!selectedCity}
              aria-label="Квартал"
            >
              <option value="">Квартал</option>
              {quarters.map(q => (
                <option key={q.slug} value={q.slug}>{q.name}</option>
              ))}
            </select>
          </Segment>
          <span className="luxury-search-vrule" aria-hidden />
          <Segment icon={<HomeIcon />} label="Вид имот">
            <select
              value={propType}
              onChange={e => setPropType(e.target.value)}
              className="luxury-search-select"
              aria-label="Вид имот"
            >
              <option value="">Всички</option>
              {PROPERTY_TYPES_BG.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Segment>
          <span className="luxury-search-vrule" aria-hidden />
          <Segment icon={<WalletIcon />} label="Цена">
            <span className="luxury-search-value">{priceLabel()}</span>
          </Segment>
          <span className="luxury-search-vrule" aria-hidden />
          <Segment icon={<AreaIcon />} label="Площ">
            <span className="luxury-search-value">{areaLabel()}</span>
          </Segment>
        </div>
        <button
          type="button"
          onClick={() => setMoreFilters(v => !v)}
          className="luxury-search-filters-btn"
          aria-expanded={moreFilters}
        >
          <FilterIcon />
          Филтри
        </button>
        <button type="button" onClick={handleSearch} className="luxury-search-submit">
          <SearchIcon />
          Търси
        </button>
      </div>

      {moreFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="luxury-search-expanded mt-0"
          style={{ padding: '16px 20px' }}
        >
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
            formatPrice={(v) => fmt(v)}
            showTypeChips
            areaMin={areaMin}
            setAreaMin={setAreaMin}
            areaMax={areaMax}
            setAreaMax={setAreaMax}
            priceMinVal={priceMin}
            setPriceMinVal={setPriceMin}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

function Segment({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="luxury-search-segment">
      <span className="luxury-search-segment__icon">{icon}</span>
      <div className="luxury-search-segment__body">
        <span className="luxury-search-segment__label">{label}</span>
        <div className="luxury-search-segment__control">{children}</div>
      </div>
    </div>
  )
}

function PinIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
}
function MapIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /></svg>
}
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
}
function WalletIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
}
function FilterIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>
}
function AreaIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 7h4M7 7v4M17 17h-4M17 17v-4"/></svg>
}
