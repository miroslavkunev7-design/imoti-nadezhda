import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

/** Contracts use the `appointments` table on host (no contracts table) */
export async function POST(req: NextRequest) {
  try {
    const { client_name, property_title, type, value } = await req.json()

    const result = await execute(`
      INSERT INTO appointments (appointment_date, status, notes)
      VALUES (CURDATE(), 'pending', ?)`,
      [`${type} | ${client_name} | ${property_title} | €${value ?? 0}`]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('[POST /api/admin/contracts]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запазване' }, { status: 500 })
  }
}
