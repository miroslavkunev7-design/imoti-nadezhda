import { FALLBACK_CITIES, QUARTERS_BY_CITY } from '@/lib/data/fallback'
import { mapPropertyRow } from '@/lib/db/mappers'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import {
  listLocalProperties,
  localToPropertyRow,
  type StoredProperty,
} from '@/lib/local-store/properties'
import type { PaginatedResult, Property, SearchParams } from '@/types'

export function resolveCityNames(slugOrName: string) {
  const city = FALLBACK_CITIES.find(c => c.slug === slugOrName)
  return { slug: city?.slug ?? slugOrName, name: city?.name ?? slugOrName }
}

export function resolveQuarterNames(citySlug: string, slugOrName: string) {
  const quarters = QUARTERS_BY_CITY[citySlug] ?? []
  const q = quarters.find(item => item.slug === slugOrName)
  return { slug: q?.slug ?? slugOrName, name: q?.name ?? slugOrName }
}

export function storedToProperty(p: StoredProperty): Property {
  const property = mapPropertyRow(localToPropertyRow(p))
  property.images = p.images.map((url, i) => ({
    id: i + 1,
    property_id: p.id,
    image_url: resolveMediaUrl(url) ?? url,
    is_primary: i === 0,
    sort_order: i,
  }))
  property.features = p.features
  return property
}

function matchesCity(property: Property, cityParam: string): boolean {
  const { slug, name } = resolveCityNames(cityParam)
  const cityName = property.city_name?.toLowerCase() ?? ''
  const citySlug = property.city_slug?.toLowerCase() ?? ''
  return (
    citySlug === slug.toLowerCase() ||
    cityName === slug.toLowerCase() ||
    cityName === name.toLowerCase()
  )
}

function matchesQuarter(property: Property, cityParam: string, quarterParam: string): boolean {
  const citySlug =
    property.city_slug ??
    FALLBACK_CITIES.find(c => c.name === property.city_name)?.slug ??
    cityParam
  const { slug, name } = resolveQuarterNames(citySlug, quarterParam)
  const quarterName = property.quarter_name?.toLowerCase() ?? ''
  const quarterSlug = property.quarter_slug?.toLowerCase() ?? ''
  return (
    quarterSlug === slug.toLowerCase() ||
    quarterName === slug.toLowerCase() ||
    quarterName === name.toLowerCase()
  )
}

export function propertyMatchesSearch(property: Property, params: SearchParams): boolean {
  if (property.status !== 'active') return false

  if (params.city && !matchesCity(property, params.city)) return false
  if (params.quarter && !matchesQuarter(property, params.city ?? '', params.quarter)) return false

  if (params.type && property.type !== params.type) return false
  if (params.price_min && property.price_eur < Number(params.price_min)) return false
  if (params.price_max && property.price_eur > Number(params.price_max)) return false
  if (params.bedrooms) {
    const n = Number(params.bedrooms)
    if (n >= 4 ? (property.bedrooms ?? 0) < 4 : property.bedrooms !== n) return false
  }
  if (params.bathrooms) {
    const n = Number(params.bathrooms)
    if (n >= 4 ? (property.bathrooms ?? 0) < 4 : property.bathrooms !== n) return false
  }
  if (params.area_min && property.area_sqm < Number(params.area_min)) return false
  if (params.area_max && property.area_sqm > Number(params.area_max)) return false

  if (params.features) {
    const feats = params.features.split(',').filter(Boolean)
    if (feats.length && !feats.every(f => property.features?.includes(f))) return false
  }

  return true
}

export async function getLocalPropertiesMatching(params: SearchParams): Promise<Property[]> {
  const locals = await listLocalProperties()
  return locals
    .filter(p => p.status === 'available')
    .map(storedToProperty)
    .filter(p => propertyMatchesSearch(p, params))
}

function sortProperties(items: Property[], sort = 'newest'): Property[] {
  const sorted = [...items]
  switch (sort) {
    case 'price_asc':
      sorted.sort((a, b) => a.price_eur - b.price_eur)
      break
    case 'price_desc':
      sorted.sort((a, b) => b.price_eur - a.price_eur)
      break
    case 'area_desc':
      sorted.sort((a, b) => b.area_sqm - a.area_sqm)
      break
    default:
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
  return sorted
}

export function mergePropertyLists(
  dbRows: Property[],
  localRows: Property[],
  page: number,
  perPage: number,
  sort = 'newest'
): PaginatedResult<Property> {
  const byId = new Map<number, Property>()
  for (const p of dbRows) byId.set(p.id, p)
  for (const p of localRows) byId.set(p.id, p)

  const merged = sortProperties(Array.from(byId.values()), sort)
  const total = merged.length
  const offset = (page - 1) * perPage

  return {
    data: merged.slice(offset, offset + perPage),
    total,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(total / perPage)),
  }
}

export async function countLocalPropertiesForQuarter(
  citySlug: string,
  quarterSlug: string
): Promise<number> {
  const locals = await getLocalPropertiesMatching({ city: citySlug, quarter: quarterSlug })
  return locals.length
}
