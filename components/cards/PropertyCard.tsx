'use client'

import Link from 'next/link'
import type { Property } from '@/types'
import { formatPrice, formatArea, formatFloor } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import PropertyBadge from '@/components/ui/PropertyBadge'
import FavoriteButton from '@/components/ui/FavoriteButton'

interface PropertyCardProps {
  property: Property
  index?: number
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const href = `/cities/${property.city_slug}/${property.quarter_slug}/property/${property.id}`
  const imageUrl = resolveMediaUrl(property.primary_image)

  return (
    <div
      className="group card-enter"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link href={href} className="block">
        <article className="lux-property-card">
          <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: imageUrl
                  ? `url(${imageUrl})`
                  : 'linear-gradient(135deg, #7a0d28 0%, #6b001c 100%)',
              }}
            />
            <div className="lux-property-card__dissolve" aria-hidden />

            <div className="absolute top-3 left-3 flex gap-2 z-10">
              {property.is_featured && <PropertyBadge type="featured" />}
              {property.is_new && !property.is_featured && <PropertyBadge type="new" />}
            </div>

            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>

          <div className="p-4 relative z-10">
            <p
              className="mb-1 font-semibold uppercase"
              style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--lux-gold-deep)' }}
            >
              {property.type}
            </p>

            <div className="flex items-center gap-1 mb-3" style={{ color: 'var(--lux-text-muted)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--lux-burgundy)">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-xs truncate">
                {property.quarter_name}, {property.city_name}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3 flex-wrap text-xs" style={{ color: 'var(--lux-text-muted)' }}>
              <span>{formatArea(property.area_sqm)}</span>
              {property.floor != null && (
                <span>ет. {formatFloor(property.floor, property.total_floors)}</span>
              )}
              {property.bedrooms != null && <span>{property.bedrooms} стаи</span>}
            </div>

            <div className="flex items-center justify-between">
              <span className="lux-price">{formatPrice(property.price_eur)}</span>
              <span className="text-xs" style={{ color: 'var(--lux-text-muted)' }}>
                {property.construction ?? ''}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}
