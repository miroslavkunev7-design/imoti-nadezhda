import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import SearchWidget from '@/components/search/SearchWidget'
import CityInfoCard from '@/components/city/CityInfoCard'
import NeighborhoodCard from '@/components/cards/NeighborhoodCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ListingPageLayout from '@/components/layout/ListingPageLayout'
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
    <ListingPageLayout citySlug={city.slug} title={city.name} subtitle={`${quarters.length} квартала`}>
      <div className="mb-3">
        <Breadcrumb items={[{ label: 'Начало', href: '/' }, { label: 'Градове' }, { label: city.name }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-8">
        <SearchWidget cities={FALLBACK_CITIES} initialCity={city.slug} initialQuarters={quarters} compact variant="burgundy" />
        <CityInfoCard city={city} />
      </div>
      <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', color: '#6B001C' }}>
        Квартали в {city.name}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 quarters-scroll">
        {quarters.map((q, i) => (
          <div key={q.id} className="flex-shrink-0" style={{ width: 'clamp(180px, 20vw, 240px)', height: 200 }}>
            <NeighborhoodCard quarter={q} index={i} />
          </div>
        ))}
      </div>
    </ListingPageLayout>
  )
}
