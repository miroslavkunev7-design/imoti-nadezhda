import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { listPropertyOwners, upsertPropertyOwner, deletePropertyOwner } from '@/lib/marketplace/owners-repository'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') ?? undefined
  const owners = await listPropertyOwners(city)
  return NextResponse.json({ success: true, owners })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })

  const body = await req.json()
  const saved = await upsertPropertyOwner({
    name: body.name,
    phone: String(body.phone ?? '').trim(),
    city: String(body.city ?? '').trim(),
    city_slug: String(body.city_slug ?? '').trim(),
    district: String(body.district ?? '').trim(),
    district_slug: String(body.district_slug ?? '').trim(),
    source: String(body.source ?? 'manual').trim(),
    source_url: body.source_url,
    notes: body.notes,
  })
  return NextResponse.json({ success: saved })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Неоторизиран' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ success: false, error: 'Липсва ID' }, { status: 400 })
  const ok = await deletePropertyOwner(id)
  return NextResponse.json({ success: ok })
}
