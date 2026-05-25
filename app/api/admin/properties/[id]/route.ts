import { NextRequest, NextResponse } from 'next/server'
import { execute, query, queryOne } from '@/lib/db'
import { toHostPropertyStatus } from '@/lib/db/mappers'
import { deleteLocalProperty } from '@/lib/local-store/properties'

async function deleteRelatedPropertyRows(id: number): Promise<void> {
  const stmts = [
    `DELETE FROM property_images WHERE property_id = ?`,
    `DELETE FROM property_features WHERE property_id = ?`,
    `UPDATE inquiries SET property_id = NULL WHERE property_id = ?`,
    `UPDATE crm_tasks SET property_id = NULL WHERE property_id = ?`,
  ]
  for (const sql of stmts) {
    try { await execute(sql, [id]) } catch { /* optional tables/columns */ }
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

    let images: string[] = []
    try {
      const imgRows = await query<{ image_path: string }>(
        `SELECT image_path FROM property_images WHERE property_id = ? ORDER BY sort_order ASC`,
        [id]
      )
      images = imgRows.map(r => r.image_path).filter(Boolean)
    } catch { /* optional */ }

    if (!images.length && row.main_image) {
      images = [String(row.main_image)]
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
        status: row.status,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        floor: row.floor,
        total_floors: row.total_floors,
        main_image: row.main_image,
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

    const allowed: Record<string, string> = {
      title: 'title',
      description: 'description',
      price_eur: 'price',
      area_sqm: 'area',
      city_name: 'city',
      quarter_name: 'quarter',
      type: 'property_type',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      floor: 'floor',
      total_floors: 'total_floors',
    }

    for (const [key, col] of Object.entries(allowed)) {
      if (body[key] !== undefined) {
        fields.push(`${col} = ?`)
        values.push(body[key] === '' ? null : body[key])
      }
    }

    if (body.status !== undefined) {
      fields.push('status = ?')
      values.push(toHostPropertyStatus(body.status))
    }

    if (Array.isArray(body.images)) {
      const imgs = body.images.filter(Boolean).slice(0, 50)
      try {
        await execute(`DELETE FROM property_images WHERE property_id = ?`, [id])
        for (let i = 0; i < imgs.length; i++) {
          await execute(
            `INSERT INTO property_images (property_id, image_path, sort_order) VALUES (?, ?, ?)`,
            [id, imgs[i], i]
          )
        }
      } catch { /* optional table */ }
      fields.push('main_image = ?')
      values.push(imgs[0] ?? null)
    }

    if (!fields.length) {
      return NextResponse.json({ success: false, error: 'Няма полета за обновяване' }, { status: 400 })
    }

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

    try {
      await execute(`DELETE FROM properties WHERE id = ?`, [id])
    } catch {
      await execute(`UPDATE properties SET status = 'draft' WHERE id = ?`, [id])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/properties/[id]]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при изтриване'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
