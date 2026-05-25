import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne, isDbConfigured } from '@/lib/db'
import { createLocalProperty } from '@/lib/local-store/properties'
import { toSlug } from '@/lib/utils'

function isDbUnreachable(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes('ENOTFOUND') ||
    msg.includes('DB timeout') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Database is not configured')
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      owner_name,
      owner_email,
      owner_phone,
      city_id,
      quarter_id,
      city_name,
      quarter_name,
      city_slug,
      quarter_slug,
      title,
      type,
      price_eur,
      area_sqm,
      bedrooms,
      bathrooms,
      description,
      images,
    } = body

    if (!owner_name || !owner_email || !owner_phone) {
      return NextResponse.json(
        { success: false, error: 'Попълнете име, имейл и телефон за контакт' },
        { status: 400 }
      )
    }

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
        { success: false, error: 'Изберете град и квартал' },
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
    const ownerBlock =
      `\n\n--- Заявка от собственик ---\n` +
      `Име: ${owner_name}\nИмейл: ${owner_email}\nТелефон: ${owner_phone}`
    const fullDescription = (description || '') + ownerBlock

    const insertParams = [
      1,
      title,
      slug,
      fullDescription,
      parseFloat(price_eur),
      city.name,
      quarter.name,
      type || 'Апартамент',
      parseFloat(area_sqm),
      bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms ? parseInt(bathrooms, 10) : null,
      null,
      null,
      'no',
      mainImage,
    ] as const

    if (isDbConfigured()) {
      try {
        const result = await execute(
          `INSERT INTO properties (
            user_id, title, slug, description, price, city, quarter,
            property_type, status, area, bedrooms, bathrooms,
            floor, total_floors, furnished, main_image, views
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, 0)`,
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

        await execute(
          `INSERT INTO inquiries (property_id, name, email, phone, message, status)
           VALUES (?, ?, ?, ?, ?, 'new')`,
          [
            propertyId,
            owner_name,
            owner_email,
            owner_phone,
            `Нова заявка за продажба: ${title}, ${quarter.name}, ${city.name} — ${price_eur} €`,
          ]
        )

        return NextResponse.json({ success: true, propertyId })
      } catch (dbError) {
        if (!isDbUnreachable(dbError)) throw dbError
      }
    }

    await createLocalProperty({
      user_id: 1,
      title,
      slug,
      description: fullDescription,
      price: parseFloat(price_eur),
      city: city.name,
      quarter: quarter.name,
      city_slug: city.slug,
      quarter_slug: quarter.slug,
      property_type: type || 'Апартамент',
      status: 'pending',
      area: parseFloat(area_sqm),
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
      floor: null,
      total_floors: null,
      furnished: 'no',
      main_image: mainImage,
      images: images?.filter(Boolean) ?? [],
      features: [],
    })

    return NextResponse.json({ success: true, local: true })
  } catch (error) {
    console.error('[POST /api/sell]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при изпращане. Опитайте отново или се обадете.' },
      { status: 500 }
    )
  }
}
