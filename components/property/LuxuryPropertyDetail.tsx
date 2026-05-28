'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { Property, PropertyImage } from '@/types'
import TerraceHero from '@/components/layout/TerraceHero'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyInfoPanel from '@/components/property/PropertyInfoPanel'
import PropertyDescription from '@/components/property/PropertyDescription'
import PropertyCharacteristics from '@/components/property/PropertyCharacteristics'
import PropertyMap from '@/components/property/PropertyMap'
import LuxuryAgentCard from '@/components/property/LuxuryAgentCard'
import { useCitySelection } from '@/components/providers/CitySelectionProvider'
import { isCitySlug } from '@/lib/design/brand'
import '@/app/cities/[slug]/[quarter]/property/[id]/property-detail.css'

interface Props {
  property: Property
  galleryImages: PropertyImage[]
  cityName: string
  citySlug: string
  quarterSlug: string
}

export default function LuxuryPropertyDetail({
  property,
  galleryImages,
  cityName,
  citySlug,
  quarterSlug,
}: Props) {
  const { setSelectedCity } = useCitySelection()
  const backHref = `/cities/${citySlug}/${quarterSlug}`

  useEffect(() => {
    if (isCitySlug(citySlug)) setSelectedCity(citySlug)
  }, [citySlug, setSelectedCity])

  return (
    <div className="property-detail-page luxury-detail-page">
      <TerraceHero citySlug={citySlug} className="lux-detail-hero" />

      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm mb-4"
          style={{ color: '#6b4a52' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Назад към списъка
        </Link>
      </div>

      <div className="lux-detail-grid">
        <div className="flex flex-col gap-[var(--lux-detail-gap)]">
          <div className="lux-detail-panel p-0 overflow-hidden">
            <PropertyGallery
              images={galleryImages}
              title={property.title}
              isFeatured={property.is_featured}
              citySlug={citySlug}
              quarterSlug={quarterSlug}
              variant="detail"
            />
          </div>

          <div className="lux-detail-panel p-4">
            <PropertyInfoPanel property={property} variant="detail" />
          </div>

          <div className="lux-detail-panel p-4">
            <PropertyDescription description={property.description} variant="detail" />
          </div>
        </div>

        <div className="flex flex-col gap-[var(--lux-detail-gap)]">
          <LuxuryAgentCard propertyId={property.id} />

          <div className="lux-detail-panel p-4">
            <PropertyCharacteristics property={property} variant="detail" />
          </div>

          <div className="lux-detail-panel overflow-hidden min-h-[220px]">
            <PropertyMap
              address={property.quarter_name ?? ''}
              quarterName={property.quarter_name ?? quarterSlug}
              cityName={property.city_name ?? cityName}
              variant="detail"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
