import { NextRequest, NextResponse } from 'next/server'
import { execute, query, queryOne } from '@/lib/db'
import { toHostPropertyStatus, mapPropertyStatus } from '@/lib/db/mappers'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import { deleteLocalProperty } from '@/lib/local-store/properties'

function numOrNull(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function numRequired(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function deleteRelatedPropertyRows(id: number): Promise<void> {
  const stmts = [
    `DELETE FROM property_images WHERE property_id = ?`,
    `DELETE FROM property_features WHERE property_id = ?`,
    `UPDATE inquiries SET property_id = NULL WHERE property_id = ?`,
    `UPDATE crm_tasks SET property_id = NULL WHERE property_id = ?`,
  ]
  for (const sql of stmts) {
    await execute(sql, [id])
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    const row = await queryOne<Record<string, unknown>>(`
      SELECT p.*, c.slug AS city_slug, q.slug AS quarter_slug
      FROM properties p
      LEFT JOIN cities c ON LOWER(c.name) = LOWER(p.city)
      LEFT JOIN quarters q ON LOWER(q.name) = LOWER(p.quarter) AND q.city_id = c.id
      WHERE p.id = ?
    `, [id])

    if (!row) {
      return NextResponse.json({ success: false, error: 'Имотът не е намерен' }, { status: 404 })
    }

    const imgRows = await query<{ image_path: string }>(
      `SELECT image_path FROM property_images WHERE property_id = ? ORDER BY sort_order ASC`,
      [id]
    )
    let images = imgRows.map(r => resolveMediaUrl(r.image_path) ?? r.image_path).filter(Boolean)

    if (!images.length && row.main_image) {
      images = [resolveMediaUrl(String(row.main_image)) ?? String(row.main_image)]
    }

    return NextResponse.json({
      success: true,
      property: {
        id: row.id,
        title: row.title,
        description: row.description,
        price_eur: row.price,
        area_sqm: row.area,
        city: row.city,
        quarter: row.quarter,
        property_type: row.property_type,
        status: mapPropertyStatus(String(row.status ?? 'available')),
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        floor: row.floor,
        total_floors: row.total_floors,
        main_image: resolveMediaUrl(row.main_image ? String(row.main_image) : null),
        images,
      },
    })
  } catch (error) {
    console.error('[GET /api/admin/properties/[id]]', error)
    return NextResponse.json({ success: false, error: 'Грешка при зареждане' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    const body = await req.json()
    const fields: string[] = []
    const values: (string | number | null)[] = []

    if (body.title !== undefined) {
      fields.push('title = ?')
      values.push(String(body.title).trim())
    }
    if (body.description !== undefined) {
      fields.push('description = ?')
      values.push(body.description ? String(body.description) : null)
    }
    if (body.price_eur !== undefined) {
      fields.push('price = ?')
      values.push(numRequired(body.price_eur))
    }
    if (body.area_sqm !== undefined) {
      fields.push('area = ?')
      values.push(numRequired(body.area_sqm))
    }
    if (body.city_name !== undefined) {
      fields.push('city = ?')
      values.push(String(body.city_name).trim())
    }
    if (body.quarter_name !== undefined) {
      fields.push('quarter = ?')
      values.push(String(body.quarter_name).trim())
    }
    if (body.type !== undefined) {
      fields.push('property_type = ?')
      values.push(String(body.type).trim())
    }
    if (body.bedrooms !== undefined) {
      fields.push('bedrooms = ?')
      values.push(numOrNull(body.bedrooms))
    }
    if (body.bathrooms !== undefined) {
      fields.push('bathrooms = ?')
      values.push(numOrNull(body.bathrooms))
    }
    if (body.floor !== undefined) {
      fields.push('floor = ?')
      values.push(numOrNull(body.floor))
    }
    if (body.total_floors !== undefined) {
      fields.push('total_floors = ?')
      values.push(numOrNull(body.total_floors))
    }
    if (body.status !== undefined) {
      fields.push('status = ?')
      values.push(toHostPropertyStatus(String(body.status)))
    }

    if (Array.isArray(body.images)) {
      const imgs = body.images.filter(Boolean).slice(0, 50) as string[]
      await execute(`DELETE FROM property_images WHERE property_id = ?`, [id])
      for (let i = 0; i < imgs.length; i++) {
        await execute(
          `INSERT INTO property_images (property_id, image_path, sort_order) VALUES (?, ?, ?)`,
          [id, imgs[i], i]
        )
      }
      fields.push('main_image = ?')
      values.push(imgs[0] ?? null)
    }

    if (!fields.length) {
      return NextResponse.json({ success: false, error: 'Няма полета за обновяване' }, { status: 400 })
    }

    fields.push('updated_at = NOW()')
    values.push(id)
    await execute(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/properties/[id]]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при запис'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)

    if (id >= 900_001) {
      await deleteLocalProperty(id)
      return NextResponse.json({ success: true })
    }

    await deleteRelatedPropertyRows(id)
    await execute(`DELETE FROM properties WHERE id = ?`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/properties/[id]]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при изтриване'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
