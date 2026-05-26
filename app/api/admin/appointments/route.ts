import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const month = parseInt(req.nextUrl.searchParams.get('month') || '1', 10)
    const year  = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()), 10)

    const rows = await query<{
      scheduled_at: string
      client_name: string
      property_title: string
    }>(`
      SELECT
        (a.appointment_date::text || ' ' || COALESCE(a.appointment_time::text, '09:00:00')) AS scheduled_at,
        cl.name AS client_name,
        p.title AS property_title
      FROM appointments a
      LEFT JOIN crm_clients cl ON cl.id = a.client_id
      LEFT JOIN properties p ON p.id = a.property_id
      WHERE EXTRACT(MONTH FROM a.appointment_date) = ? AND EXTRACT(YEAR FROM a.appointment_date) = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `, [month, year])

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('[GET /api/admin/appointments]', error)
    return NextResponse.json({ success: true, data: [] })
  }
}
