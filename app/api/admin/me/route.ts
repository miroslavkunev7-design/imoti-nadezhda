import { NextRequest, NextResponse } from 'next/server'
import { execute, queryOne } from '@/lib/db'
import { getBrokerRestrictions, getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const restricted = session.role === 'admin'
    ? []
    : await getBrokerRestrictions(session.id)

  let stats = { clients: 0, active_clients: 0, properties: 0, tasks_done: 0, deals: 0 }

  if (session.role !== 'admin') {
    const row = await queryOne<{
      total_clients: number
      active_clients: number
      total_properties: number
      tasks_done: number
      deals: number
    }>(`
      SELECT
        COUNT(DISTINCT c.id) AS total_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) AS active_clients,
        COUNT(DISTINCT p.id) AS total_properties,
        (SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = ? AND t.status = 'done') AS tasks_done,
        (SELECT COUNT(*) FROM properties ps WHERE ps.user_id = ? AND ps.status = 'sold') AS deals
      FROM users u
      LEFT JOIN crm_clients c ON c.agent_id = u.id
      LEFT JOIN properties p ON p.user_id = u.id AND p.status = 'available'
      WHERE u.id = ?
      GROUP BY u.id`,
      [session.id, session.id, session.id]
    )
    if (row) {
      stats = {
        clients: row.total_clients,
        active_clients: row.active_clients,
        properties: row.total_properties,
        tasks_done: row.tasks_done,
        deals: row.deals,
      }
    }
  }

  return NextResponse.json({
    success: true,
    user: session,
    restrictedPages: restricted,
    stats,
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const fields: string[] = []
    const values: (string | null)[] = []

    if (body.name !== undefined) {
      fields.push('name = ?')
      values.push(String(body.name).trim() || session.name || '')
    }
    if (body.phone !== undefined) {
      fields.push('phone = ?')
      values.push(body.phone?.trim() || null)
    }
    if (body.avatar_url !== undefined) {
      fields.push('avatar_url = ?')
      values.push(body.avatar_url || null)
    }

    if (!fields.length) {
      return NextResponse.json({ success: false, error: 'Няма промени' }, { status: 400 })
    }

    values.push(String(session.id))
    await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/me]', error)
    return NextResponse.json({ success: false, error: 'Грешка при запис' }, { status: 500 })
  }
}
