import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import CityPageClient from '@/components/city/CityPageClient'
import NeighborhoodCard from '@/components/cards/NeighborhoodCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import { countLocalPropertiesForQuarter } from '@/lib/properties/merge-local'
import type { City, Quarter } from '@/types'

export const revalidate = 120
interface PageProps { params: { slug: string } }

const getData = cache(async (slug: string): Promise<{ city: City; quarters: Quarter[] } | null> => {
  const city = FALLBACK_CITIES.find(c => c.slug === slug)
  if (!city) return null

  const baseQuarters = getQuartersForCity(slug)
  const quarters = await Promise.all(
    baseQuarters.map(async q => ({
      ...q,
      property_count: await countLocalPropertiesForQuarter(slug, q.slug),
    }))
  )

  return { city, quarters }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getData(params.slug)
  if (!data) return { title: 'Град не е намерен' }
  return { title: `Имоти в ${data.city.name}` }
}

export async function generateStaticParams() {
  return FALLBACK_CITIES.map(c => ({ slug: c.slug }))
}

export default async function CityPage({ params }: PageProps) {
  const data = await getData(params.slug)
  if (!data) notFound()
  const { city, quarters } = data

  return (
    <>
      <CityPageClient city={city} cities={FALLBACK_CITIES} quarters={quarters} />

      <div
        className="max-w-[1280px] mx-auto px-5 lg:px-8 pb-16"
        style={{ marginTop: -32, position: 'relative', zIndex: 5 }}
      >
        <div className="mb-4">
          <Breadcrumb items={[
            { label: 'Начало', href: '/' },
            { label: 'Градове' },
            { label: city.name },
          ]} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="lux-section-title">Квартали в {city.name}</h2>
          <a
            href={`/buy?city=${city.slug}`}
            className="text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--lux-gold-deep)' }}
          >
            Виж всички имоти →
          </a>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 quarters-scroll"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {quarters.map((q, i) => (
            <div
              key={q.id}
              className="flex-shrink-0"
              style={{ scrollSnapAlign: 'start', width: 'clamp(180px, 20vw, 240px)', height: 200 }}
            >
              <NeighborhoodCard quarter={q} index={i} />
            </div>
          ))}
        </div>

        <p className="text-xs text-center pb-4" style={{ color: 'var(--lux-text-muted)' }}>
          {quarters.length} квартала • плъзни настрани за повече
        </p>
      </div>
    </>
  )
}
