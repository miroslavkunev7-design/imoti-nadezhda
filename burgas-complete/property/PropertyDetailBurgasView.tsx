'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Property, PropertyImage } from '@/types'
import { PROPERTY_TYPES_BG } from '@/lib/data/fallback'
import { formatPrice, formatArea, formatFloor } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import { BurgasHeader } from '@/burgas-complete/shared/BurgasChrome'
import ContactSidebar from '@/components/property/ContactSidebar'
import PropertyDescription from '@/components/property/PropertyDescription'
import PropertyMap from '@/components/property/PropertyMap'
import PropertyCharacteristics from '@/components/property/PropertyCharacteristics'
import FavoriteButton from '@/components/ui/FavoriteButton'

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
  const router = useRouter()
  const backHref = `/cities/${citySlug}/${quarterSlug}`
  const images = galleryImages.filter(img => img.image_url)
  const [activeIdx, setActiveIdx] = useState(0)
  const [propType, setPropType] = useState<string>(property.type)

  const heroUrl =
    resolveMediaUrl(images[activeIdx]?.image_url ?? property.primary_image) ??
    '/images/quarters/burgas/lazur.jpg'

  const goPrev = useCallback(() => {
    setActiveIdx(i => (i <= 0 ? images.length - 1 : i - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setActiveIdx(i => (i >= images.length - 1 ? 0 : i + 1))
  }, [images.length])

  const stats = [
    { label: 'Площ', value: formatArea(property.area_sqm) },
    { label: 'Стаи', value: property.bedrooms ? String(property.bedrooms) : '—' },
    { label: 'Етаж', value: formatFloor(property.floor, property.total_floors) },
    { label: 'Спални', value: property.bedrooms ? String(property.bedrooms) : '—' },
    { label: 'Бани', value: property.bathrooms ? String(property.bathrooms) : '—' },
    { label: 'Вид', value: property.type },
  ]

  return (
    <div className="pdb-page" aria-label={property.title}>
      <section className="pdb-hero">
        <div className="pdb-hero__bg" style={{ backgroundImage: `url(${heroUrl})` }} aria-hidden />
        <div className="pdb-hero__vignette" aria-hidden />
        <div className="pdb-hero__frame" aria-hidden />

        <BurgasHeader marbleId="pdbMarble" />

        <div className="cb-search pdb-hero__search" role="search">
          <div className="cb-search__field cb-search__field--city">
            <PinIcon />
            <div className="cb-search__wrap">
              <span>Град</span>
              <strong>{cityName}</strong>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--quarter">
            <PinIcon />
            <div className="cb-search__wrap">
              <span>Квартал</span>
              <strong>{property.quarter_name}</strong>
            </div>
          </div>
          <div className="cb-search__field cb-search__field--type">
            <BagIcon />
            <div className="cb-search__wrap">
              <span>Вид имот</span>
              <select
                className="cb-search__select"
                value={propType}
                onChange={e => setPropType(e.target.value)}
                aria-label="Вид имот"
              >
                {PROPERTY_TYPES_BG.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="cb-search__filter"
            onClick={() => router.push(`/buy?city=${citySlug}&quarter=${quarterSlug}`)}
          >
            Филтри
          </button>
          <button
            type="button"
            className="cb-search__submit"
            onClick={() => router.push(`/buy?city=${citySlug}&quarter=${quarterSlug}`)}
          >
            Търси
          </button>
        </div>
      </section>

      <div className="pdb-body">
        <nav className="pdb-crumb" aria-label="Breadcrumb">
          <Link href="/">Начало</Link>
          <span>/</span>
          <Link href={`/cities/${citySlug}`}>{cityName}</Link>
          <span>/</span>
          <Link href={backHref}>{property.quarter_name}</Link>
          <span>/</span>
          <span>Детайл</span>
        </nav>

        <Link href={backHref} className="pdb-back">
          ← Назад към списъка
        </Link>

        <header className="pdb-head">
          {property.is_featured && <span className="pdb-head__badge">ТОП ОФЕРТА</span>}
          <h1 className="pdb-head__title">{property.title}</h1>
          <p className="pdb-head__loc">
            {property.quarter_name}, {property.city_name ?? cityName}
          </p>
          <p className="pdb-head__price">{formatPrice(property.price_eur)}</p>
          <ul className="pdb-head__stats">
            {stats.map(s => (
              <li key={s.label}>
                <span className="pdb-head__stat-label">{s.label}</span>
                <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
        </header>

        <div className="pdb-main">
          <section className="pdb-gallery" aria-label="Галерия">
            <div className="pdb-gallery__main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl} alt={property.title} />
              {images.length > 1 && (
                <>
                  <button type="button" className="pdb-gallery__nav pdb-gallery__nav--prev" onClick={goPrev} aria-label="Предишна">
                    ‹
                  </button>
                  <button type="button" className="pdb-gallery__nav pdb-gallery__nav--next" onClick={goNext} aria-label="Следваща">
                    ›
                  </button>
                </>
              )}
              <div className="pdb-gallery__actions">
                <FavoriteButton propertyId={property.id} className="pdb-fav" />
              </div>
            </div>
            {images.length > 1 && (
              <div className="pdb-thumbs">
                {images.map((img, i) => {
                  const url = resolveMediaUrl(img.image_url) ?? ''
                  return (
                    <button
                      key={img.id ?? i}
                      type="button"
                      className={`pdb-thumb${i === activeIdx ? ' is-active' : ''}`}
                      onClick={() => setActiveIdx(i)}
                      aria-label={`Снимка ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" />
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <div className="pdb-panels">
            <div className="pdb-card">
              <PropertyDescription description={property.description} variant="detail" />
            </div>
            <div className="pdb-card pdb-agent">
              <ContactSidebar propertyId={property.id} variant="detail" />
            </div>
            <div className="pdb-card">
              <PropertyCharacteristics property={property} variant="detail" />
            </div>
            <div className="pdb-card pdb-map-card">
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
    </div>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  )
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 016 0" />
    </svg>
  )
}
