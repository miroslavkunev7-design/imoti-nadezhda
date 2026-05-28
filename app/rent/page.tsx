import type { Metadata } from 'next'
import SearchWidget from '@/components/search/SearchWidget'
import PropertyCard from '@/components/cards/PropertyCard'
import TerraceHero from '@/components/layout/TerraceHero'
import CityPanoramaSync from '@/components/layout/CityPanoramaSync'
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
  const citySlug = searchParams.city ?? 'shumen'

  return (
    <div className="min-h-screen">
      <CityPanoramaSync citySlug={citySlug} />

      <div className="-mt-[96px]" style={{ marginTop: -96 }}>
        <TerraceHero citySlug={citySlug} height={320} overlay="strong" />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-8">
        <div className="mb-6 -mt-16 relative z-10">
          <SearchWidget
            cities={FALLBACK_CITIES}
            initialCity={searchParams.city}
            compact
            variant="burgundy"
          />
        </div>

        <div className="mb-6">
          <h1 className="font-display" style={{ fontSize: 'clamp(1.25rem,2vw,1.6rem)', color: '#6B001C' }}>
            Имоти под наем
          </h1>
          <p className="text-xs mt-1" style={{ color: '#7A0D28' }}>
            Намерени: <span className="font-semibold" style={{ color: '#6B001C' }}>{total} обяви</span>
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <p style={{ color: '#7A0D28' }}>Няма намерени имоти под наем по зададените критерии.</p>
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
