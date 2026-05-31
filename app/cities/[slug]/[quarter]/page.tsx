import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FALLBACK_CITIES, getQuartersForCity } from '@/lib/data/fallback'
import type { Quarter, Property } from '@/types'
import RdPropertyCard from '@/components/cards/RdPropertyCard'
import CityHeroBand from '@/components/city/CityHeroBand'

export const revalidate = 60

interface PageProps {
  params: { slug: string; quarter: string }
  searchParams: { sort?: string; page?: string }
}

async function getData(citySlug: string, quarterSlug: string, sort = 'newest', page = '1') {
  try {
    const { getProperties } = await import('@/lib/queries/properties')
    const allQuarters = getQuartersForCity(citySlug)
    const quarter = allQuarters.find(q => q.slug === quarterSlug) ?? null
    const listings = await getProperties({ city: citySlug, quarter: quarterSlug, sort: sort as 'newest', page })
    return { quarter, allQuarters, listings }
  } catch {
    return { quarter: null, allQuarters: getQuartersForCity(citySlug), listings: { data: [] as Property[], total: 0 } }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = FALLBACK_CITIES.find(c => c.slug === params.slug)
  return { title: `Имоти в кв. ${params.quarter}${city ? `, ${city.name}` : ''} — Имоти Надежда` }
}

export default async function NeighborhoodPage({ params, searchParams }: PageProps) {
  if (params.slug === 'burgas') {
    redirect(`/cities/burgas/${params.quarter}`)
  }

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

  return (
    <div className="rd-quarter-detail">
      <CityHeroBand city={city} />

      <div className="rd-body">
        {/* Breadcrumb */}
        <nav className="rd-breadcrumb" aria-label="Навигация">
          <Link href="/" style={{ color: 'rgba(107,0,28,0.55)', textDecoration: 'none' }}>Начало</Link>
          <span className="rd-breadcrumb__sep">/</span>
          <Link href="/buy" style={{ color: 'rgba(107,0,28,0.55)', textDecoration: 'none' }}>Градове</Link>
          <span className="rd-breadcrumb__sep">/</span>
          <Link href={`/cities/${params.slug}`} style={{ color: 'rgba(107,0,28,0.55)', textDecoration: 'none' }}>{city.name}</Link>
          <span className="rd-breadcrumb__sep">/</span>
          <span className="rd-breadcrumb__current">{quarter.name}</span>
        </nav>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(1.3rem,2.2vw,1.7rem)', fontWeight: 700, color: '#6b001c', margin: '0 0 4px' }}>
              Имоти в кв. {quarter.name}, {city.name}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(107,0,28,0.6)', margin: 0 }}>
              Намерени <strong>{total}</strong> имота
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} aria-label="Сортиране">
            {[
              { href: `/cities/${params.slug}/${params.quarter}`, label: 'Актуални', active: !searchParams.sort },
              { href: `/cities/${params.slug}/${params.quarter}?sort=price_asc`, label: 'Цена ↑', active: searchParams.sort === 'price_asc' },
              { href: `/cities/${params.slug}/${params.quarter}?sort=price_desc`, label: 'Цена ↓', active: searchParams.sort === 'price_desc' },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid rgba(107,0,28,0.18)',
                  fontSize: 12,
                  color: item.active ? '#fff' : '#6b001c',
                  background: item.active ? '#6b001c' : '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(107,0,28,0.5)' }}>
            Все още няма обяви в <strong>{quarter.name}</strong>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {properties.map((p, i) => (
              <RdPropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
