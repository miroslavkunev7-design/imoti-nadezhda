import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const since = req.nextUrl.searchParams.get('since')
    const rows = since
      ? await query<{ id: number; sender_id: number; sender_name: string; message: string; created_at: string }>(
          `SELECT m.id, m.sender_id, u.name AS sender_name, m.message, m.created_at
           FROM crm_messages m
           JOIN users u ON u.id = m.sender_id
           WHERE m.created_at > ?
           ORDER BY m.created_at ASC
           LIMIT 100`,
          [since]
        )
      : await query<{ id: number; sender_id: number; sender_name: string; message: string; created_at: string }>(
          `SELECT m.id, m.sender_id, u.name AS sender_name, m.message, m.created_at
           FROM crm_messages m
           JOIN users u ON u.id = m.sender_id
           ORDER BY m.created_at ASC
           LIMIT 200`
        )

    return NextResponse.json({ success: true, messages: rows, myId: session.id })
  } catch (error) {
    console.error('[GET /api/admin/chat]', error)
    return NextResponse.json({ success: false, error: 'Грешка при зареждане' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await req.json()
    const text = String(message ?? '').trim()
    if (!text) {
      return NextResponse.json({ success: false, error: 'Празно съобщение' }, { status: 400 })
    }

    const result = await execute(
      `INSERT INTO crm_messages (sender_id, message) VALUES (?, ?)`,
      [session.id, text.slice(0, 2000)]
    )

    return NextResponse.json({
      success: true,
      message: {
        id: result.insertId,
        sender_id: session.id,
        sender_name: session.name ?? 'Потребител',
        message: text,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[POST /api/admin/chat]', error)
    return NextResponse.json({ success: false, error: 'Грешка при изпращане' }, { status: 500 })
  }
}
