import type { Metadata } from 'next'
import BrokersManager from '@/components/admin/BrokersManager'

export const metadata: Metadata = { title: 'Брокери' }
export const dynamic = 'force-dynamic'

async function getBrokers() {
  try {
    const { query } = await import('@/lib/db')
    const brokers = await query<{
      id: number; name: string; email: string; phone: string
      role: string; is_active: number; created_at: string
      total_clients: number; active_clients: number; total_properties: number
      avatar_url: string | null
    }>(`
      SELECT
        u.id, u.name, u.email, u.phone, u.role,
        CASE WHEN u.status = 'active' THEN 1 ELSE 0 END AS is_active,
        u.created_at,
        COALESCE(u.avatar_url, NULL) AS avatar_url,
        COUNT(DISTINCT c.id) AS total_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) AS active_clients,
        COUNT(DISTINCT p.id) AS total_properties
      FROM users u
      LEFT JOIN crm_clients c ON c.agent_id = u.id
      LEFT JOIN properties  p ON p.user_id = u.id AND p.status = 'available'
      WHERE u.role IN ('broker','admin')
      GROUP BY u.id
      ORDER BY u.name ASC`)

    // Fetch restrictions for each broker
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
  const [brokers, unassigned] = await Promise.all([getBrokers(), getUnassignedClients()])
  return (
    <div className="max-w-[1100px]">
      <div className="mb-6">
        <h1 className="font-display text-themed-primary text-2xl font-bold">Брокери</h1>
        <p className="text-themed-secondary text-sm mt-1">{brokers.length} брокера в системата</p>
      </div>
      <BrokersManager brokers={brokers} unassignedClients={unassigned} />
    </div>
  )
}
