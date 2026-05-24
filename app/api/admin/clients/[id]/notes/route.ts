import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id, 10)
    const rows = await query<{
      id: number
      client_id: number
      note: string
      created_by: number
      created_at: string
      author_name: string
    }>(`
      SELECT n.*, u.name AS author_name
      FROM crm_notes n
      LEFT JOIN users u ON u.id = n.created_by
      WHERE n.client_id = ?
      ORDER BY n.created_at DESC
    `, [clientId])

    return NextResponse.json({ success: true, notes: rows })
  } catch (error) {
    console.error('[GET notes]', error)
    return NextResponse.json({
      success: false,
      error: 'Таблица crm_notes липсва или не е достъпна',
      notes: [],
    })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = parseInt(params.id, 10)
    const { note } = await req.json()

    if (!note?.trim()) {
      return NextResponse.json({ success: false, error: 'Бележката е празна' }, { status: 400 })
    }

    const result = await execute(
      `INSERT INTO crm_notes (client_id, note, created_by) VALUES (?, ?, ?)`,
      [clientId, note.trim(), 1]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('[POST notes]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запис на бележка' }, { status: 500 })
  }
}
