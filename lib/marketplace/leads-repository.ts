import { execute, isDbConfigured, query, queryOne } from '@/lib/db'
import { buildDuplicateKey } from '@/lib/marketplace/duplicates'
import type { LeadStatus, MarketplaceLead, ScrapedListing } from '@/lib/marketplace/types'
import {
  createLocalLead,
  findLocalLeadByDuplicateKey,
  findLocalLeadByExternal,
  getLocalLead,
  listLocalLeads,
  updateLocalLead,
} from '@/lib/local-store/leads-queue'
import { toSlug } from '@/lib/utils'

const ENSURE_SQL = `
CREATE TABLE IF NOT EXISTS crm_leads_queue (
  id SERIAL PRIMARY KEY,
  source VARCHAR(64) NOT NULL DEFAULT 'realistimo',
  external_id VARCHAR(255),
  city VARCHAR(128) NOT NULL,
  city_slug VARCHAR(64),
  district VARCHAR(128) NOT NULL DEFAULT '',
  district_slug VARCHAR(64),
  title VARCHAR(512) NOT NULL,
  description TEXT,
  phone VARCHAR(64),
  price NUMERIC(12,2),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_review',
  source_url VARCHAR(512),
  property_type VARCHAR(128) DEFAULT 'Апартамент',
  area_sqm NUMERIC(10,2),
  duplicate_key VARCHAR(255),
  published_property_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_leads_external
  ON crm_leads_queue (source, external_id) WHERE external_id IS NOT NULL;
`

let tableEnsured = false

export async function ensureLeadsQueueTable(): Promise<void> {
  if (!isDbConfigured() || tableEnsured) return
  try {
    const getSql = (await import('@/lib/db')).default
    await getSql().query(ENSURE_SQL)
    tableEnsured = true
  } catch {
    tableEnsured = true
  }
}

function rowToLead(row: Record<string, unknown>): MarketplaceLead {
  let images: string[] = []
  if (Array.isArray(row.images)) images = row.images as string[]
  else if (typeof row.images === 'string') {
    try {
      images = JSON.parse(row.images) as string[]
    } catch {
      images = []
    }
  }

  return {
    id: Number(row.id),
    source: String(row.source ?? 'realistimo'),
    external_id: row.external_id != null ? String(row.external_id) : null,
    city: String(row.city ?? ''),
    city_slug: row.city_slug != null ? String(row.city_slug) : null,
    district: String(row.district ?? ''),
    district_slug: row.district_slug != null ? String(row.district_slug) : null,
    title: String(row.title ?? ''),
    description: row.description != null ? String(row.description) : null,
    phone: row.phone != null ? String(row.phone) : null,
    price: row.price != null ? Number(row.price) : null,
    images,
    status: String(row.status ?? 'pending_review') as LeadStatus,
    source_url: row.source_url != null ? String(row.source_url) : null,
    property_type: row.property_type != null ? String(row.property_type) : null,
    area_sqm: row.area_sqm != null ? Number(row.area_sqm) : null,
    duplicate_key: row.duplicate_key != null ? String(row.duplicate_key) : null,
    published_property_id:
      row.published_property_id != null ? Number(row.published_property_id) : null,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  }
}

export async function listLeads(status?: LeadStatus): Promise<MarketplaceLead[]> {
  await ensureLeadsQueueTable()
  if (!isDbConfigured()) return listLocalLeads(status)

  const sql = status
    ? `SELECT * FROM crm_leads_queue WHERE status = ? ORDER BY created_at DESC`
    : `SELECT * FROM crm_leads_queue ORDER BY created_at DESC`
  const rows = await query<Record<string, unknown>>(sql, status ? [status] : undefined)
  if (!rows.length) return listLocalLeads(status)
  return rows.map(rowToLead)
}

export async function getLead(id: number): Promise<MarketplaceLead | null> {
  await ensureLeadsQueueTable()
  if (!isDbConfigured()) return getLocalLead(id)
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM crm_leads_queue WHERE id = ?`,
    [id]
  )
  if (!row) return getLocalLead(id)
  return rowToLead(row)
}

export async function updateLead(
  id: number,
  patch: Partial<MarketplaceLead>
): Promise<MarketplaceLead | null> {
  await ensureLeadsQueueTable()
  const fields: string[] = []
  const params: (string | number | null)[] = []

  const map: Record<string, unknown> = {
    city: patch.city,
    city_slug: patch.city_slug,
    district: patch.district,
    district_slug: patch.district_slug,
    title: patch.title,
    description: patch.description,
    phone: patch.phone,
    price: patch.price,
    images: patch.images != null ? JSON.stringify(patch.images) : undefined,
    status: patch.status,
    property_type: patch.property_type,
    area_sqm: patch.area_sqm,
    duplicate_key: patch.duplicate_key,
    published_property_id: patch.published_property_id,
  }

  for (const [key, val] of Object.entries(map)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`)
      params.push(val as string | number | null)
    }
  }
  if (!fields.length) return getLead(id)

  fields.push(`updated_at = NOW()`)
  params.push(id)

  if (!isDbConfigured()) {
    const localPatch = { ...patch } as Partial<MarketplaceLead>
    if (patch.images) localPatch.images = patch.images
    return updateLocalLead(id, localPatch)
  }

  await execute(`UPDATE crm_leads_queue SET ${fields.join(', ')} WHERE id = ?`, params)
  return getLead(id)
}

async function existsDuplicate(listing: ScrapedListing): Promise<boolean> {
  const key = buildDuplicateKey(listing)
  if (isDbConfigured()) {
    const row = await queryOne<{ id: number }>(
      `SELECT id FROM crm_leads_queue WHERE duplicate_key = ? AND status != 'rejected' LIMIT 1`,
      [key]
    )
    if (row) return true
    if (listing.external_id) {
      const ext = await queryOne<{ id: number }>(
        `SELECT id FROM crm_leads_queue WHERE source = ? AND external_id = ? LIMIT 1`,
        [listing.source, listing.external_id]
      )
      if (ext) return true
    }
  }
  const localExt = await findLocalLeadByExternal(listing.source, listing.external_id)
  if (localExt) return true
  const localKey = await findLocalLeadByDuplicateKey(key)
  return Boolean(localKey)
}

export async function insertScrapedListing(
  listing: ScrapedListing,
  markDuplicate: boolean
): Promise<'added' | 'duplicate' | 'skipped'> {
  if (await existsDuplicate(listing)) return 'duplicate'

  const duplicate_key = buildDuplicateKey(listing)
  const status: LeadStatus = markDuplicate ? 'duplicate' : 'pending_review'
  const payload = {
    source: listing.source,
    external_id: listing.external_id,
    city: listing.city,
    city_slug: listing.city_slug,
    district: listing.district,
    district_slug: listing.district_slug,
    title: listing.title,
    description: listing.description,
    phone: listing.phone || null,
    price: listing.price,
    images: listing.images,
    status,
    source_url: listing.source_url,
    property_type: listing.property_type,
    area_sqm: listing.area_sqm,
    duplicate_key,
    published_property_id: null,
  }

  await ensureLeadsQueueTable()

  if (!isDbConfigured()) {
    await createLocalLead(payload)
    return markDuplicate ? 'duplicate' : 'added'
  }

  try {
    await execute(
      `INSERT INTO crm_leads_queue (
        source, external_id, city, city_slug, district, district_slug,
        title, description, phone, price, images, status, source_url,
        property_type, area_sqm, duplicate_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?)`,
      [
        payload.source,
        payload.external_id,
        payload.city,
        payload.city_slug,
        payload.district,
        payload.district_slug,
        payload.title,
        payload.description,
        payload.phone,
        payload.price,
        JSON.stringify(payload.images),
        payload.status,
        payload.source_url,
        payload.property_type,
        payload.area_sqm,
        payload.duplicate_key,
      ]
    )
    return markDuplicate ? 'duplicate' : 'added'
  } catch {
    return 'skipped'
  }
}

export async function loadPropertyDuplicateKeys(): Promise<Set<string>> {
  const keys = new Set<string>()
  if (!isDbConfigured()) return keys
  const rows = await query<{ title: string; city: string; quarter: string; price: number }>(
    `SELECT title, city, quarter, price FROM properties WHERE status != 'archived' LIMIT 500`
  )
  for (const r of rows) {
    keys.add(
      buildDuplicateKey({
        title: r.title,
        city: r.city,
        district: r.quarter,
        price: Number(r.price),
        phone: '',
      })
    )
  }
  return keys
}

export async function publishLeadToProperty(lead: MarketplaceLead): Promise<{
  propertyId: number
  redirectUrl: string
}> {
  const citySlug = lead.city_slug ?? toSlug(lead.city)
  const quarterSlug = lead.district_slug ?? toSlug(lead.district)
  const slug = toSlug(lead.title)
  const mainImage = lead.images[0] ?? null
  const area = lead.area_sqm ?? 50
  const price = lead.price ?? 0

  if (!isDbConfigured()) {
    const { createLocalProperty } = await import('@/lib/local-store/properties')
    const prop = await createLocalProperty({
      user_id: 1,
      title: lead.title,
      slug,
      description: lead.description ?? '',
      price,
      city: lead.city,
      quarter: lead.district,
      property_type: lead.property_type ?? 'Апартамент',
      area,
      bedrooms: null,
      bathrooms: null,
      floor: null,
      total_floors: null,
      furnished: 'no',
      main_image: mainImage,
      images: lead.images,
      features: [],
      status: 'available',
      city_slug: citySlug,
      quarter_slug: quarterSlug,
    })
    return {
      propertyId: prop.id,
      redirectUrl: `/cities/${citySlug}/${quarterSlug}/property/${prop.id}`,
    }
  }

  const result = await execute(
    `INSERT INTO properties (
      user_id, title, slug, description, price, city, quarter,
      property_type, status, area, bedrooms, bathrooms,
      floor, total_floors, furnished, main_image, views
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, NULL, NULL, NULL, NULL, 'no', ?, 0)`,
    [
      1,
      lead.title,
      slug,
      lead.description,
      price,
      lead.city,
      lead.district,
      lead.property_type ?? 'Апартамент',
      area,
      mainImage,
    ]
  )

  const propertyId = result.insertId
  for (let i = 0; i < lead.images.length; i++) {
    if (lead.images[i]) {
      await execute(
        `INSERT INTO property_images (property_id, image_path, sort_order) VALUES (?, ?, ?)`,
        [propertyId, lead.images[i], i]
      )
    }
  }

  return {
    propertyId,
    redirectUrl: `/cities/${citySlug}/${quarterSlug}/property/${propertyId}`,
  }
}
