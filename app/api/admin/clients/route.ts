import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, budget_min, budget_max } = await req.json()
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Име и имейл са задължителни' }, { status: 400 })
    }

    const result = await execute(
      `INSERT INTO crm_clients (name, email, phone, status, budget_min, budget_max)
       VALUES (?, ?, ?, 'active', ?, ?)`,
      [
        name,
        email,
        phone || null,
        budget_min ? Number(budget_min) : null,
        budget_max ? Number(budget_max) : null,
      ]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('[POST /api/admin/clients]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запазване' }, { status: 500 })
  }
}
