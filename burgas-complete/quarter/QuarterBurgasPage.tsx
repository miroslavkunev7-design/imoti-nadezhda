import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SearchWidget from '@/components/search/SearchWidget'
import QuarterInfoCard from '@/components/city/QuarterInfoCard'
import PropertyCard from '@/components/cards/PropertyCard'
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
  const quarter: Quarter = data.quarter ?? (
    allQuarters.find(q => q.slug === params.quarter) ?? {
      id: 0, city_id: 0, city_slug: params.slug, city_name: city.name,
      name: params.quarter, slug: params.quarter,
      description: null, image_url: null, population: null, area_km2: null, property_count: 0,
    }
  )
  const properties: Property[] = data.listings.data
  const total: number = data.listings.total
  const quarterDisplay: Quarter = { ...quarter, property_count: total }

  return (
    <div className="min-h-screen pb-[68px] relative">
      <div className="fixed inset-0 -z-10" style={{ background: 'var(--bg-base)' }} />
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8" style={{ paddingTop: 88 }}>

        {/* Breadcrumb */}
        <div className="mb-3">
          <Breadcrumb items={[
            { label: 'Начало', href: '/' },
            { label: 'Градове', href: '/buy' },
            { label: city?.name ?? params.slug, href: '/cities/burgas' },
            { label: quarterDisplay.name },
          ]} />
        </div>

        {/* Search + Quarter info */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-6">
          <SearchWidget
            cities={FALLBACK_CITIES}
            initialCity={params.slug}
            initialQuarter={params.quarter}
            initialQuarters={allQuarters}
            compact
          />
          <QuarterInfoCard quarter={quarterDisplay} />
        </div>

        {/* Properties header */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="font-display text-themed-primary" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)' }}>
              Имоти в {quarterDisplay.name}
            </h2>
            <p className="text-xs text-themed-secondary mt-0.5">
              Намерени: <span className="text-themed-primary font-medium">{total} обяви</span>
            </p>
          </div>
          <PropertyGridControls
            citySlug={params.slug}
            quarterSlug={params.quarter}
            currentSort={searchParams.sort ?? 'newest'}
          />
        </div>

        {/* Properties grid — normal scroll */}
        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-themed-secondary">Все още няма обяви в <span className="text-themed-primary">{quarterDisplay.name}</span>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}
