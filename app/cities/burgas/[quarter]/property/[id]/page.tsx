import { notFound, redirect } from 'next/navigation'
import { getQuartersForCity } from '@/lib/data/fallback'
import type { Metadata } from 'next'
import PropertyDetailBurgasView from '@/burgas-complete/property/PropertyDetailBurgasView'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'

export const revalidate = 60

interface PageProps {
  params: { quarter: string; id: string }
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
  return { title: `Имот #${params.id} — Бургас` }
}

export default async function BurgasPropertyDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) notFound()

  const knownQuarter = getQuartersForCity('burgas').some(q => q.slug === params.quarter)
  if (!knownQuarter) notFound()

  const property = await getProperty(id)
  if (!property) notFound()

  if (property.quarter_slug && property.quarter_slug !== params.quarter) {
    redirect(`/cities/burgas/${property.quarter_slug}/property/${id}`)
  }

  const city = FALLBACK_CITIES.find(c => c.slug === 'burgas')!
  const images = property.images ?? []
  const galleryImages =
    images.length > 0
      ? images
      : [
          {
            id: 0,
            property_id: id,
            image_url: property.primary_image ?? '',
            is_primary: true,
            sort_order: 0,
          },
        ]

  return (
    <PropertyDetailBurgasView
      property={property}
      galleryImages={galleryImages}
      cityName={city.name}
      citySlug="burgas"
      quarterSlug={params.quarter}
    />
  )
}
