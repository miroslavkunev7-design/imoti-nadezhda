'use client'

import Link from 'next/link'
import type { Property } from '@/types'
import { formatPrice, formatArea } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/upload-bridge'

interface Props {
  property: Property
  index?: number
}

export default function BurgasListingCard({ property, index = 0 }: Props) {
  const href = `/cities/burgas/${property.quarter_slug}/property/${property.id}`
  const imageUrl = resolveMediaUrl(property.primary_image)
  const bg = imageUrl
    ? `url(${imageUrl})`
    : 'linear-gradient(135deg,#2a1020,#1a0812)'

  return (
    <Link href={href} className="bq-card" style={{ '--bq-i': index } as React.CSSProperties}>
      <div className="bq-card__media">
        <div className="bq-card__photo" style={{ backgroundImage: bg }} />
        <div className="bq-card__spark bq-card__spark--tl" aria-hidden />
        <div className="bq-card__spark bq-card__spark--br" aria-hidden />
        {property.is_new && <span className="bq-card__badge">НОВО</span>}
        {property.is_featured && <span className="bq-card__badge bq-card__badge--top">ТОП ОФЕРТА</span>}
        <span className="bq-card__fav" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </span>
      </div>
      <div className="bq-card__body">
        <p className="bq-card__type">{property.type}</p>
        <h3 className="bq-card__title">{property.title}</h3>
        <p className="bq-card__loc">
          <PinIcon />
          {property.quarter_name}, {property.city_name}
        </p>
        <div className="bq-card__specs">
          {property.area_sqm > 0 && (
            <span>
              <AreaIcon /> {formatArea(property.area_sqm)}
            </span>
          )}
          {property.bedrooms != null && (
            <span>
              <BedIcon /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span>
              <BathIcon /> {property.bathrooms}
            </span>
          )}
        </div>
        <p className="bq-card__price">{formatPrice(property.price_eur)}</p>
      </div>
    </Link>
  )
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  )
}
function AreaIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
function BedIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 22v-7M3 15V9a2 2 0 012-2h14a2 2 0 012 2v6M3 15h18" />
    </svg>
  )
}
function BathIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 12h16M4 12a8 8 0 0016 0" />
    </svg>
  )
}
