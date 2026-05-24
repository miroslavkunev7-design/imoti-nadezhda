import { NextRequest, NextResponse } from 'next/server'
import { getProperties } from '@/lib/queries/properties'
import type { SearchParams } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const params: SearchParams = {
      city:          sp.get('city')         ?? undefined,
      quarter:       sp.get('quarter')      ?? undefined,
      type:          sp.get('type')         ?? undefined,
      detailed_type: sp.get('detailed_type')?? undefined,
      price_min:     sp.get('price_min')    ?? undefined,
      price_max:     sp.get('price_max')    ?? undefined,
      bathrooms:     sp.get('bathrooms')    ?? undefined,
      bedrooms:      sp.get('bedrooms')     ?? undefined,
      area_min:      sp.get('area_min')     ?? undefined,
      area_max:      sp.get('area_max')     ?? undefined,
      features:      sp.get('features')     ?? undefined,
      sort:          (sp.get('sort') as SearchParams['sort']) ?? 'newest',
      page:          sp.get('page')         ?? '1',
    }

    const result = await getProperties(params)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[GET /api/properties]', error)
    return NextResponse.json(
      { success: false, error: 'Грешка при зареждане на имотите' },
      { status: 500 }
    )
  }
}
