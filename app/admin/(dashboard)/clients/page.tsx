import type { Metadata } from 'next'
import CrmBoard from '@/components/admin/CrmBoard'
import { mapClientStatus } from '@/lib/db/mappers'

export const metadata: Metadata = { title: 'Клиенти' }
export const dynamic = 'force-dynamic'

type ClientRow = {
  id: number
  name: string
  email: string
  phone: string
  status: string
  budget_min: number
  budget_max: number
  created_at: string
  source: string
  city?: string
  property_type?: string
  search_description?: string
}

function mapRow(c: {
  id: number
  name: string
  email?: string | null
  phone: string | null
  status: string
  budget_min: number | null
  budget_max: number | null
  created_at: string
  source?: string | null
  city?: string | null
  property_type?: string | null
  search_description?: string | null
}): ClientRow {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? '',
    phone: c.phone ?? '',
    source: c.source ?? 'website',
    status: mapClientStatus(c.status),
    budget_min: Number(c.budget_min) || 0,
    budget_max: Number(c.budget_max) || 0,
    created_at: c.created_at,
    city: c.city ?? '',
    property_type: c.property_type ?? '',
    search_description: c.search_description ?? '',
  }
}

async function getClients(): Promise<ClientRow[]> {
  const { query, isDbConfigured } = await import('@/lib/db')
  const { listLocalClients } = await import('@/lib/local-store/clients')

  const byId = new Map<number, ClientRow>()

  if (isDbConfigured()) {
    try {
      const rows = await query<{
        id: number
        name: string
        email: string | null
        phone: string | null
        status: string
        budget_min: number | null
        budget_max: number | null
        created_at: string
        source: string | null
        city: string | null
        property_type: string | null
        search_description: string | null
      }>(`SELECT id, name, email, phone, status, budget_min, budget_max, created_at,
                source, city, property_type, search_description
          FROM crm_clients ORDER BY created_at DESC`)

      for (const row of rows) {
        byId.set(row.id, mapRow(row))
      }
    } catch {
      /* merge local below */
    }
  }

  const local = await listLocalClients()
  for (const c of local) {
    if (!byId.has(c.id)) {
      byId.set(c.id, mapRow({ ...c, phone: c.phone, source: c.source }))
    }
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export default async function CrmClientsPage() {
  const clients = await getClients()
  return <CrmBoard clients={clients} />
}
