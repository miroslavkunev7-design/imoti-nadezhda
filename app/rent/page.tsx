import type { Metadata } from 'next'
import SearchWidget from '@/components/search/SearchWidget'
import PropertyCard from '@/components/cards/PropertyCard'
import ListingPageLayout from '@/components/layout/ListingPageLayout'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'

export const revalidate = 60
export const metadata: Metadata = { title: 'Под наем' }

async function getProperties(searchParams: Record<string, string>) {
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    return await getProperties(searchParams)
  } catch {
    return { data: [] as Property[], total: 0, page: 1, per_page: 12, total_pages: 0 }
  }
}

export default async function RentPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { data: properties, total } = await getProperties(searchParams)

  return (
    <ListingPageLayout citySlug={searchParams.city ?? null} title="Под наем" subtitle={`${total} обяви`}>
      <div className="mb-6">
        <SearchWidget cities={FALLBACK_CITIES} initialCity={searchParams.city} compact variant="burgundy" />
      </div>
      {properties.length === 0 ? (
        <div className="py-20 text-center" style={{ color: '#7A0D28' }}>Няма намерени имоти под наем.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} luxury />)}
        </div>
      )}
    </ListingPageLayout>
  )
}
