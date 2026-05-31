import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import PropertyDetailScreen from '@/components/property/PropertyDetailScreen'
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
  if (params.slug === 'burgas') {
    redirect(`/cities/burgas/${params.quarter}/property/${params.id}`)
  }

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const property = await getProperty(id)
  if (!property) notFound()

  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  const images = property.images ?? []

  const galleryImages = images.length > 0 ? images : [{
    id: 0, property_id: id, image_url: property.primary_image ?? '', is_primary: true, sort_order: 0
  }]

  return (
    <PropertyDetailScreen
      property={property}
      galleryImages={galleryImages}
      cityName={city?.name ?? params.slug}
      citySlug={params.slug}
      quarterSlug={params.quarter}
    />
  )
}
