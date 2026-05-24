import { NextResponse } from 'next/server'
import { getPropertyById } from '@/lib/queries/properties'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Невалидно ID' }, { status: 400 })
    }

    const property = await getPropertyById(id)
    if (!property) {
      return NextResponse.json({ success: false, error: 'Имотът не е намерен' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: property })
  } catch (error) {
    console.error('[GET /api/properties/[id]]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при зареждане на имота' },
      { status: 500 }
    )
  }
}
