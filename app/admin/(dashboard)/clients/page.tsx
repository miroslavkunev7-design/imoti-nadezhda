import type { Metadata } from 'next'
import CrmBoard from '@/components/admin/CrmBoard'
import { mapClientStatus } from '@/lib/db/mappers'

export const metadata: Metadata = { title: 'Клиенти' }
export const dynamic = 'force-dynamic'

async function getClients() {
  try {
    const { query } = await import('@/lib/db')
    const rows = await query<{
      id: number; name: string; email: string; phone: string
      status: string; budget_min: number; budget_max: number; created_at: string
    }>(`SELECT * FROM crm_clients ORDER BY created_at DESC`)

    return rows.map(c => ({
      ...c,
      source: 'website',
      status: mapClientStatus(c.status),
    }))
  } catch { return [] }
}

export default async function CrmClientsPage() {
  const clients = await getClients()
  return <CrmBoard clients={clients} />
}
