import type { Metadata } from 'next'
import { Suspense } from 'react'
import PropertyCard from '@/components/cards/PropertyCard'
import BuyListingsClient from '@/components/search/BuyListingsClient'
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

  return (
    <>
      <Suspense fallback={<div className="lux-terrace lux-terrace--band" />}>
        <BuyListingsClient cities={FALLBACK_CITIES} initialCity={searchParams.city} />
      </Suspense>

      <div
        className="max-w-[1280px] mx-auto px-5 lg:px-8 pb-16"
        style={{ marginTop: -48, position: 'relative', zIndex: 5 }}
      >
        <div className="mb-6">
          <h1 className="lux-section-title">Имоти за продажба</h1>
          <p style={{ color: 'var(--lux-text-muted)', fontSize: 14 }}>
            Намерени: <strong style={{ color: 'var(--lux-burgundy)' }}>{total}</strong> обяви
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="lux-content-card text-center py-16">
            <p style={{ color: 'var(--lux-text-muted)' }}>
              Няма намерени имоти по зададените критерии.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
