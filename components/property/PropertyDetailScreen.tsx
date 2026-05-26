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

interface Props {
  property: Property
  galleryImages: PropertyImage[]
  cityName: string
  citySlug: string
  quarterSlug: string
}

export default function PropertyDetailScreen({
  property,
  galleryImages,
  cityName,
  citySlug,
  quarterSlug,
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
    <div className="property-detail-page">
      <div className="pd-shell">
        <div className="pd-subhead">
          <Link href={backHref} className="pd-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Назад към списъка
          </Link>
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </div>

        <div className="pd-body">
          <section className="pd-top" aria-label="Галерия и основна информация">
            <PropertyGallery
              images={galleryImages}
              title={property.title}
              isFeatured={property.is_featured}
              citySlug={citySlug}
              quarterSlug={quarterSlug}
              variant="detail"
            />

            <div className="pd-card pd-info-card">
              <div className="pd-info-inner">
                <PropertyInfoPanel property={property} variant="detail" />
              </div>
            </div>

            <div className="pd-side">
              <ContactSidebar propertyId={property.id} variant="detail" />
            </div>
          </section>

          <section className="pd-bottom" aria-label="Детайли">
            <div className="pd-card pd-panel">
              <PropertyDescription description={property.description} variant="detail" />
            </div>
            <div className="pd-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <PropertyMap
                address={property.quarter_name ?? ''}
                quarterName={property.quarter_name ?? quarterSlug}
                cityName={property.city_name ?? cityName}
                variant="detail"
              />
            </div>
            <div className="pd-card pd-panel">
              <PropertyCharacteristics property={property} variant="detail" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
