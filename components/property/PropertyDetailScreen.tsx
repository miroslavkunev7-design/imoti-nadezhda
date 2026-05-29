'use client'

import Link from 'next/link'
import type { Property, PropertyImage } from '@/types'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyInfoPanel from '@/components/property/PropertyInfoPanel'
import ContactSidebar from '@/components/property/ContactSidebar'
import PropertyDescription from '@/components/property/PropertyDescription'
import PropertyMap from '@/components/property/PropertyMap'
import PropertyCharacteristics from '@/components/property/PropertyCharacteristics'
import PropertyVirtualTourButton from '@/components/virtual-tour/PropertyVirtualTourButton'
import PropertyCityHero from '@/components/property/PropertyCityHero'

interface Props {
  property: Property
  galleryImages: PropertyImage[]
  cityName: string
  citySlug: string
  quarterSlug: string
  cityCardImage?: string | null
}

export default function PropertyDetailScreen({
  property,
  galleryImages,
  cityName,
  citySlug,
  quarterSlug,
  cityCardImage,
}: Props) {
  const backHref = `/cities/${citySlug}/${quarterSlug}`

  const breadcrumbs = [
    { label: 'Начало', href: '/' },
    { label: 'Градове', href: '/buy' },
    { label: cityName, href: `/cities/${citySlug}` },
    { label: property.quarter_name ?? quarterSlug, href: `/cities/${citySlug}/${quarterSlug}` },
    { label: 'Детайл' },
  ]

  return (
    <div className="rd-detail">
      <PropertyCityHero citySlug={citySlug} cityCardImage={cityCardImage} />

      <div className="rd-detail__inner">
        {/* Breadcrumb */}
        <nav className="rd-breadcrumb" aria-label="Навигация">
          {breadcrumbs.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span className="rd-breadcrumb__sep">/</span>}
              {b.href ? (
                <Link href={b.href} className="rd-breadcrumb__link" style={{ color: 'rgba(107,0,28,0.55)', textDecoration: 'none' }}>{b.label}</Link>
              ) : (
                <span className="rd-breadcrumb__current">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="rd-detail__grid">
          {/* Left column */}
          <div className="rd-detail__left">
            <PropertyGallery
              images={galleryImages}
              title={property.title}
              isFeatured={property.is_featured}
              citySlug={citySlug}
              quarterSlug={quarterSlug}
              variant="detail"
            />

            <div style={{ marginTop: 20 }}>
              <PropertyInfoPanel property={property} variant="detail" />
            </div>

            <div style={{ marginTop: 20 }}>
              <PropertyVirtualTourButton propertyId={property.id} propertyTitle={property.title} />
            </div>

            <div style={{ marginTop: 20 }}>
              <PropertyDescription description={property.description} variant="detail" />
            </div>

            <div style={{ marginTop: 20 }}>
              <PropertyCharacteristics property={property} variant="detail" />
            </div>

            <div style={{ marginTop: 20 }}>
              <PropertyMap
                address={property.quarter_name ?? ''}
                quarterName={property.quarter_name ?? quarterSlug}
                cityName={property.city_name ?? cityName}
                variant="detail"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="rd-detail__right">
            <ContactSidebar propertyId={property.id} variant="detail" />
          </div>
        </div>
      </div>
    </div>
  )
}
