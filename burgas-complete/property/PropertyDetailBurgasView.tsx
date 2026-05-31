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
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import { BurgasSearchBar } from '@/burgas-complete/shared/BurgasSearchBar'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import { burgasQuarterHeroImage } from '@/lib/data/burgas-quarter-meta'
import { formatPrice, formatArea, formatFloor } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  property: Property
  galleryImages: PropertyImage[]
  cityName: string
  citySlug: string
  quarterSlug: string
}

export default function PropertyDetailBurgasView({
  property,
  galleryImages,
  cityName,
  citySlug,
  quarterSlug,
}: Props) {
  const backHref = `/cities/${citySlug}/${quarterSlug}`
  const [propType, setPropType] = useState<string>(property.type)

  const heroUrl =
    resolveMediaUrl(galleryImages[0]?.image_url ?? property.primary_image) ??
    burgasQuarterHeroImage(property.quarter_slug ?? quarterSlug, null)

  const stats = [
    { label: 'Площ', value: formatArea(property.area_sqm) },
    { label: 'Стаи', value: property.bedrooms ? String(property.bedrooms) : '—' },
    { label: 'Етаж', value: formatFloor(property.floor, property.total_floors) },
    { label: 'Спални', value: property.bedrooms ? String(property.bedrooms) : '—' },
    { label: 'Бани', value: property.bathrooms ? String(property.bathrooms) : '—' },
    { label: 'Вид', value: property.type },
  ]

  const breadcrumbs = [
    { label: 'Начало', href: '/' },
    { label: 'Градове', href: '/buy' },
    { label: cityName, href: `/cities/${citySlug}` },
    {
      label: property.quarter_name ?? quarterSlug,
      href: `/cities/${citySlug}/${property.quarter_slug ?? quarterSlug}`,
    },
    { label: 'Детайл' },
  ]

  return (
    <div className="pdb-page">
      <section className="pdb-hero">
        <div className="pdb-hero__bg" style={{ backgroundImage: `url(${heroUrl})` }} aria-hidden />
        <div className="pdb-hero__vignette" aria-hidden />
        <div className="burgas-gold-frame" aria-hidden />
        <BurgasHeader marbleId="pdbMarble" />
        <BurgasSearchBar
          variant="property"
          citySlug={citySlug}
          cityName={cityName}
          quarterName={property.quarter_name ?? quarterSlug}
          quarterSlug={quarterSlug}
          className="pdb-hero__search"
          propType={propType}
          onPropTypeChange={setPropType}
        />
      </section>

      <header className="pdb-intro">
        {property.is_featured && <span className="pdb-head__badge">ТОП ОФЕРТА</span>}
        <h1 className="pdb-intro__title">{property.title}</h1>
        <p className="pdb-intro__loc">
          {property.quarter_name}, {property.city_name ?? cityName}
        </p>
        <p className="pdb-intro__price">{formatPrice(property.price_eur)}</p>
        <ul className="pdb-intro__stats">
          {stats.map(s => (
            <li key={s.label}>
              <span className="pdb-intro__stat-label">{s.label}</span>
              <strong>{s.value}</strong>
            </li>
          ))}
        </ul>
      </header>

      <div className="property-detail-page pdb-detail">
        <div className="pd-shell">
          <div className="pd-subhead">
            <Link href={backHref} className="pd-back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  )
}
