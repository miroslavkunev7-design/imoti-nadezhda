import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Задължителни полета' }, { status: 400 })
    }

    const result = await execute(
      `INSERT INTO users (name, email, password, role, phone, status)
       VALUES (?, ?, ?, 'broker', ?, 'active')`,
      [name, email, password || 'temp_password', phone || null]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('[POST /api/admin/brokers]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запазване' }, { status: 500 })
  }
}
