import type { Metadata } from 'next'
import ContractsTable from '@/components/admin/ContractsTable'

export const metadata: Metadata = { title: 'Договори' }
export const dynamic = 'force-dynamic'

/** Host has no `contracts` table — show appointments as deals/meetings */
async function getContracts() {
  try {
    const { query } = await import('@/lib/db')
    const rows = await query<{
      id: number; notes: string; status: string; created_at: string
      client_name: string; property_title: string; price: number
    }>(`
      SELECT a.id, a.notes, a.status, a.created_at,
        cl.name AS client_name,
        p.title AS property_title,
        p.price
      FROM appointments a
      LEFT JOIN crm_clients cl ON cl.id = a.client_id
      LEFT JOIN properties p ON p.id = a.property_id
      ORDER BY a.created_at DESC`)

    return rows.map(r => {
      const parts = (r.notes ?? '').split('|').map(s => s.trim())
      return {
        id: r.id,
        type: parts[0] || 'Среща',
        value: Number(r.price ?? parts[3]?.replace(/[^\d.]/g, '') ?? 0),
        status: r.status === 'completed' ? 'completed' : r.status === 'cancelled' ? 'cancelled' : 'active',
        created_at: r.created_at,
        client_name: r.client_name || parts[1] || '—',
        property_title: r.property_title || parts[2] || '—',
      }
    })
  } catch { return [] }
}

export default async function ContractsPage() {
  const contracts = await getContracts()
  return <ContractsTable contracts={contracts} />
}
