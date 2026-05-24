import type { Metadata } from 'next'
import SearchWidget from '@/components/search/SearchWidget'
import PropertyCard from '@/components/cards/PropertyCard'
import BuySellBackground from '@/components/layout/BuySellBackground'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'

export const revalidate = 60
export const metadata: Metadata = { title: 'Купи имот' }

async function getProperties(searchParams: Record<string, string>) {
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    return await getProperties(searchParams)
  } catch {
    return { data: [] as Property[], total: 0, page: 1, per_page: 12, total_pages: 0 }
  }
}

export default async function BuyPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { data: properties, total } = await getProperties(searchParams)

  return (
    <div className="min-h-screen pb-[68px] relative">
      <BuySellBackground />
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8" style={{ paddingTop: 88 }}>

        {/* Search */}
        <div className="mb-5">
          <SearchWidget cities={FALLBACK_CITIES} initialCity={searchParams.city} compact />
        </div>

        {/* Header */}
        <div className="mb-4">
          <h1 className="font-display text-themed-primary" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)' }}>
            Всички имоти
          </h1>
          <p className="text-xs text-themed-secondary mt-0.5">
            Намерени: <span className="text-themed-primary font-medium">{total} обяви</span>
          </p>
        </div>

        {/* Results */}
        {properties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-themed-secondary">Няма намерени имоти по зададените критерии.</p>
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
