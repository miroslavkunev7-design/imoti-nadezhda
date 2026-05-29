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
  layout?: 'vertical' | 'horizontal'
  collage?: boolean
}

export default function PropertyCard({ property, index = 0, layout = 'vertical', collage = false }: PropertyCardProps) {
  const isHorizontal = layout === 'horizontal'
  const href = `/cities/${property.city_slug}/${property.quarter_slug}/property/${property.id}`
  const imageUrl = resolveMediaUrl(property.primary_image)

  return (
    <div
      className="group card-enter"
      style={{ '--card-i': index } as React.CSSProperties}
    >
      <Link href={href} className="block">
        <div
          className={`property-card-surface luxury-property-card${collage ? ' collage-property-card' : ' marble-dispersion marble-dispersion--burgundy'}${isHorizontal ? ' luxury-property-card--list' : ''}`}
        >
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={isHorizontal ? { width: 200, minHeight: 140, aspectRatio: 'auto' } : { aspectRatio: '4/3' }}
          >
            <div
              className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: imageUrl
                  ? `url(${imageUrl})`
                  : 'linear-gradient(135deg, #0f0a1a 0%, #1a0a14 100%)',
              }}
            />
            {collage && <div className="collage-property-card__dissolve" aria-hidden />}
            {!collage && (
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(4,2,12,0.7) 0%, transparent 50%)' }}
              />
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              {property.is_featured && <PropertyBadge type="featured" />}
              {property.is_new && !property.is_featured && <PropertyBadge type="new" />}
            </div>

            <div className="absolute top-3 right-3">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>

          <div className="p-4">
            <p
              className="text-xs uppercase tracking-wider mb-1 font-medium"
              style={{ color: collage ? 'rgba(107,0,28,0.55)' : undefined }}
            >
              {property.type}
            </p>

            <div className="flex items-center gap-1 mb-3">
              <svg className="text-crimson-700 flex-shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-xs text-themed-secondary truncate">
                {property.quarter_name}, {property.city_name}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <SpecItem icon={<AreaIcon />} label={formatArea(property.area_sqm)} />
              {property.floor != null && (
                <SpecItem icon={<FloorIcon />} label={`ет. ${formatFloor(property.floor, property.total_floors)}`} />
              )}
              {property.bedrooms != null && (
                <SpecItem icon={<BedIcon />} label={`${property.bedrooms} стаи`} />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="price">{formatPrice(property.price_eur)}</span>
              <span className="text-xs text-themed-muted">
                {property.construction ?? ''}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function SpecItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-themed-secondary">
      <span className="text-crimson-700 opacity-70">{icon}</span>
      <span className="text-xs">{label}</span>
    </div>
  )
}

function AreaIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
function FloorIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}
function BedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22v-7M3 15V9a2 2 0 012-2h14a2 2 0 012 2v6M3 15h18M21 22v-7" />
    </svg>
  )
}
