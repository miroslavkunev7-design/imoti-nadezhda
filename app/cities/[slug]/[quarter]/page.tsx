import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SearchWidget from '@/components/search/SearchWidget'
import QuarterInfoCard from '@/components/city/QuarterInfoCard'
import PropertyCard from '@/components/cards/PropertyCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PropertyGridControls from '@/components/search/PropertyGridControls'
import ListingPageLayout from '@/components/layout/ListingPageLayout'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import type { Quarter, Property } from '@/types'

export const revalidate = 60
interface PageProps {
  params: { slug: string; quarter: string }
  searchParams: { sort?: string; page?: string }
}

async function getData(citySlug: string, quarterSlug: string, sort = 'newest', page = '1') {
  const { getProperties } = await import('@/lib/queries/properties')
  const allQuarters = getQuartersForCity(citySlug)
  const quarter = allQuarters.find(q => q.slug === quarterSlug) ?? null
  const listings = await getProperties({ city: citySlug, quarter: quarterSlug, sort: sort as 'newest', page })
  return { quarter, allQuarters, listings }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `Имоти в кв. ${params.quarter}` }
}

export default async function NeighborhoodPage({ params, searchParams }: PageProps) {
  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  if (!city) notFound()

  const data = await getData(params.slug, params.quarter, searchParams.sort, searchParams.page)
  const allQuarters: Quarter[] = data.allQuarters?.length ? data.allQuarters : getQuartersForCity(params.slug)
  const quarter: Quarter = data.quarter ?? {
    id: 0, city_id: 0, city_slug: params.slug, city_name: city.name,
    name: params.quarter, slug: params.quarter,
    description: null, image_url: null, population: null, area_km2: null, property_count: 0,
  }
  const properties: Property[] = data.listings.data
  const total = data.listings.total
  const quarterDisplay: Quarter = { ...quarter, property_count: total }

  return (
    <ListingPageLayout
      citySlug={params.slug}
      title={`${quarterDisplay.name}, ${city.name}`}
      subtitle={`${total} обяви`}
    >
      <div className="mb-3">
        <Breadcrumb items={[
          { label: 'Начало', href: '/' },
          { label: city.name, href: `/cities/${params.slug}` },
          { label: quarterDisplay.name },
        ]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-6">
        <SearchWidget
          cities={FALLBACK_CITIES}
          initialCity={params.slug}
          initialQuarter={params.quarter}
          initialQuarters={allQuarters}
          compact
          variant="burgundy"
        />
        <QuarterInfoCard quarter={quarterDisplay} />
      </div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="font-display font-semibold" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: '#6B001C' }}>
          Имоти в {quarterDisplay.name}
        </h2>
        <PropertyGridControls citySlug={params.slug} quarterSlug={params.quarter} currentSort={searchParams.sort ?? 'newest'} />
      </div>
      {properties.length === 0 ? (
        <div className="py-20 text-center" style={{ color: '#7A0D28' }}>Все още няма обяви.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} luxury />)}
        </div>
      )}
    </ListingPageLayout>
  )
}
