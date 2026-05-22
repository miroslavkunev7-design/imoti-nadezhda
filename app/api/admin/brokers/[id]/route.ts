import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = parseInt(params.id, 10)

    if (body.is_active !== undefined) {
      await execute(
        `UPDATE users SET status = ? WHERE id = ?`,
        [body.is_active ? 'active' : 'inactive', id]
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
