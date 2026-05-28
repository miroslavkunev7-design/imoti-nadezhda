import type { Metadata } from 'next'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchBar from '@/components/search/LuxurySearchBar'
import LuxuryPropertyCard from '@/components/cards/LuxuryPropertyCard'
import { FALLBACK_CITIES } from '@/lib/data/fallback'
import type { Property } from '@/types'

export const revalidate = 60
export const metadata: Metadata = { title: 'За продажба' }

async function getProperties(searchParams: Record<string, string>) {
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    return await getProperties(searchParams)
  } catch {
    return { data: [] as Property[], total: 0, page: 1, per_page: 12, total_pages: 0 }
  }
}

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const { data: properties, total } = await getProperties(searchParams)
  const citySlug = searchParams.city ?? null

  return (
    <div>
      <TerraceHero citySlug={citySlug} className="lux-detail-hero" />

      <div
        className="max-w-[1280px] mx-auto px-5 lg:px-8 relative z-10"
        style={{ marginTop: -48, paddingBottom: 64 }}
      >
        <div className="mb-6">
          <LuxurySearchBar
            cities={FALLBACK_CITIES}
            initialCity={citySlug ?? ''}
            variant="burgundy"
          />
        </div>

        <div className="mb-6">
          <h1
            className="font-display font-bold"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: '#6B001C' }}
          >
            Имоти за продажба
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b4a52' }}>
            Намерени: <strong>{total}</strong> обяви
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="lux-content-panel text-center py-16">
            <p style={{ color: '#6b4a52' }}>Няма намерени имоти по зададените критерии.</p>
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
