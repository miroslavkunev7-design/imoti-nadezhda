import { execute, isDbConfigured, query } from '@/lib/db'

export interface PropertyOwner {
  id: number
  name: string | null
  phone: string
  city: string
  city_slug: string
  district: string
  district_slug: string
  source: string
  source_url: string | null
  lead_id: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OwnerInsert {
  name?: string
  phone: string
  city: string
  city_slug: string
  district: string
  district_slug: string
  source: string
  source_url?: string
  lead_id?: number
  notes?: string
}

export async function upsertPropertyOwner(data: OwnerInsert): Promise<boolean> {
  if (!data.phone?.trim()) return false
  if (!isDbConfigured()) return false

  try {
    // Check if owner with same phone + city already exists
    const existing = await query<{ id: number }>(
      `SELECT id FROM property_owners WHERE phone = ? AND city_slug = ? LIMIT 1`,
      [data.phone, data.city_slug]
    )
    if (existing.length > 0) return false

    await execute(
      `INSERT INTO property_owners (name, phone, city, city_slug, district, district_slug, source, source_url, lead_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name ?? null,
        data.phone,
        data.city,
        data.city_slug,
        data.district,
        data.district_slug,
        data.source,
        data.source_url ?? null,
        data.lead_id ?? null,
        data.notes ?? null,
      ]
    )
    return true
  } catch {
    return false
  }
}

export async function listPropertyOwners(citySlug?: string): Promise<PropertyOwner[]> {
  if (!isDbConfigured()) return []
  const sql = citySlug
    ? `SELECT * FROM property_owners WHERE city_slug = ? ORDER BY created_at DESC LIMIT 200`
    : `SELECT * FROM property_owners ORDER BY created_at DESC LIMIT 200`
  const rows = await query<Record<string, unknown>>(sql, citySlug ? [citySlug] : undefined)
  return rows.map(r => ({
    id: Number(r.id),
    name: r.name != null ? String(r.name) : null,
    phone: String(r.phone ?? ''),
    city: String(r.city ?? ''),
    city_slug: String(r.city_slug ?? ''),
    district: String(r.district ?? ''),
    district_slug: String(r.district_slug ?? ''),
    source: String(r.source ?? ''),
    source_url: r.source_url != null ? String(r.source_url) : null,
    lead_id: r.lead_id != null ? Number(r.lead_id) : null,
    notes: r.notes != null ? String(r.notes) : null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at ?? ''),
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at ?? ''),
  }))
}

export async function deletePropertyOwner(id: number): Promise<boolean> {
  if (!isDbConfigured()) return false
  try {
    await execute(`DELETE FROM property_owners WHERE id = ?`, [id])
    return true
  } catch {
    return false
  }
}
