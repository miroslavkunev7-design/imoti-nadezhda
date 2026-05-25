import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne, isDbConfigured } from '@/lib/db'
import { createLocalProperty } from '@/lib/local-store/properties'
import { toSlug } from '@/lib/utils'

function isDbUnreachable(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return msg.includes('ENOTFOUND') || msg.includes('DB timeout') || msg.includes('ECONNREFUSED') || msg.includes('Database is not configured')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      city_id, quarter_id,
      city_name, quarter_name, city_slug, quarter_slug,
      title, type, detailed_type,
      price_eur, area_sqm, floor, total_floors,
      bedrooms, bathrooms, furnished, description, features, images,
    } = body

    let city: { name: string; slug: string } | null = null
    let quarter: { name: string; slug: string } | null = null

    if (city_name && quarter_name) {
      city = {
        name: String(city_name),
        slug: city_slug ? String(city_slug) : toSlug(String(city_name)),
      }
      quarter = {
        name: String(quarter_name),
        slug: quarter_slug ? String(quarter_slug) : toSlug(String(quarter_name)),
      }
    } else if (city_id && quarter_id) {
      city = await queryOne<{ name: string; slug: string }>(
        `SELECT name, slug FROM cities WHERE id = ?`,
        [city_id]
      )
      quarter = await queryOne<{ name: string; slug: string }>(
        `SELECT name, slug FROM quarters WHERE id = ?`,
        [quarter_id]
      )
    }

    if (!city?.name || !quarter?.name) {
      return NextResponse.json(
        { success: false, error: 'Избери валиден град и квартал' },
        { status: 400 }
      )
    }

    if (!title || !price_eur || !area_sqm) {
      return NextResponse.json(
        { success: false, error: 'Попълнете заглавие, цена и площ' },
        { status: 400 }
      )
    }

    const slug = toSlug(title)
    const mainImage = images?.filter(Boolean)?.[0] ?? null
    const propType = detailed_type ? `${type} — ${detailed_type}` : type

    const insertParams = [
      1,
      title,
      slug,
      description || null,
      parseFloat(price_eur),
      city.name,
      quarter.name,
      propType,
      parseFloat(area_sqm),
      bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms ? parseInt(bathrooms, 10) : null,
      floor ? parseInt(floor, 10) : null,
      total_floors ? parseInt(total_floors, 10) : null,
      furnished ? 'yes' : 'no',
      mainImage,
    ] as const

    if (isDbConfigured()) {
      try {
        const result = await execute(`
          INSERT INTO properties (
            user_id, title, slug, description, price, city, quarter,
            property_type, status, area, bedrooms, bathrooms,
            floor, total_floors, furnished, main_image, views
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?, ?, ?, ?, ?, ?, 0)`,
          [...insertParams]
        )

        const propertyId = result.insertId

        if (images?.length) {
          for (let i = 0; i < images.length; i++) {
            if (images[i]) {
              await execute(
                `INSERT INTO property_images (property_id, image_path, sort_order) VALUES (?, ?, ?)`,
                [propertyId, images[i], i]
              )
            }
          }
        }

        if (features?.length) {
          for (const feature of features) {
            try {
              await execute(
                `INSERT INTO property_features (property_id, feature_name) VALUES (?, ?)`,
                [propertyId, feature]
              )
            } catch { /* property_features table optional */ }
          }
        }

        return NextResponse.json({
          success: true,
          propertyId,
          redirectUrl: `/cities/${city.slug}/${quarter.slug}/property/${propertyId}`,
        })
      } catch (dbError) {
        if (!isDbUnreachable(dbError)) throw dbError
      }
    }

    const saved = await createLocalProperty({
      user_id: 1,
      title,
      slug,
      description: description || null,
      price: parseFloat(price_eur),
      city: city.name,
      quarter: quarter.name,
      city_slug: city.slug,
      quarter_slug: quarter.slug,
      property_type: propType,
      status: 'available',
      area: parseFloat(area_sqm),
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
      floor: floor ? parseInt(floor, 10) : null,
      total_floors: total_floors ? parseInt(total_floors, 10) : null,
      furnished: furnished ? 'yes' : 'no',
      main_image: mainImage,
      images: images?.filter(Boolean) ?? [],
      features: features ?? [],
    })

    return NextResponse.json({
      success: true,
      propertyId: saved.id,
      redirectUrl: `/cities/${city.slug}/${quarter.slug}/property/${saved.id}`,
      local: true,
    })
  } catch (error) {
    console.error('[POST /api/admin/properties]', error)
    const msg = error instanceof Error ? error.message : 'Грешка при запазване'
    return NextResponse.json(
      { success: false, error: msg || 'Грешка при запазване на имота' },
      { status: 500 }
    )
  }
}
