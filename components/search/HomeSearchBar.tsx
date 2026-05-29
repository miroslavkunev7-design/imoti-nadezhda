'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const PRICE_MIN = 30_000
const PRICE_MAX = 2_000_000

interface Props {
  cities: City[]
  citySlug: string
  onCityChange?: (slug: string) => void
}

export default function HomeSearchBar({ cities, citySlug, onCityChange }: Props) {
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
  const [showFilters, setShowFilters] = useState(false)

  const loadQuarters = useCallback(async (slug: string) => {
    setQuarter('')
    if (!slug) { setQuarters([]); return }
    try {
      const res = await fetch(`/api/cities/${slug}`)
      const json = await res.json()
      if (json.success) setQuarters(json.data.quarters ?? [])
    } catch { setQuarters([]) }
  }, [])

  useEffect(() => { loadQuarters(citySlug) }, [citySlug, loadQuarters])

  const toggleFeature = useCallback((k: string) => {
    setFeatures(p => p.includes(k) ? p.filter(f => f !== k) : [...p, k])
  }, [])

  function formatPrice(v: number) {
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)} млн.+`
    return `€${(v / 1000).toFixed(0)}к`
  }

  function handleSearch() {
    const p = new URLSearchParams()
    if (citySlug) p.set('city', citySlug)
    if (quarter) p.set('quarter', quarter)
    if (propType) p.set('type', propType)
    if (detailedType) p.set('detailed_type', detailedType)
    if (priceMax < PRICE_MAX) p.set('price_max', String(priceMax))
    if (areaMin > 30) p.set('area_min', String(areaMin))
    if (areaMax < 500) p.set('area_max', String(areaMax))
    if (bathrooms) p.set('bathrooms', bathrooms.replace('+', ''))
    if (features.length) p.set('features', features.join(','))
    router.push(`/buy?${p.toString()}`)
  }

  const cityName = cities.find(c => c.slug === citySlug)?.name ?? citySlug

  return (
    <div className="relative">
      <div className="rd-search">
        <div className="rd-search__segs">
          {/* Град */}
          <div className="rd-search__seg" style={{ borderRight: '1px solid rgba(207,165,74,0.28)' }}>
            <span className="rd-search__icon"><PinIcon /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="rd-search__label">Град</span>
              <select
                value={citySlug}
                onChange={e => { onCityChange?.(e.target.value); loadQuarters(e.target.value) }}
                className="rd-search__val"
                aria-label="Град"
              >
                {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Квартал */}
          <div className="rd-search__seg" style={{ borderRight: '1px solid rgba(207,165,74,0.28)' }}>
            <span className="rd-search__icon"><MapIcon /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="rd-search__label">Квартал</span>
              <select
                value={quarter}
                onChange={e => setQuarter(e.target.value)}
                className="rd-search__val"
                disabled={!citySlug}
                aria-label="Квартал"
              >
                <option value="">Всички</option>
                {quarters.map(q => <option key={q.slug} value={q.slug}>{q.name}</option>)}
              </select>
            </div>
          </div>

          {/* Вид имот */}
          <div className="rd-search__seg" style={{ borderRight: '1px solid rgba(207,165,74,0.28)' }}>
            <span className="rd-search__icon"><HomeIcon /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="rd-search__label">Вид имот</span>
              <select
                value={propType}
                onChange={e => setPropType(e.target.value)}
                className="rd-search__val"
                aria-label="Вид имот"
              >
                <option value="">Всички</option>
                {PROPERTY_TYPES_BG.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Цена */}
          <button type="button" className="rd-search__seg" onClick={() => setShowFilters(true)}
            style={{ background: 'transparent', borderRight: '1px solid rgba(207,165,74,0.28)', cursor: 'pointer', textAlign: 'left', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: 'none' }}>
            <span className="rd-search__icon"><EuroIcon /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="rd-search__label">Цена</span>
              <span className="rd-search__val">до {formatPrice(priceMax)}</span>
            </div>
          </button>

          {/* Площ */}
          <button type="button" className="rd-search__seg" onClick={() => setShowFilters(true)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px' }}>
            <span className="rd-search__icon"><AreaIcon /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="rd-search__label">Площ</span>
              <span className="rd-search__val">от {areaMin} m²</span>
            </div>
          </button>
        </div>

        <div className="rd-search__btns">
          <button type="button" className="rd-search__filter-btn" onClick={() => setShowFilters(v => !v)}>
            <FilterIcon /> Филтри
          </button>
          <button type="button" className="rd-search__submit" onClick={handleSearch}>
            <SearchIcon /> Търси
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="rd-search-exp">
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(107,0,28,0.45)', marginBottom: 4 }}>Площ от (m²)</label>
              <input type="number" value={areaMin} onChange={e => setAreaMin(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1.5px solid rgba(107,0,28,0.18)', fontSize: 13, color: '#6B001C', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(107,0,28,0.45)', marginBottom: 4 }}>Площ до (m²)</label>
              <input type="number" value={areaMax} onChange={e => setAreaMax(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1.5px solid rgba(107,0,28,0.18)', fontSize: 13, color: '#6B001C', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PinIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> }
function MapIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function HomeIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> }
function EuroIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12M4 14h9M20 6a8 8 0 100 12"/></svg> }
function AreaIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></svg> }
function FilterIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg> }
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg> }
