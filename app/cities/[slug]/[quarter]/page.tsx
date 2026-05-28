import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchBar from '@/components/search/LuxurySearchBar'
import QuarterInfoCard from '@/components/city/QuarterInfoCard'
import LuxuryPropertyCard from '@/components/cards/LuxuryPropertyCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PropertyGridControls from '@/components/search/PropertyGridControls'
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
  const listings = await getProperties({
    city: citySlug,
    quarter: quarterSlug,
    sort: sort as 'newest',
    page,
  })
  return { quarter, allQuarters, listings }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: `Имоти в кв. ${params.quarter}` }
}

export default async function NeighborhoodPage({ params, searchParams }: PageProps) {
  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  if (!city) notFound()

  const data = await getData(params.slug, params.quarter, searchParams.sort, searchParams.page)

  const allQuarters: Quarter[] = data.allQuarters?.length
    ? data.allQuarters
    : getQuartersForCity(params.slug)
  const quarter: Quarter = data.quarter ?? {
    id: 0,
    city_id: 0,
    city_slug: params.slug,
    city_name: city.name,
    name: params.quarter,
    slug: params.quarter,
    description: null,
    image_url: null,
    population: null,
    area_km2: null,
    property_count: 0,
  }
  const properties: Property[] = data.listings.data
  const total: number = data.listings.total
  const quarterDisplay: Quarter = { ...quarter, property_count: total }

  return (
    <div className="pb-16">
      <TerraceHero citySlug={params.slug} className="lux-detail-hero" />

      <div
        className="max-w-[1280px] mx-auto px-5 lg:px-8 relative z-10"
        style={{ marginTop: -40, paddingTop: 24 }}
      >
        <div className="mb-3">
          <Breadcrumb
            items={[
              { label: 'Начало', href: '/' },
              { label: 'Градове', href: `/cities/${params.slug}` },
              { label: city.name, href: `/cities/${params.slug}` },
              { label: quarterDisplay.name },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-6">
          <LuxurySearchBar
            cities={FALLBACK_CITIES}
            initialCity={params.slug}
            initialQuarters={allQuarters}
          />
          <div className="lux-detail-panel overflow-hidden">
            <QuarterInfoCard quarter={quarterDisplay} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2
              className="font-display font-bold"
              style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: '#6B001C' }}
            >
              Имоти в {quarterDisplay.name}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#6b4a52' }}>
              Намерени: <strong>{total}</strong> обяви
            </p>
          </div>
          <PropertyGridControls
            citySlug={params.slug}
            quarterSlug={params.quarter}
            currentSort={searchParams.sort ?? 'newest'}
          />
        </div>

        {properties.length === 0 ? (
          <div className="lux-content-panel text-center py-16">
            <p style={{ color: '#6b4a52' }}>
              Все още няма обяви в {quarterDisplay.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map(p => (
              <LuxuryPropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
