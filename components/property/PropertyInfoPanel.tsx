'use client'

import { useState } from 'react'
import type { Property } from '@/types'
import { formatPrice, formatArea, formatFloor, FEATURE_LABELS } from '@/lib/utils'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MortgageCalculator from '@/components/property/MortgageCalculator'

interface PropertyInfoPanelProps {
  property: Property
}

export default function PropertyInfoPanel({ property }: PropertyInfoPanelProps) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const specs = [
    { label: 'Лице',      value: formatArea(property.area_sqm),                     icon: <AreaIcon /> },
    { label: 'Стаи',      value: property.bedrooms ? String(property.bedrooms) : '—', icon: <RoomsIcon /> },
    { label: 'Етаж',      value: formatFloor(property.floor, property.total_floors),  icon: <FloorIcon /> },
    { label: 'Спалня',    value: property.bedrooms ? String(property.bedrooms) : '—', icon: <BedIcon /> },
    { label: 'Изложение', value: property.orientation ?? '—',                         icon: <CompassIcon /> },
    { label: 'Бани',      value: property.bathrooms ? String(property.bathrooms) : '—', icon: <BathIcon /> },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Type badges */}
      <div className="flex gap-2 flex-wrap">
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-md"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          {property.type}
        </span>
        {property.construction && (
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-md"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            {property.construction}
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="font-display text-[1.6rem] font-bold text-themed-primary leading-tight mb-1">
          {property.title}
        </h1>
        <div className="flex items-center gap-1.5">
          <svg className="text-crimson-700 flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-sm text-themed-secondary">
            {property.quarter_name}, {property.city_name}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-[2rem] font-bold text-crimson-700 leading-none">
        {formatPrice(property.price_eur)}
      </div>

      {/* Mortgage estimate */}
      {property.price_eur > 0 && (
        <MortgageCalculator priceEur={property.price_eur} />
      )}

      {/* Actions row */}
      <div className="flex items-center gap-3">
        <FavoriteButton propertyId={property.id} />
        {/* Compare */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-themed-secondary hover:text-themed-primary transition-colors"
          style={{ border: '1px solid var(--border-subtle)' }}
          aria-label="Сравни"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
        </button>
        {/* Share */}
        <button
          onClick={handleShare}
          className="w-8 h-8 rounded-full flex items-center justify-center text-themed-secondary hover:text-themed-primary transition-colors"
          style={{ border: '1px solid var(--border-subtle)' }}
          aria-label="Сподели"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        {copied && <span className="text-xs text-crimson-700">Копирано!</span>}
      </div>

      {/* Specs grid */}
      <div
        className="grid grid-cols-2 gap-0 rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        {specs.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
              borderBottom: i < specs.length - 2 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <span className="text-crimson-700 flex-shrink-0">{s.icon}</span>
            <div>
              <p className="text-[10px] text-themed-muted uppercase tracking-wider">{s.label}</p>
              <p className="text-sm text-themed-primary font-medium">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      {property.features && property.features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {property.features.map(f => (
            <span
              key={f}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: 'rgba(196,30,58,0.1)',
                color: '#c41e3a',
                border: '1px solid rgba(196,30,58,0.2)',
              }}
            >
              {FEATURE_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const iconProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const AreaIcon    = () => <svg {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
const RoomsIcon   = () => <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
const FloorIcon   = () => <svg {...iconProps}><path d="M3 3h18M3 9h18M3 15h18M3 21h18"/></svg>
const BedIcon     = () => <svg {...iconProps}><path d="M3 22v-7M3 15V9a2 2 0 012-2h14a2 2 0 012 2v6M3 15h18M21 22v-7"/></svg>
const CompassIcon = () => <svg {...iconProps}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const BathIcon    = () => <svg {...iconProps}><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM6 12V5a2 2 0 012-2h.5"/><path d="M8 12V7"/></svg>
