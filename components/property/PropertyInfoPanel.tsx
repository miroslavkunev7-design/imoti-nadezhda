'use client'

import { useState, type ReactNode } from 'react'
import type { Property } from '@/types'
import { formatPrice, formatArea, formatFloor, FEATURE_LABELS } from '@/lib/utils'
import FavoriteButton from '@/components/ui/FavoriteButton'
import MortgageCalculator from '@/components/property/MortgageCalculator'

interface PropertyInfoPanelProps {
  property: Property
  compact?: boolean
  variant?: 'default' | 'detail'
}

export default function PropertyInfoPanel({
  property,
  compact = false,
  variant = 'default',
}: PropertyInfoPanelProps) {
  const [copied, setCopied] = useState(false)
  const isDetail = variant === 'detail'

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const specs = [
    { label: 'Площ',         value: formatArea(property.area_sqm), icon: <AreaIcon /> },
    { label: 'Стаи',         value: property.bedrooms ? String(property.bedrooms) : '—', icon: <RoomsIcon /> },
    { label: 'Етаж',         value: formatFloor(property.floor, property.total_floors), icon: <FloorIcon /> },
    { label: 'Спални',       value: property.bedrooms ? String(property.bedrooms) : '—', icon: <BedIcon /> },
    { label: 'Изложение',    value: property.orientation ?? '—', icon: <CompassIcon /> },
    { label: 'Бани',         value: property.bathrooms ? String(property.bathrooms) : '—', icon: <BathIcon /> },
    { label: 'Асансьор',     value: property.elevator ? 'Да' : 'Не', icon: <ElevatorIcon /> },
    { label: 'Паркинг',      value: property.features?.includes('parking') || property.features?.includes('garage') ? 'Да' : 'Не', icon: <ParkingIcon /> },
    { label: 'Строителство', value: property.construction ?? '—', icon: <BrickIcon /> },
    { label: 'Обзаведен',    value: property.furnished ? 'Да' : 'Не', icon: <FurnishedIcon /> },
  ]

  const amenities: { label: string; icon: ReactNode }[] = [
    { label: 'Асансьор', icon: <ElevatorIcon /> },
    { label: 'Паркинг', icon: <ParkingIcon /> },
    { label: property.construction ?? 'Тухла', icon: <BrickIcon /> },
    { label: property.furnished ? 'Обзаведен' : 'Необзаведен', icon: <FurnishedIcon /> },
  ]

  if (isDetail) {
    return (
      <>
        <div className="pd-tags">
          <span className="pd-tag">{property.type}</span>
          {property.construction && <span className="pd-tag">{property.construction}</span>}
        </div>

        <h1 className="pd-title">{property.title}</h1>

        <div className="pd-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--pd-accent)">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {property.quarter_name}, {property.city_name}
        </div>

        <div className="pd-price">{formatPrice(property.price_eur)}</div>

        <div className="pd-actions">
          <FavoriteButton propertyId={property.id} className="pd-favorite" />
          <button type="button" className="pd-icon-btn" aria-label="Сравни">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>
          </button>
          <button type="button" className="pd-icon-btn" onClick={handleShare} aria-label="Сподели">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          </button>
          {copied && <span style={{ fontSize: 11, color: 'var(--pd-accent)' }}>Копирано!</span>}
        </div>

        <div className="pd-info-lower">
          <div className="pd-specs">
            {specs.map(s => (
              <div key={s.label} className="pd-spec-cell">
                <span className="pd-spec-icon">{s.icon}</span>
                <div>
                  <p className="pd-spec-label">{s.label}</p>
                  <p className="pd-spec-value">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pd-amenities">
            {amenities.map(a => (
              <div key={a.label} className="pd-amenity">
                {a.icon}
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-5'}`}>
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>
          {property.type}
        </span>
      </div>
      <div>
        <h1 className={`font-display font-bold text-themed-primary leading-tight mb-0.5 ${compact ? 'text-lg' : 'text-[1.6rem]'}`}>{property.title}</h1>
        <span className="text-sm text-themed-secondary">{property.quarter_name}, {property.city_name}</span>
      </div>
      <div className={`font-bold text-crimson-700 ${compact ? 'text-xl' : 'text-[2rem]'}`}>{formatPrice(property.price_eur)}</div>
      {property.price_eur > 0 && !compact && <MortgageCalculator priceEur={property.price_eur} />}
      {property.price_eur > 0 && compact && <MortgageCalculator compact priceEur={property.price_eur} />}
      <div className="flex items-center gap-3">
        <FavoriteButton propertyId={property.id} />
        <button type="button" onClick={handleShare} className="w-8 h-8 rounded-full border border-themed text-themed-secondary">↗</button>
      </div>
      {property.features && property.features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {property.features.map(f => (
            <span key={f} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(80,11,26,0.1)', color: '#A86B3D' }}>
              {FEATURE_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const iconProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const AreaIcon      = () => <svg {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
const RoomsIcon     = () => <svg {...iconProps}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
const FloorIcon     = () => <svg {...iconProps}><path d="M3 3h18M3 9h18M3 15h18M3 21h18"/></svg>
const BedIcon       = () => <svg {...iconProps}><path d="M3 22v-7M3 15V9a2 2 0 012-2h14a2 2 0 012 2v6M3 15h18M21 22v-7"/></svg>
const CompassIcon   = () => <svg {...iconProps}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const BathIcon      = () => <svg {...iconProps}><path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM6 12V5a2 2 0 012-2h.5"/><path d="M8 12V7"/></svg>
const ElevatorIcon  = () => <svg {...iconProps}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 6v12M9 9l3-3 3 3M9 15l3 3 3-3"/></svg>
const ParkingIcon   = () => <svg {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/></svg>
const BrickIcon     = () => <svg {...iconProps}><rect x="2" y="6" width="8" height="5"/><rect x="14" y="6" width="8" height="5"/><rect x="8" y="13" width="8" height="5"/></svg>
const FurnishedIcon = () => <svg {...iconProps}><path d="M5 12V6a2 2 0 012-2h10a2 2 0 012 2v6"/><path d="M3 12h18v4H3z"/></svg>
