import { NextResponse } from 'next/server'
import { getAllCities } from '@/lib/queries/cities'

export const revalidate = 120

export async function GET() {
  try {
    const cities = await getAllCities()
    return NextResponse.json({ success: true, data: cities })
  } catch (error) {
    console.error('[GET /api/cities]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при зареждане на градовете' },
      { status: 500 }
    )
  }
}
