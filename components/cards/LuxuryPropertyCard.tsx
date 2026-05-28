'use client'

import Link from 'next/link'
import type { Property } from '@/types'
import { formatPrice, formatArea, formatFloor } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/upload-bridge'

interface LuxuryPropertyCardProps {
  property: Property
}

export default function LuxuryPropertyCard({ property }: LuxuryPropertyCardProps) {
  const href = `/cities/${property.city_slug}/${property.quarter_slug}/property/${property.id}`
  const imageUrl = resolveMediaUrl(property.primary_image)

  return (
    <Link href={href} className="lux-property-card block group">
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <div
          className="absolute inset-0 bg-center bg-cover transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: imageUrl
              ? `url(${imageUrl})`
              : 'linear-gradient(135deg, #7a0d28 0%, #6b001c 100%)',
          }}
        />
        <div className="lux-property-card__dissolve-bottom" />
      </div>
      <div className="p-4 relative">
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#6b4a52' }}>
          {property.type}
        </p>
        <p className="text-sm mb-2 truncate" style={{ color: '#6b4a52' }}>
          {property.quarter_name}, {property.city_name}
        </p>
        <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: '#6b4a52' }}>
          <span>{formatArea(property.area_sqm)}</span>
          {property.floor != null && (
            <span>ет. {formatFloor(property.floor, property.total_floors)}</span>
          )}
          {property.bedrooms != null && <span>{property.bedrooms} стаи</span>}
        </div>
        <p className="lux-property-card__price">{formatPrice(property.price_eur)}</p>
      </div>
    </Link>
  )
}
