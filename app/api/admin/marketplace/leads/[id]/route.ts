import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { resolveDistrict } from '@/lib/marketplace/districts'
import { getLead, updateLead } from '@/lib/marketplace/leads-repository'

function parseId(raw: string): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  const id = parseId(params.id)
  const lead = await getLead(id)
  if (!lead) {
    return NextResponse.json({ success: false, error: 'Записът не е намерен' }, { status: 404 })
  }
  return NextResponse.json({ success: true, lead })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  const id = parseId(params.id)
  const existing = await getLead(id)
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Записът не е намерен' }, { status: 404 })
  }

  const body = await req.json()
  const citySlug = String(body.city_slug ?? existing.city_slug ?? '')
  const locationText = `${body.title ?? existing.title} ${body.district ?? existing.district} ${body.description ?? existing.description ?? ''}`
  const autoDistrict =
    body.district == null && citySlug
      ? resolveDistrict(citySlug, locationText)
      : null

  const lead = await updateLead(id, {
    title: body.title != null ? String(body.title) : undefined,
    description: body.description != null ? String(body.description) : undefined,
    phone: body.phone != null ? String(body.phone) : undefined,
    price: body.price != null ? Number(body.price) : undefined,
    city: body.city != null ? String(body.city) : undefined,
    city_slug: body.city_slug != null ? String(body.city_slug) : undefined,
    district:
      body.district != null
        ? String(body.district)
        : autoDistrict?.district,
    district_slug:
      body.district_slug != null
        ? String(body.district_slug)
        : autoDistrict?.district_slug,
    images: Array.isArray(body.images) ? body.images.map(String) : undefined,
    property_type: body.property_type != null ? String(body.property_type) : undefined,
    area_sqm: body.area_sqm != null ? Number(body.area_sqm) : undefined,
    status: body.status != null ? body.status : 'editing',
  })

  return NextResponse.json({ success: true, lead })
}
