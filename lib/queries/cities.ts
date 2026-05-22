import { query, queryOne } from '@/lib/db'
import { mapCityRow, mapQuarterRow, PROPERTY_LOCATION_JOINS } from '@/lib/db/mappers'
import type { City, Quarter } from '@/types'

/** All cities with property/quarter counts (InfinityFree host schema) */
export async function getAllCities(): Promise<City[]> {
  const rows = await query<Record<string, unknown>>(`
    SELECT
      c.*,
      COUNT(DISTINCT q.id) AS quarter_count,
      COUNT(DISTINCT p.id) AS property_count
    FROM cities c
    LEFT JOIN quarters q ON q.city_id = c.id
    LEFT JOIN properties p ON LOWER(p.city) = LOWER(c.name) AND p.status = 'available'
    GROUP BY c.id
    ORDER BY c.id ASC, c.name ASC
  `)
  return rows.map(mapCityRow)
}

/** Single city by slug */
export async function getCityBySlug(slug: string): Promise<City | null> {
  const row = await queryOne<Record<string, unknown>>(
    `SELECT
      c.*,
      COUNT(DISTINCT q.id) AS quarter_count,
      COUNT(DISTINCT p.id) AS property_count
     FROM cities c
     LEFT JOIN quarters q ON q.city_id = c.id
     LEFT JOIN properties p ON LOWER(p.city) = LOWER(c.name) AND p.status = 'available'
     WHERE c.slug = ?
     GROUP BY c.id`,
    [slug]
  )
  return row ? mapCityRow(row) : null
}

/** All quarters for a city, with property counts */
export async function getQuartersByCity(citySlug: string): Promise<Quarter[]> {
  const rows = await query<Record<string, unknown>>(`
    SELECT
      q.*,
      c.slug AS city_slug,
      c.name AS city_name,
      COUNT(p.id) AS property_count
    FROM quarters q
    JOIN cities c ON c.id = q.city_id
    LEFT JOIN properties p
      ON LOWER(p.city) = LOWER(c.name)
      AND LOWER(p.quarter) = LOWER(q.name)
      AND p.status = 'available'
    WHERE c.slug = ?
    GROUP BY q.id
    ORDER BY property_count DESC, q.name ASC
  `, [citySlug])
  return rows.map(mapQuarterRow)
}

/** Single quarter by city slug + quarter slug */
export async function getQuarterBySlug(
  citySlug: string,
  quarterSlug: string
): Promise<Quarter | null> {
  const row = await queryOne<Record<string, unknown>>(`
    SELECT
      q.*,
      c.slug AS city_slug,
      c.name AS city_name,
      COUNT(p.id) AS property_count
    FROM quarters q
    JOIN cities c ON c.id = q.city_id
    LEFT JOIN properties p
      ON LOWER(p.city) = LOWER(c.name)
      AND LOWER(p.quarter) = LOWER(q.name)
      AND p.status = 'available'
    WHERE c.slug = ? AND q.slug = ?
    GROUP BY q.id
  `, [citySlug, quarterSlug])
  return row ? mapQuarterRow(row) : null
}
