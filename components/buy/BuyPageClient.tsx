'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { City, Property } from '@/types'
import TerraceBackground from '@/components/layout/TerraceBackground'
import { getSelectedCityFromCookie } from '@/lib/client/selected-city'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import RdPropertyCard from '@/components/cards/RdPropertyCard'

interface Props {
  properties: Property[]
  total: number
  cities: City[]
  searchParams: Record<string, string>
}

export default function BuyPageClient({ properties, total, cities, searchParams: sp }: Props) {
  const router = useRouter()
  const [citySlug, setCitySlug] = useState(() => sp.city || getSelectedCityFromCookie() || 'shumen')

  const sortLabel = sp.sort === 'price_asc' ? 'Цена ↑' : sp.sort === 'price_desc' ? 'Цена ↓' : 'Актуални'
  const dealLabel = sp.deal === 'rent' ? 'Под наем' : 'За продажба'

  function updateParam(key: string, val: string) {
    const p = new URLSearchParams(sp as Record<string, string>)
    if (val) p.set(key, val); else p.delete(key)
    router.push(`/buy?${p.toString()}`)
  }

  return (
    <div className="rd-listing">
      {/* Search bar on burgundy bg */}
      <div className="rd-listing__search-bar">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="rd-search" style={{ minHeight: 56 }}>
            <div className="rd-search__segs" style={{ flexWrap: 'wrap' }}>
              <div className="rd-search__seg" style={{ background: 'transparent', borderRight: '1px solid rgba(207,165,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', flex: '1 1 130px', minWidth: 0 }}>
                <span className="rd-search__icon"><PinIcon /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span className="rd-search__label" style={{ color: 'rgba(255,255,255,0.5)' }}>Град</span>
                  <select
                    value={sp.city || ''}
                    onChange={e => updateParam('city', e.target.value)}
                    className="rd-search__val"
                    style={{ color: '#fff', background: 'transparent' }}
                    aria-label="Град"
                  >
                    <option value="">Всички</option>
                    {cities.map(c => <option key={c.slug} value={c.slug} style={{ background: '#6b001c' }}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="rd-search__seg" style={{ background: 'transparent', borderRight: '1px solid rgba(207,165,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', flex: '1 1 130px', minWidth: 0 }}>
                <span className="rd-search__icon"><HomeIcon /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span className="rd-search__label" style={{ color: 'rgba(255,255,255,0.5)' }}>Вид имот</span>
                  <select
                    value={sp.type || ''}
                    onChange={e => updateParam('type', e.target.value)}
                    className="rd-search__val"
                    style={{ color: '#fff', background: 'transparent' }}
                    aria-label="Вид имот"
                  >
                    <option value="">Всички</option>
                    {PROPERTY_TYPES_BG.map(t => <option key={t} value={t} style={{ background: '#6b001c' }}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="rd-search__seg" style={{ background: 'transparent', borderRight: '1px solid rgba(207,165,74,0.3)', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', flex: '1 1 130px', minWidth: 0 }}>
                <span className="rd-search__icon"><EuroIcon /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span className="rd-search__label" style={{ color: 'rgba(255,255,255,0.5)' }}>Цена</span>
                  <span className="rd-search__val" style={{ color: '#fff' }}>Без ограничение</span>
                </div>
              </div>

              <div className="rd-search__seg" style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', flex: '1 1 130px', minWidth: 0 }}>
                <span className="rd-search__icon"><AreaIcon /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span className="rd-search__label" style={{ color: 'rgba(255,255,255,0.5)' }}>Площ</span>
                  <span className="rd-search__val" style={{ color: '#fff' }}>Без ограничение</span>
                </div>
              </div>
            </div>

            <div className="rd-search__btns">
              <button type="button" className="rd-search__filter-btn" style={{ color: '#fff', borderColor: 'rgba(207,165,74,0.35)' }}>
                <FilterIcon /> Филтри
              </button>
              <button
                type="button"
                className="rd-search__submit"
                onClick={() => {
                  const p = new URLSearchParams(sp as Record<string, string>)
                  router.push(`/buy?${p.toString()}`)
                }}
              >
                <SearchIcon /> Търси
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results header */}
      <div className="rd-listing__header">
        <div>
          <h1 className="rd-listing__title">
            {sp.city ? `Имоти в ${cities.find(c => c.slug === sp.city)?.name ?? sp.city}` : 'Всички имоти'}
            {sp.quarter ? `, кв. ${sp.quarter}` : ''}
          </h1>
          <p className="rd-listing__count">Намерени <strong>{total}</strong> имота</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={sp.sort || ''}
            onChange={e => updateParam('sort', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(107,0,28,0.18)', fontSize: 12, color: '#6b001c', background: '#fff', cursor: 'pointer' }}
            aria-label="Сортиране"
          >
            <option value="">Актуални</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="rd-listing__grid">
        {properties.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'rgba(107,0,28,0.5)' }}>
            Няма намерени имоти по зададените критерии.
          </div>
        ) : (
          properties.map((p, i) => <RdPropertyCard key={p.id} property={p} index={i} />)
        )}
      </div>
    </div>
  )
}

function PinIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> }
function HomeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> }
function EuroIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 10h12M4 14h9M20 6a8 8 0 100 12"/></svg> }
function AreaIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 3v18"/></svg> }
function FilterIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg> }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg> }
