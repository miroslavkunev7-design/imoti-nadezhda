import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: 'Име и имейл са задължителни' }, { status: 400 })
    }
    if (!password?.trim() || password.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'Задай парола (мин. 4 символа)' }, { status: 400 })
    }

    const result = await execute(
      `INSERT INTO users (name, email, password, role, phone, status)
       VALUES (?, ?, ?, 'broker', ?, 'active')`,
      [name.trim(), email.trim(), password.trim(), phone?.trim() || null]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('[POST /api/admin/brokers]', error)
    const msg = error instanceof Error ? error.message : ''
    if (msg.toLowerCase().includes('duplicate') || msg.includes('23505')) {
      return NextResponse.json({ success: false, error: 'Имейлът вече съществува' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Грешка при запазване на брокер' }, { status: 500 })
  }
}
