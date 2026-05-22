import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { toHostClientStatus } from '@/lib/db/mappers'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = parseInt(params.id, 10)

    if (body.status !== undefined) {
      await execute(
        `UPDATE crm_clients SET status = ? WHERE id = ?`,
        [toHostClientStatus(body.status), id]
      )
    }
    if (body.assigned_agent_id !== undefined) {
      await execute(
        `UPDATE crm_clients SET agent_id = ? WHERE id = ?`,
        [body.assigned_agent_id, id]
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
