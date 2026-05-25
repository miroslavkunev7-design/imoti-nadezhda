import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { decodeSessionValue } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ChatMessage {
  id: number
  sender_id: number
  sender_name: string
  message: string
  created_at: string
}

async function ensureTable() {
  try {
    await query('SELECT 1 FROM crm_messages LIMIT 1')
  } catch {
    const { bridgeQuery } = await import('@/lib/db-bridge')
    try {
      await bridgeQuery('SELECT 1', [])
      const url = process.env.DB_BRIDGE_URL?.trim()
      const key = process.env.DB_BRIDGE_KEY?.trim()
      if (url && key) {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, action: 'create_table', table: 'crm_messages' }),
          cache: 'no-store',
        })
      }
    } catch { /* ignore */ }
  }
}

export async function GET(req: NextRequest) {
  await ensureTable()
  const since = req.nextUrl.searchParams.get('since')
  try {
    let rows: ChatMessage[]
    if (since) {
      rows = await query<ChatMessage>(
        `SELECT id, sender_id, sender_name, message, created_at
         FROM crm_messages WHERE created_at > ? ORDER BY created_at ASC LIMIT 50`,
        [since]
      )
    } else {
      rows = await query<ChatMessage>(
        `SELECT id, sender_id, sender_name, message, created_at
         FROM crm_messages ORDER BY created_at DESC LIMIT 50`
      )
      rows = rows.reverse()
    }
    return NextResponse.json({ success: true, messages: rows })
  } catch {
    return NextResponse.json({ success: true, messages: [] })
  }
}

export async function POST(req: NextRequest) {
  await ensureTable()
  const cookieValue = req.cookies.get('admin_session')?.value
  const session = cookieValue ? decodeSessionValue(cookieValue) : null
  if (!session) {
    return NextResponse.json({ success: false, error: 'Не сте влезли' }, { status: 401 })
  }

  const { message } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ success: false, error: 'Празно съобщение' }, { status: 400 })
  }

  try {
    const users = await query<{ name: string }>(
      `SELECT name FROM users WHERE id = ? LIMIT 1`,
      [session.userId]
    )
    const senderName = users[0]?.name ?? (session.role === 'admin' ? 'Администратор' : 'Брокер')

    const result = await execute(
      `INSERT INTO crm_messages (sender_id, sender_name, message) VALUES (?, ?, ?)`,
      [session.userId, senderName, message.trim()]
    )

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return NextResponse.json({
      success: true,
      message: {
        id: result.insertId,
        sender_id: session.userId,
        sender_name: senderName,
        message: message.trim(),
        created_at: now,
      },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
