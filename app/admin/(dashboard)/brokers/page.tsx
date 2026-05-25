import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import BrokersManager from '@/components/admin/BrokersManager'
import { getSession } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Брокери' }
export const dynamic = 'force-dynamic'

async function getBrokers() {
  try {
    const { query } = await import('@/lib/db')
    const brokers = await query<{
      id: number; name: string; email: string; phone: string
      role: string; is_active: number; created_at: string
      total_clients: number; active_clients: number; total_properties: number
      avatar_url: string | null; tasks_done: number; deals: number
    }>(`
      SELECT
        u.id, u.name, u.email, u.phone, u.role,
        CASE WHEN u.status = 'active' THEN 1 ELSE 0 END AS is_active,
        u.created_at,
        COALESCE(u.avatar_url, NULL) AS avatar_url,
        COUNT(DISTINCT c.id) AS total_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) AS active_clients,
        COUNT(DISTINCT p.id) AS total_properties,
        (SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = u.id AND t.status = 'done') AS tasks_done,
        (SELECT COUNT(*) FROM properties ps WHERE ps.user_id = u.id AND ps.status = 'sold') AS deals
      FROM users u
      LEFT JOIN crm_clients c ON c.agent_id = u.id
      LEFT JOIN properties  p ON p.user_id = u.id AND p.status = 'available'
      WHERE u.role IN ('broker','admin')
      GROUP BY u.id
      ORDER BY u.name ASC`)

    let restrictions: { user_id: number; page_slug: string }[] = []
    try {
      restrictions = await query<{ user_id: number; page_slug: string }>(
        `SELECT user_id, page_slug FROM broker_restrictions`
      )
    } catch { /* table might not exist yet */ }

    return brokers.map(b => ({
      ...b,
      restricted_pages: restrictions.filter(r => r.user_id === b.id).map(r => r.page_slug),
    }))
  } catch { return [] }
}

async function getUnassignedClients() {
  try {
    const { query } = await import('@/lib/db')
    return query<{ id: number; name: string; email: string; status: string }>(`
      SELECT id, name, email, status FROM crm_clients
      WHERE agent_id IS NULL
      ORDER BY created_at DESC`)
  } catch { return [] }
}

export default async function BrokersPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/admin')

  const [brokers, unassigned] = await Promise.all([getBrokers(), getUnassignedClients()])
  const isAdmin = session?.role === 'admin'

  return (
    <div className="max-w-[1100px]">
      <div className="mb-6">
        <h1 className="font-display text-white text-2xl font-bold">Брокери</h1>
        <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">{brokers.length} брокера в системата</p>
      </div>
      <BrokersManager brokers={brokers} unassignedClients={unassigned} isAdmin={isAdmin} />
    </div>
  )
}
