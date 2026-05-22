import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyInfoPanel from '@/components/property/PropertyInfoPanel'
import ContactSidebar from '@/components/property/ContactSidebar'
import PropertyDescription from '@/components/property/PropertyDescription'
import PropertyMap from '@/components/property/PropertyMap'
import PropertyCharacteristics from '@/components/property/PropertyCharacteristics'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'

export const revalidate = 60

interface PageProps {
  params: { slug: string; quarter: string; id: string }
}

async function getProperty(id: number): Promise<Property | null> {
  try {
    const { getPropertyById, incrementViews } = await import('@/lib/queries/properties')
    const property = await getPropertyById(id)
    if (property) incrementViews(id).catch(() => {})
    return property
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `Имот #${params.id}` }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const property = await getProperty(id)
  if (!property) notFound()

  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  const images = property.images ?? []

  // Ensure at least one placeholder image entry for gallery
  const galleryImages = images.length > 0 ? images : [{
    id: 0, property_id: id, image_url: property.primary_image ?? '', is_primary: true, sort_order: 0
  }]

  return (
    <div className="min-h-screen bg-themed-base pb-[68px]">
      {/* ── Top bar with city name + breadcrumb ── */}
      <div
        className="pt-[76px]"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="text-crimson-700 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <h1 className="font-display text-[1.4rem] font-semibold text-themed-primary">
              {city?.name ?? params.slug}
            </h1>
          </div>
          <Breadcrumb items={[
            { label: 'Начало',              href: '/' },
            { label: 'Градове',             href: '/cities' },
            { label: city?.name ?? params.slug, href: `/cities/${params.slug}` },
            { label: property.quarter_name ?? params.quarter, href: `/cities/${params.slug}/${params.quarter}` },
            { label: 'Детайл' },
          ]} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-8">
        {/* Two-column: gallery (left) + info+contact (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-10">

          {/* Left: Gallery */}
          <PropertyGallery
            images={galleryImages}
            title={property.title}
            isFeatured={property.is_featured}
            citySlug={params.slug}
            quarterSlug={params.quarter}
          />

          {/* Right: Info + Contact */}
          <div className="flex flex-col gap-6">
            <PropertyInfoPanel property={property} />
            <ContactSidebar propertyId={property.id} />
          </div>
        </div>

        {/* Three-column below: description | map | characteristics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PropertyDescription description={property.description} />
          <PropertyMap
            address={property.quarter_name ?? ''}
            quarterName={property.quarter_name ?? params.quarter}
            cityName={property.city_name ?? city?.name ?? ''}
          />
          <PropertyCharacteristics property={property} />
        </div>
      </div>
    </div>
  )
}
