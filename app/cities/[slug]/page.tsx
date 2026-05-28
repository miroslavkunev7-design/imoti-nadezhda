import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'
import LuxurySearchBar from '@/components/search/LuxurySearchBar'
import CityInfoCard from '@/components/city/CityInfoCard'
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
    })),
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
    <div className="pb-16">
      <TerraceHero citySlug={city.slug} className="lux-detail-hero" />

      <div
        className="max-w-[1280px] mx-auto px-5 lg:px-8 relative z-10"
        style={{ marginTop: -40, paddingTop: 24 }}
      >
        <div className="mb-3">
          <Breadcrumb
            items={[
              { label: 'Начало', href: '/' },
              { label: 'Градове' },
              { label: city.name },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-8">
          <LuxurySearchBar
            cities={FALLBACK_CITIES}
            initialCity={city.slug}
            initialQuarters={quarters}
          />
          <div className="lux-detail-panel overflow-hidden">
            <CityInfoCard city={city} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-display font-bold"
            style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: '#6B001C' }}
          >
            Квартали в {city.name}
          </h2>
          <a
            href={`/buy?city=${city.slug}`}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: '#A97A1F' }}
          >
            Виж всички имоти
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 quarters-scroll"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {quarters.map((q, i) => (
            <div
              key={q.id}
              className="flex-shrink-0 lux-detail-panel overflow-hidden"
              style={{
                scrollSnapAlign: 'start',
                width: 'clamp(180px, 20vw, 240px)',
                height: 200,
              }}
            >
              <NeighborhoodCard quarter={q} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
