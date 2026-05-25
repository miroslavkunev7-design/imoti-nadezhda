import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = parseInt(params.id, 10)
    const fields: string[] = []
    const values: (string | number | null)[] = []

    if (body.name !== undefined) {
      fields.push('name = ?')
      values.push(body.name)
    }
    if (body.email !== undefined) {
      fields.push('email = ?')
      values.push(body.email)
    }
    if (body.phone !== undefined) {
      fields.push('phone = ?')
      values.push(body.phone || null)
    }
    if (body.password) {
      fields.push('password = ?')
      values.push(body.password)
    }
    if (body.is_active !== undefined) {
      fields.push('status = ?')
      values.push(body.is_active ? 'active' : 'inactive')
    }
    if (body.avatar_url !== undefined) {
      fields.push('avatar_url = ?')
      values.push(body.avatar_url || null)
    }

    if (fields.length) {
      values.push(id)
      await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role IN ('broker','admin')`, values)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/brokers/[id]]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запис' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    await execute(
      `DELETE FROM users WHERE id = ? AND role = 'broker'`,
      [id]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/brokers/[id]]', error)
    return NextResponse.json({ success: false, error: 'Грешка при изтриване' }, { status: 500 })
  }
}
