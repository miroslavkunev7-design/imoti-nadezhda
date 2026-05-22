import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { mapClientStatus } from '@/lib/db/mappers'

export async function POST(req: NextRequest) {
  try {
    const { city_id, quarter_id, city_name, quarter_name, type, price_eur, bedrooms } = await req.json()

    const city = city_name
      ? { name: String(city_name) }
      : city_id
        ? await queryOne<{ name: string }>(`SELECT name FROM cities WHERE id = ?`, [city_id])
        : null
    const quarter = quarter_name
      ? { name: String(quarter_name) }
      : quarter_id
        ? await queryOne<{ name: string }>(`SELECT name FROM quarters WHERE id = ?`, [quarter_id])
        : null

    const rows = await query<Record<string, unknown>>(`
      SELECT
        c.*,
        u.name AS assigned_agent_name
      FROM crm_clients c
      LEFT JOIN users u ON u.id = c.agent_id
      WHERE c.status = 'active'
        AND (c.preferred_city IS NULL OR c.preferred_city = '' OR c.preferred_city = ? OR LOWER(c.preferred_city) = LOWER(?))
        AND (c.preferred_quarter IS NULL OR c.preferred_quarter = '' OR c.preferred_quarter = ? OR LOWER(c.preferred_quarter) = LOWER(?))
        AND (c.budget_min IS NULL OR c.budget_min <= ?)
        AND (c.budget_max IS NULL OR c.budget_max >= ?)
      ORDER BY c.created_at DESC
    `, [
      city?.name ?? '',
      city?.name ?? '',
      quarter?.name ?? '',
      quarter?.name ?? '',
      price_eur,
      price_eur,
    ])

    const matches = rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      preferred_type: type,
      budget_min: r.budget_min,
      budget_max: r.budget_max,
      city_name: r.preferred_city ?? city?.name ?? '',
      preferred_bedrooms: bedrooms,
      assigned_agent_name: r.assigned_agent_name,
      status: mapClientStatus(String(r.status ?? 'active')),
    }))

    return NextResponse.json({ success: true, matches, count: matches.length })
  } catch (error) {
    console.error('[POST /api/admin/match]', error)
    return NextResponse.json({ success: false, matches: [], count: 0 })
  }
}
