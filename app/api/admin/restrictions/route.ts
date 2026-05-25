import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function ensureTable() {
  try {
    await query('SELECT 1 FROM broker_restrictions LIMIT 1')
  } catch {
    const url = process.env.DB_BRIDGE_URL?.trim()
    const key = process.env.DB_BRIDGE_KEY?.trim()
    if (url && key) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, action: 'create_table', table: 'broker_restrictions' }),
        cache: 'no-store',
      })
    }
  }
}

// GET /api/admin/restrictions?userId=X  → list restricted pages for broker
// GET /api/admin/restrictions            → all restrictions
export async function GET(req: NextRequest) {
  await ensureTable()
  const userId = req.nextUrl.searchParams.get('userId')
  try {
    const rows = userId
      ? await query<{ page_slug: string }>(
          `SELECT page_slug FROM broker_restrictions WHERE user_id = ?`,
          [parseInt(userId)]
        )
      : await query<{ user_id: number; page_slug: string }>(
          `SELECT user_id, page_slug FROM broker_restrictions`
        )
    return NextResponse.json({ success: true, restrictions: rows })
  } catch {
    return NextResponse.json({ success: true, restrictions: [] })
  }
}

// POST /api/admin/restrictions { userId, pageSlug }  → block page
export async function POST(req: NextRequest) {
  await ensureTable()
  const { userId, pageSlug } = await req.json()
  if (!userId || !pageSlug) {
    return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 })
  }
  try {
    await execute(
      `INSERT IGNORE INTO broker_restrictions (user_id, page_slug) VALUES (?, ?)`,
      [userId, pageSlug]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

// DELETE /api/admin/restrictions { userId, pageSlug }  → unblock page
export async function DELETE(req: NextRequest) {
  await ensureTable()
  const { userId, pageSlug } = await req.json()
  if (!userId || !pageSlug) {
    return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 })
  }
  try {
    await execute(
      `DELETE FROM broker_restrictions WHERE user_id = ? AND page_slug = ?`,
      [userId, pageSlug]
    )
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
