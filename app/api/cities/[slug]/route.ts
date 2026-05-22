import { NextResponse } from 'next/server'
import { getCityBySlug, getQuartersByCity } from '@/lib/queries/cities'

export const revalidate = 120

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const [city, quarters] = await Promise.all([
      getCityBySlug(params.slug),
      getQuartersByCity(params.slug),
    ])

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'Градът не е намерен' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: { city, quarters } })
  } catch (error) {
    console.error('[GET /api/cities/[slug]]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при зареждане' },
      { status: 500 }
    )
  }
}
