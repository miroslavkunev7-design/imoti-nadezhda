import type { City, Property, PropertyImage, Quarter } from '@/types'
import { resolveMediaUrl } from '@/lib/upload-bridge'

/** Host DB uses `available` — app UI uses `active`; keep pending as-is */
export function mapPropertyStatus(status: string | null | undefined): string {
  if (status === 'available') return 'active'
  if (status === 'pending') return 'pending'
  return status ?? 'active'
}

export function toHostPropertyStatus(status: string): string {
  if (status === 'active') return 'available'
  if (status === 'pending') return 'pending'
  return status
}

export function mapUserRole(role: string): string {
  if (role === 'broker') return 'agent'
  return role
}

export function toHostUserRole(role: string): string {
  if (role === 'agent') return 'broker'
  return role
}

export function mapClientStatus(status: string): string {
  if (status === 'active') return 'lead'
  if (status === 'inactive') return 'lost'
  return status
}

export function toHostClientStatus(status: string): string {
  if (status === 'lead' || status === 'closed') return 'active'
  if (status === 'lost') return 'inactive'
  return status === 'active' || status === 'inactive' ? status : 'active'
}

export function isPropertyNew(createdAt: string | Date | null | undefined): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt)
  const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
  return days <= 30
}

type RawPropertyRow = Record<string, unknown>

export function mapPropertyRow(row: RawPropertyRow): Property {
  const price = Number(row.price_eur ?? row.price ?? 0)
  const area = Number(row.area_sqm ?? row.area ?? 0)
  const furnishedRaw = row.furnished
  const furnished =
    furnishedRaw === true ||
    furnishedRaw === 1 ||
    furnishedRaw === 'yes' ||
    furnishedRaw === '1'

  return {
    id: Number(row.id),
    city_id: Number(row.city_id ?? 0),
    quarter_id: Number(row.quarter_id ?? 0),
    user_id: Number(row.user_id ?? 0),
    title: String(row.title ?? ''),
    type: String(row.type ?? row.property_type ?? 'Апартамент') as Property['type'],
    detailed_type: row.detailed_type ? String(row.detailed_type) : null,
    price_eur: price,
    area_sqm: area,
    floor: row.floor != null ? Number(row.floor) : null,
    total_floors: row.total_floors != null ? Number(row.total_floors) : null,
    bedrooms: row.bedrooms != null ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms != null ? Number(row.bathrooms) : null,
    orientation: row.orientation ? String(row.orientation) : null,
    construction: row.construction ? String(row.construction) : null,
    year_built: row.year_built != null ? Number(row.year_built) : null,
    condition: row.condition ? String(row.condition) : null,
    elevator: Boolean(row.elevator),
    furnished,
    heating: row.heating ? String(row.heating) : null,
    is_featured: Boolean(row.is_featured),
    is_new: row.is_new != null ? Boolean(row.is_new) : isPropertyNew(String(row.created_at ?? '')),
    status: mapPropertyStatus(String(row.status ?? 'available')) as Property['status'],
    views: Number(row.views ?? 0),
    description: row.description ? String(row.description) : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    city_name: row.city_name ? String(row.city_name) : row.city ? String(row.city) : undefined,
    city_slug: row.city_slug ? String(row.city_slug) : undefined,
    quarter_name: row.quarter_name ? String(row.quarter_name) : row.quarter ? String(row.quarter) : undefined,
    quarter_slug: row.quarter_slug ? String(row.quarter_slug) : undefined,
    primary_image: resolveMediaUrl(
      row.primary_image
        ? String(row.primary_image)
        : row.main_image
          ? String(row.main_image)
          : undefined
    ),
  }
}

export function mapPropertyImageRow(row: Record<string, unknown>): PropertyImage {
  return {
    id: Number(row.id),
    property_id: Number(row.property_id),
    image_url: resolveMediaUrl(String(row.image_url ?? row.image_path ?? '')) ?? '',
    is_primary: Boolean(row.is_primary ?? row.sort_order === 0),
    sort_order: Number(row.sort_order ?? 0),
  }
}

export function mapCityRow(row: Record<string, unknown>): City {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: row.description ? String(row.description) : null,
    image_url: row.image_url ? String(row.image_url) : row.image ? String(row.image) : null,
    population: row.population != null ? Number(row.population) : null,
    area_km2: row.area_km2 != null ? Number(row.area_km2) : null,
    region: row.region ? String(row.region) : null,
    sort_order: Number(row.sort_order ?? row.id ?? 0),
    property_count: row.property_count != null ? Number(row.property_count) : undefined,
    quarter_count: row.quarter_count != null ? Number(row.quarter_count) : undefined,
  }
}

export function mapQuarterRow(row: Record<string, unknown>): Quarter {
  return {
    id: Number(row.id),
    city_id: Number(row.city_id),
    city_slug: row.city_slug ? String(row.city_slug) : undefined,
    city_name: row.city_name ? String(row.city_name) : undefined,
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: row.description ? String(row.description) : null,
    image_url: row.image_url ? String(row.image_url) : row.image ? String(row.image) : null,
    population: row.population != null ? Number(row.population) : null,
    area_km2: row.area_km2 != null ? Number(row.area_km2) : null,
    property_count: row.property_count != null ? Number(row.property_count) : undefined,
  }
}

/** SQL fragment — join properties to cities/quarters by name (host schema) */
export const PROPERTY_LOCATION_JOINS = `
  LEFT JOIN cities c
    ON LOWER(c.name) = LOWER(p.city) OR c.slug = p.city
  LEFT JOIN quarters q
    ON q.city_id = c.id
    AND (LOWER(q.name) = LOWER(p.quarter) OR q.slug = p.quarter)
`

export const PROPERTY_LIST_IMAGE = `p.main_image AS primary_image`

export const PROPERTY_PRIMARY_IMAGE = `
  COALESCE(
    p.main_image,
    (SELECT pi.image_path FROM property_images pi
     WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC LIMIT 1)
  ) AS primary_image
`
