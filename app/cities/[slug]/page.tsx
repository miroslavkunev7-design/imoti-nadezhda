import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import SearchWidget from '@/components/search/SearchWidget'
import CityInfoCard from '@/components/city/CityInfoCard'
import NeighborhoodCard from '@/components/cards/NeighborhoodCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import TerraceHero from '@/components/layout/TerraceHero'
import CityPanoramaSync from '@/components/layout/CityPanoramaSync'
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
    <div className="min-h-screen">
      <CityPanoramaSync citySlug={city.slug} />

      <div className="-mt-[96px]" style={{ marginTop: -96 }}>
        <TerraceHero citySlug={city.slug} height={300} overlay="strong" />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-8">
        <div className="mb-3">
          <Breadcrumb items={[
            { label: 'Начало', href: '/' },
            { label: 'За продажба', href: '/buy' },
            { label: city.name },
          ]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-8 -mt-12 relative z-10">
          <SearchWidget
            cities={FALLBACK_CITIES}
            initialCity={city.slug}
            initialQuarters={quarters}
            compact
            variant="burgundy"
          />
          <CityInfoCard city={city} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: '#6B001C' }}>
            Квартали в {city.name}
          </h2>
          <a
            href={`/buy?city=${city.slug}`}
            className="text-xs transition-colors flex items-center gap-1 font-medium"
            style={{ color: '#CFA54A' }}
          >
            Виж всички имоти
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
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

        <p className="text-xs mt-1 text-center pb-4" style={{ color: '#9A7080' }}>
          {quarters.length} квартала • плъзни настрани за повече
        </p>
      </div>
    </div>
  )
}
