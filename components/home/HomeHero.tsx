'use client'

import { useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { City, Quarter } from '@/types'
import TerraceBackground from '@/components/layout/TerraceBackground'
import { setSelectedCity } from '@/lib/client/selected-city'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import SearchFiltersExpanded from '@/components/search/SearchFiltersExpanded'

const CITY_GRADIENTS: Record<string, string> = {
  shumen:       'linear-gradient(135deg,#1a0a0f 0%,#2d0f1a 50%,#0f0a1a 100%)',
  varna:        'linear-gradient(135deg,#0a1a2d 0%,#0f2040 50%,#091525 100%)',
  burgas:       'linear-gradient(135deg,#0a1820 0%,#0f2530 50%,#071015 100%)',
  'novi-pazar': 'linear-gradient(135deg,#0f1a0a 0%,#162010 50%,#0a1208 100%)',
}

const NAV = [
  { href: '/buy',             label: 'За продажба' },
  { href: '/buy?deal=rent',   label: 'Под наем'    },
  { href: '/about',           label: 'За нас'      },
]

interface Props { cities: City[] }

export default function HomeHero({ cities }: Props) {
  const router = useRouter()
  const [citySlug, setCitySlug]   = useState(cities[0]?.slug ?? 'shumen')
  const [quarter,  setQuarter]    = useState('')
  const [quarters, setQuarters]   = useState<Quarter[]>([])
  const [propType, setPropType]   = useState('')
  const [priceMin, setPriceMin]   = useState(200_000)
  const [priceMax, setPriceMax]   = useState(500_000)
  const [areaMin,  setAreaMin]    = useState(100)
  const [areaMax,  setAreaMax]    = useState(200)
  const [bathrooms, setBathrooms] = useState('')
  const [features, setFeatures]   = useState<string[]>([])
  const [showExp,  setShowExp]    = useState(false)
  const [detailedType, setDetailedType] = useState('')

  const activeCity = cities.find(c => c.slug === citySlug) ?? cities[0]

  const handleCityChange = useCallback((slug: string) => {
    if (!slug) return
    setCitySlug(slug)
    setSelectedCity(slug)
    setQuarter('')
    fetch(`/api/cities/${slug}`)
      .then(r => r.json())
      .then(j => j.success && setQuarters(j.data.quarters ?? []))
      .catch(() => {})
  }, [])

  const toggleFeature = useCallback((k: string) => {
    setFeatures(p => p.includes(k) ? p.filter(f => f !== k) : [...p, k])
  }, [])

  function fmtPrice(v: number) {
    return v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)} млн.` : `${(v/1000).toFixed(0)} 000 €`
  }

  function handleSearch() {
    const p = new URLSearchParams()
    if (citySlug) p.set('city', citySlug)
    if (quarter) p.set('quarter', quarter)
    if (propType) p.set('type', propType)
    if (priceMin > 30_000) p.set('price_min', String(priceMin))
    if (priceMax < 2_000_000) p.set('price_max', String(priceMax))
    if (areaMin > 30) p.set('area_min', String(areaMin))
    if (areaMax < 500) p.set('area_max', String(areaMax))
    if (bathrooms) p.set('bathrooms', bathrooms.replace('+',''))
    if (features.length) p.set('features', features.join(','))
    router.push(`/buy?${p.toString()}`)
  }

  return (
    <div className="hp">
      {/* Background panorama */}
      <TerraceBackground citySlug={citySlug} cityCardImage={activeCity?.image_url} />
      <div className="hp__shade" aria-hidden />

      {/* ── Logo panel — PNG като фон, текст НАДЕЖДА отгоре ── */}
      <div className="hp__panel-wrap">
        {/* Изображението е само визуалният фон/форма */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-panel-cut.png"
          alt=""
          className="hp__panel-bg-img"
          aria-hidden
          draggable={false}
        />
        {/* HTML съдържание — overlay върху изображението */}
        <Link href="/" className="hp__panel-content" aria-label="Имоти Надежда — начало">
          {/* Покрива текста от изображението и показва НАДЕЖДА */}
          <span className="hp__panel-text-cover" aria-hidden />
          <span className="hp__panel-nadejda">• НАДЕЖДА •</span>
        </Link>
      </div>


      {/* ── Navigation top-right ── */}
      <Suspense fallback={null}>
        <nav className="hp__nav" aria-label="Навигация">
          {NAV.map(({ href, label }, i) => (
            <span key={href} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span className="hp__nav-sep" aria-hidden />}
              <Link href={href} className="hp__nav-link">{label}</Link>
            </span>
          ))}
          <Link href="/admin/login" className="hp__nav-user" aria-label="Вход">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        </nav>
      </Suspense>

      {/* ── Search bar — floating center ── */}
      <div className="hp__search-wrap">
        <div style={{ position: 'relative' }}>
          <div className="hp__search">
            <div className="hp__search-segs">
              {/* Град */}
              <div className="hp__search-seg">
                <span className="hp__search-icon"><PinIcon /></span>
                <div className="hp__search-text">
                  <span className="hp__search-label">Град</span>
                  <select
                    value={citySlug}
                    onChange={e => handleCityChange(e.target.value)}
                    className="hp__search-val"
                    aria-label="Град"
                  >
                    {cities.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Квартал */}
              <div className="hp__search-seg">
                <span className="hp__search-icon"><MapPinIcon /></span>
                <div className="hp__search-text">
                  <span className="hp__search-label">Квартал</span>
                  <select
                    value={quarter}
                    onChange={e => setQuarter(e.target.value)}
                    className="hp__search-val"
                    disabled={!citySlug}
                    aria-label="Квартал"
                  >
                    <option value="">Квартал</option>
                    {quarters.map(q => (
                      <option key={q.slug} value={q.slug}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Вид имот */}
              <div className="hp__search-seg">
                <span className="hp__search-icon"><BagIcon /></span>
                <div className="hp__search-text">
                  <span className="hp__search-label">Вид имот</span>
                  <select
                    value={propType}
                    onChange={e => setPropType(e.target.value)}
                    className="hp__search-val"
                    aria-label="Вид имот"
                  >
                    <option value="">Вид имот</option>
                    {PROPERTY_TYPES_BG.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Цена */}
              <button
                type="button"
                className="hp__search-seg"
                style={{ border: 'none', borderRight: '1px solid rgba(207,165,74,0.3)', background: 'transparent' }}
                onClick={() => setShowExp(true)}
                aria-label="Цена"
              >
                <span className="hp__search-icon"><EuroIcon /></span>
                <div className="hp__search-text">
                  <span className="hp__search-label">Цена</span>
                  <span className="hp__search-val" style={{ display: 'block' }}>
                    от {fmtPrice(priceMin)}<br />
                    <span style={{ fontSize: 10 }}>до {fmtPrice(priceMax)}</span>
                  </span>
                </div>
              </button>

              {/* Площ */}
              <button
                type="button"
                className="hp__search-seg"
                style={{ border: 'none', background: 'transparent' }}
                onClick={() => setShowExp(true)}
                aria-label="Площ"
              >
                <span className="hp__search-icon"><AreaIcon /></span>
                <div className="hp__search-text">
                  <span className="hp__search-label">Площ</span>
                  <span className="hp__search-val" style={{ display: 'block' }}>
                    от {areaMin} m²<br />
                    <span style={{ fontSize: 10 }}>до {areaMax} m²</span>
                  </span>
                </div>
              </button>
            </div>

            <div className="hp__search-btns">
              <button type="button" className="hp__search-filter" onClick={() => setShowExp(v => !v)}>
                <FilterIcon /> Филтри
              </button>
              <button type="button" className="hp__search-submit" onClick={handleSearch}>
                <SearchIcon /> Търси
              </button>
            </div>
          </div>

          {showExp && (
            <div className="hp__search-exp">
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
                priceMin={30_000}
                priceMaxLimit={2_000_000}
                formatPrice={fmtPrice}
                showTypeChips
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
                {[
                  { label: 'Цена от (€)', val: priceMin, set: (v: number) => setPriceMin(v) },
                  { label: 'Цена до (€)', val: priceMax, set: (v: number) => setPriceMax(v) },
                  { label: 'Площ от (m²)', val: areaMin, set: (v: number) => setAreaMin(v) },
                  { label: 'Площ до (m²)', val: areaMax, set: (v: number) => setAreaMax(v) },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(107,0,28,0.45)', marginBottom: 4 }}>{label}</label>
                    <input
                      type="number"
                      value={val}
                      onChange={e => set(Number(e.target.value))}
                      style={{ width: '100%', padding: '9px 11px', borderRadius: 6, border: '1.5px solid rgba(107,0,28,0.18)', fontSize: 13, color: '#6B001C', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── City cards — bottom ── */}
      <div className="hp__cards-wrap">
        {cities.map(city => {
          const bg = city.image_url
            ? `url(${city.image_url})`
            : CITY_GRADIENTS[city.slug] ?? CITY_GRADIENTS.shumen
          return (
            <Link
              key={city.id}
              href={`/cities/${city.slug}`}
              className="hp__card"
              onClick={() => handleCityChange(city.slug)}
            >
              <div className="hp__card-media">
                <div className="hp__card-photo" style={{ backgroundImage: bg }} />
                <div className="hp__card-dust" aria-hidden />
              </div>
              <div className="hp__card-body">
                <div className="hp__card-name-row">
                  <span className="hp__card-pin" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </span>
                  <h3 className="hp__card-name">{city.name}</h3>
                </div>
                <div className="hp__card-footer">
                  <span className="hp__card-cta">Виж града</span>
                  <span className="hp__card-arrow" aria-hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* Icons */
function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> }
function MapPinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function BagIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> }
function EuroIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12M4 14h9M20 6a8 8 0 100 12"/></svg> }
function AreaIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></svg> }
function FilterIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg> }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg> }
