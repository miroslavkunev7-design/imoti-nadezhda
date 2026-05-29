'use client'

import Link from 'next/link'
import type { Property } from '@/types'
import { formatPrice, formatArea, formatFloor } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/upload-bridge'

interface Props { property: Property; index?: number }

export default function RdPropertyCard({ property, index = 0 }: Props) {
  const href = `/cities/${property.city_slug}/${property.quarter_slug}/property/${property.id}`
  const imageUrl = resolveMediaUrl(property.primary_image)
  const bg = imageUrl
    ? `url(${imageUrl})`
    : 'linear-gradient(135deg,#1a0a0f 0%,#2d0f1a 100%)'

  return (
    <Link
      href={href}
      className="rd-prop-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="rd-prop-card__media">
        <div className="rd-prop-card__photo" style={{ backgroundImage: bg }} />
        <div className="rd-prop-card__badges">
          {property.is_featured && <span className="rd-prop-card__badge rd-prop-card__badge--featured">Топ</span>}
          {property.is_new && !property.is_featured && <span className="rd-prop-card__badge rd-prop-card__badge--new">Ново</span>}
        </div>
      </div>

      <div className="rd-prop-card__body">
        <p className="rd-prop-card__type">{property.type}</p>
        <h3 className="rd-prop-card__title">{property.title}</h3>

        <div className="rd-prop-card__location">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#CFA54A', flexShrink: 0 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{property.quarter_name}, {property.city_name}</span>
        </div>

        <div className="rd-prop-card__specs">
          {property.area_sqm && (
            <span className="rd-prop-card__spec">
              <AreaIcon /> {formatArea(property.area_sqm)}
            </span>
          )}
          {property.floor != null && (
            <span className="rd-prop-card__spec">
              <FloorIcon /> ет. {formatFloor(property.floor, property.total_floors)}
            </span>
          )}
          {property.bedrooms != null && (
            <span className="rd-prop-card__spec">
              <BedIcon /> {property.bedrooms} стаи
            </span>
          )}
        </div>

        <div className="rd-prop-card__price-row">
          <span className="rd-prop-card__price">{formatPrice(property.price_eur)}</span>
          {property.area_sqm && property.price_eur && (
            <span className="rd-prop-card__price-sqm">
              {formatPrice(Math.round(property.price_eur / property.area_sqm))}/m²
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function AreaIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> }
function FloorIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> }
function BedIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22v-7M3 15V9a2 2 0 012-2h14a2 2 0 012 2v6M3 15h18M21 22v-7"/></svg> }
