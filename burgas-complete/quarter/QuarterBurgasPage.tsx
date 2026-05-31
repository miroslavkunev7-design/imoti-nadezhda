import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import { quarterImageUrl } from '@/lib/data/quarter-images'
import type { Quarter, Property } from '@/types'
import QuarterBurgasView from '@/burgas-complete/quarter/QuarterBurgasView'

function enrichBurgasQuarter(q: Quarter): Quarter {
  return {
    ...q,
    image_url: q.image_url ?? quarterImageUrl('burgas', q.slug),
  }
}

export const revalidate = 60

interface PageProps {
  params: { slug: string; quarter: string }
  searchParams: { sort?: string; page?: string }
}

async function getData(citySlug: string, quarterSlug: string, sort = 'newest', page = '1') {
  const { getProperties } = await import('@/lib/queries/properties')
  const allQuarters = getQuartersForCity(citySlug)
  const quarter = allQuarters.find(q => q.slug === quarterSlug) ?? null
  const listings = await getProperties({
    city: citySlug,
    quarter: quarterSlug,
    sort: sort as 'newest',
    page,
  })
  return { quarter, allQuarters, listings }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const quarters = getQuartersForCity(params.slug)
  const q = quarters.find(item => item.slug === params.quarter)
  const name = q?.name ?? params.quarter
  return {
    title: `Имоти в кв. ${name} — Бургас | Имоти Надежда`,
    description: q?.description ?? `Имоти в квартал ${name}, Бургас.`,
  }
}

export default async function QuarterBurgasPage({ params, searchParams }: PageProps) {
  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  if (!city || params.slug !== 'burgas') notFound()

  const allQuarters = getQuartersForCity('burgas').map(enrichBurgasQuarter)
  const known = allQuarters.find(q => q.slug === params.quarter)
  if (!known) notFound()

  const data = await getData(params.slug, params.quarter, searchParams.sort, searchParams.page)

  const quarter: Quarter = enrichBurgasQuarter(data.quarter ?? known)
  const properties: Property[] = data.listings.data
  const total: number = data.listings.total
  const quarterDisplay: Quarter = { ...quarter, property_count: total }

  return (
    <QuarterBurgasView
      city={city}
      quarter={quarterDisplay}
      allQuarters={allQuarters}
      properties={properties}
      total={total}
    />
  )
}
