import { query, queryOne, execute } from '@/lib/db'
import {
  mapPropertyImageRow,
  mapPropertyRow,
  PROPERTY_LOCATION_JOINS,
  PROPERTY_LIST_IMAGE,
  PROPERTY_PRIMARY_IMAGE,
} from '@/lib/db/mappers'
import {
  getLocalPropertiesMatching,
  mergePropertyLists,
  resolveCityNames,
  resolveQuarterNames,
  storedToProperty,
} from '@/lib/properties/merge-local'
import { getLocalProperty, localToPropertyRow } from '@/lib/local-store/properties'
import { FALLBACK_CITIES, QUARTERS_BY_CITY } from '@/lib/data/fallback'
import type { Property, SearchParams, PaginatedResult } from '@/types'

const PER_PAGE = 12

const SORT_MAP: Record<string, string> = {
  newest:     'p.created_at DESC',
  price_asc:  'p.price ASC',
  price_desc: 'p.price DESC',
  area_desc:  'p.area DESC',
}

/** Build WHERE clause from SearchParams (host schema) */
function buildWhere(params: SearchParams) {
  const conditions: string[] = ["p.status = 'available'"]
  const values: (string | number | boolean | null)[] = []

  if (params.city) {
    const { slug, name } = resolveCityNames(params.city)
    conditions.push('(c.slug = ? OR LOWER(p.city) = LOWER(?) OR LOWER(p.city) = LOWER(?))')
    values.push(slug, slug, name)
  }
  if (params.quarter) {
    const { slug, name } = resolveQuarterNames(params.city ?? '', params.quarter)
    conditions.push('(q.slug = ? OR LOWER(p.quarter) = LOWER(?) OR LOWER(p.quarter) = LOWER(?))')
    values.push(slug, slug, name)
  }
  if (params.type) {
    conditions.push('p.property_type = ?')
    values.push(params.type)
  }
  if (params.price_min) {
    conditions.push('p.price >= ?')
    values.push(Number(params.price_min))
  }
  if (params.price_max) {
    conditions.push('p.price <= ?')
    values.push(Number(params.price_max))
  }
  if (params.bathrooms) {
    const n = Number(params.bathrooms)
    conditions.push(n >= 4 ? 'p.bathrooms >= 4' : 'p.bathrooms = ?')
    if (n < 4) values.push(n)
  }
  if (params.bedrooms) {
    const n = Number(params.bedrooms)
    conditions.push(n >= 4 ? 'p.bedrooms >= 4' : 'p.bedrooms = ?')
    if (n < 4) values.push(n)
  }
  if (params.area_min) {
    conditions.push('p.area >= ?')
    values.push(Number(params.area_min))
  }
  if (params.area_max) {
    conditions.push('p.area <= ?')
    values.push(Number(params.area_max))
  }

  return { where: conditions.join(' AND '), values }
}

/** Paginated property list with filters */
export async function getProperties(
  params: SearchParams
): Promise<PaginatedResult<Property>> {
  const page    = Math.max(1, Number(params.page || 1))
  const orderBy = SORT_MAP[params.sort || 'newest'] ?? SORT_MAP.newest

  const { where, values } = buildWhere(params)

  let featureJoin = ''
  if (params.features) {
    const feats = params.features.split(',').filter(Boolean)
    if (feats.length) {
      featureJoin = feats
        .map(() => `AND EXISTS (SELECT 1 FROM property_features pf WHERE pf.property_id = p.id AND pf.feature_name = ?)`)
        .join(' ')
      values.push(...feats)
    }
  }

  const baseSQL = `
    FROM properties p
    ${PROPERTY_LOCATION_JOINS}
    WHERE ${where} ${featureJoin}
  `

  const dbLimit = Math.min(PER_PAGE * page + 24, 120)

  const [rows, localRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT
         p.*,
         c.name  AS city_name,  c.slug  AS city_slug,
         q.name  AS quarter_name, q.slug AS quarter_slug,
         ${PROPERTY_LIST_IMAGE}
       ${baseSQL}
       ORDER BY ${orderBy}
       LIMIT ${dbLimit}`,
      values
    ),
    getLocalPropertiesMatching(params),
  ])

  return mergePropertyLists(
    rows.map(mapPropertyRow),
    localRows,
    page,
    PER_PAGE,
    params.sort ?? 'newest'
  )
}

/** Featured properties — by views (host has no is_featured flag) */
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const [rows, localRows] = await Promise.all([
    query<Record<string, unknown>>(`
      SELECT p.*,
        c.name AS city_name, c.slug AS city_slug,
        q.name AS quarter_name, q.slug AS quarter_slug,
        ${PROPERTY_LIST_IMAGE}
      FROM properties p
      ${PROPERTY_LOCATION_JOINS}
      WHERE p.status = 'available'
      ORDER BY p.views DESC, p.created_at DESC
      LIMIT ?
    `, [limit]),
    getLocalPropertiesMatching({}),
  ])

  const db = rows.map(r => mapPropertyRow({ ...r, is_featured: true }))
  const merged = mergePropertyLists(db, localRows.map(p => ({ ...p, is_featured: true })), 1, limit, 'newest')
  return merged.data
}

/** Newest properties */
export async function getNewestProperties(limit = 6): Promise<Property[]> {
  const [rows, localRows] = await Promise.all([
    query<Record<string, unknown>>(`
      SELECT p.*,
        c.name AS city_name, c.slug AS city_slug,
        q.name AS quarter_name, q.slug AS quarter_slug,
        ${PROPERTY_LIST_IMAGE}
      FROM properties p
      ${PROPERTY_LOCATION_JOINS}
      WHERE p.status = 'available'
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limit]),
    getLocalPropertiesMatching({}),
  ])

  const merged = mergePropertyLists(rows.map(mapPropertyRow), localRows, 1, limit, 'newest')
  return merged.data
}

/** Full property detail by ID */
export async function getPropertyById(id: number): Promise<Property | null> {
  const row = await queryOne<Record<string, unknown>>(`
    SELECT p.*,
      c.name AS city_name, c.slug AS city_slug,
      q.name AS quarter_name, q.slug AS quarter_slug,
      ${PROPERTY_PRIMARY_IMAGE}
    FROM properties p
    ${PROPERTY_LOCATION_JOINS}
    WHERE p.id = ? AND p.status = 'available'
  `, [id])

  if (row) {
    const property = mapPropertyRow(row)

    const [images, featureRows] = await Promise.all([
      query<Record<string, unknown>>(
        `SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC`,
        [id]
      ),
      query<{ feature_name: string }>(
        `SELECT feature_name FROM property_features WHERE property_id = ?`,
        [id]
      ),
    ])

    property.images   = images.map(mapPropertyImageRow)
    property.features = featureRows.map(r => r.feature_name).filter(Boolean)

    return property
  }

  const local = await getLocalProperty(id)
  if (!local || local.status !== 'available') return null

  const property = storedToProperty(local)
  return property
}

/** Increment view count */
export async function incrementViews(id: number): Promise<void> {
  await execute(`UPDATE properties SET views = views + 1 WHERE id = ?`, [id])
}

/** Properties by same quarter (related listings) */
export async function getRelatedProperties(
  propertyId: number,
  cityName: string,
  quarterName: string,
  limit = 4
): Promise<Property[]> {
  const city = FALLBACK_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase())
  const quarterSlug =
    (city ? QUARTERS_BY_CITY[city.slug] : [])?.find(q => q.name.toLowerCase() === quarterName.toLowerCase())?.slug

  const [rows, localRows] = await Promise.all([
    query<Record<string, unknown>>(`
      SELECT p.*,
        c.name AS city_name, c.slug AS city_slug,
        q.name AS quarter_name, q.slug AS quarter_slug,
        ${PROPERTY_LIST_IMAGE}
      FROM properties p
      ${PROPERTY_LOCATION_JOINS}
      WHERE LOWER(p.city) = LOWER(?)
        AND LOWER(p.quarter) = LOWER(?)
        AND p.id != ?
        AND p.status = 'available'
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [cityName, quarterName, propertyId, limit]),
    city && quarterSlug
      ? getLocalPropertiesMatching({ city: city.slug, quarter: quarterSlug })
      : Promise.resolve([]),
  ])

  const merged = mergePropertyLists(
    rows.map(mapPropertyRow),
    localRows.filter(p => p.id !== propertyId),
    1,
    limit,
    'newest'
  )
  return merged.data
}
