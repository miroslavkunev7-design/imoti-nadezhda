import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { query } = await import('@/lib/db')
    const rows = await query<{ page_slug: string }>(
      `SELECT page_slug FROM broker_restrictions WHERE user_id = ?`,
      [parseInt(params.id, 10)]
    )
    return NextResponse.json({ success: true, pages: rows.map(r => r.page_slug) })
  } catch {
    return NextResponse.json({ success: true, pages: [] })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  try {
    const id = parseInt(params.id, 10)
    const { pages } = await req.json() as { pages: string[] }
    const safe = (pages ?? []).filter(p => typeof p === 'string').slice(0, 20)

    await execute(`DELETE FROM broker_restrictions WHERE user_id = ?`, [id])
    for (const slug of safe) {
      await execute(
        `INSERT INTO broker_restrictions (user_id, page_slug) VALUES (?, ?)`,
        [id, slug.slice(0, 64)]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PUT /api/admin/brokers/[id]/restrictions]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запис' }, { status: 500 })
  }
}
