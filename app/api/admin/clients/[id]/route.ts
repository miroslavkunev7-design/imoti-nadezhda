import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'

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
    if (body.budget_min !== undefined) {
      fields.push('budget_min = ?')
      values.push(body.budget_min ? Number(body.budget_min) : null)
    }
    if (body.budget_max !== undefined) {
      fields.push('budget_max = ?')
      values.push(body.budget_max ? Number(body.budget_max) : null)
    }
    if (body.status !== undefined) {
      fields.push('status = ?')
      values.push(toHostClientStatus(body.status))
    }
    if (body.assigned_agent_id !== undefined) {
      fields.push('agent_id = ?')
      values.push(body.assigned_agent_id || null)
    }
    if (body.city !== undefined) {
      fields.push('city = ?')
      values.push(body.city || null)
    }
    if (body.property_type !== undefined) {
      fields.push('property_type = ?')
      values.push(body.property_type || null)
    }
    if (body.search_description !== undefined) {
      fields.push('search_description = ?')
      values.push(body.search_description || null)
    }

    if (fields.length) {
      values.push(id)
      await execute(`UPDATE crm_clients SET ${fields.join(', ')} WHERE id = ?`, values)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/clients/[id]]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запис' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    try {
      await execute(`DELETE FROM crm_notes WHERE client_id = ?`, [id])
    } catch { /* optional */ }
    await execute(`DELETE FROM crm_clients WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/clients/[id]]', error)
    return NextResponse.json({ success: false, error: 'Грешка при изтриване' }, { status: 500 })
  }
}
