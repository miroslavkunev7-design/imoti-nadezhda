import type { Metadata } from 'next'
import PropertiesTable from '@/components/admin/PropertiesTable'
import { mapPropertyStatus, PROPERTY_LOCATION_JOINS } from '@/lib/db/mappers'
import { listLocalProperties } from '@/lib/local-store/properties'

export const metadata: Metadata = { title: 'Имоти' }
export const dynamic = 'force-dynamic'

async function getProperties() {
  const dbRows = await (async () => {
    try {
      const { query } = await import('@/lib/db')
      return await query<{
        id: number; title: string; property_type: string; price: number; status: string
        city: string; quarter: string; created_at: string
        city_slug: string; quarter_slug: string
      }>(`
        SELECT p.id, p.title, p.property_type, p.price, p.status, p.city, p.quarter, p.created_at,
          c.slug as city_slug, q.slug as quarter_slug
        FROM properties p
        ${PROPERTY_LOCATION_JOINS}
        ORDER BY p.created_at DESC`)
    } catch {
      return []
    }
  })()

  const localRows = await listLocalProperties()

  const mapped = [
    ...localRows.map(p => ({
      id: p.id,
      title: p.title,
      type: p.property_type,
      price_eur: p.price,
      status: mapPropertyStatus(p.status),
      city_name: p.city,
      quarter_name: p.quarter,
      created_at: p.created_at,
      city_slug: p.city_slug,
      quarter_slug: p.quarter_slug,
    })),
    ...dbRows.map(p => ({
      id: p.id,
      title: p.title,
      type: p.property_type,
      price_eur: Number(p.price),
      status: mapPropertyStatus(p.status),
      city_name: p.city,
      quarter_name: p.quarter,
      created_at: p.created_at,
      city_slug: p.city_slug ?? '',
      quarter_slug: p.quarter_slug ?? '',
    })),
  ]

  return mapped.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export default async function PropertiesPage() {
  const properties = await getProperties()
  return <PropertiesTable properties={properties} />
}
