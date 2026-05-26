import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getLead, publishLeadToProperty, updateLead } from '@/lib/marketplace/leads-repository'

function parseId(raw: string): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Неоторизиран достъп' }, { status: 401 })
  }

  const id = parseId(params.id)
  let lead = await getLead(id)
  if (!lead) {
    return NextResponse.json({ success: false, error: 'Записът не е намерен' }, { status: 404 })
  }

  if (lead.status === 'published' && lead.published_property_id) {
    return NextResponse.json({
      success: true,
      propertyId: lead.published_property_id,
      message: 'Вече е публикуван',
    })
  }

  const body = await req.json().catch(() => ({}))
  if (body && typeof body === 'object' && Object.keys(body).length) {
    lead =
      (await updateLead(id, {
        title: body.title != null ? String(body.title) : undefined,
        description: body.description != null ? String(body.description) : undefined,
        phone: body.phone != null ? String(body.phone) : undefined,
        price: body.price != null ? Number(body.price) : undefined,
        city: body.city != null ? String(body.city) : undefined,
        city_slug: body.city_slug != null ? String(body.city_slug) : undefined,
        district: body.district != null ? String(body.district) : undefined,
        district_slug: body.district_slug != null ? String(body.district_slug) : undefined,
        images: Array.isArray(body.images) ? body.images.map(String) : undefined,
        property_type: body.property_type != null ? String(body.property_type) : undefined,
        area_sqm: body.area_sqm != null ? Number(body.area_sqm) : undefined,
      })) ?? lead
  }

  if (!lead.title?.trim()) {
    return NextResponse.json({ success: false, error: 'Заглавието е задължително' }, { status: 400 })
  }
  if (!lead.price || lead.price <= 0) {
    return NextResponse.json({ success: false, error: 'Въведете валидна цена' }, { status: 400 })
  }
  if (!lead.district?.trim()) {
    return NextResponse.json({ success: false, error: 'Изберете квартал' }, { status: 400 })
  }

  try {
    const { propertyId, redirectUrl } = await publishLeadToProperty(lead)
    await updateLead(id, {
      status: 'published',
      published_property_id: propertyId,
    })
    return NextResponse.json({ success: true, propertyId, redirectUrl })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Грешка при публикуване'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
