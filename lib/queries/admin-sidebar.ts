import { query, isDbConfigured } from '@/lib/db'
import { listLocalLeads } from '@/lib/local-store/leads-queue'

export interface SidebarBadges {
  properties: number
  brokers: number
  clients: number
  inquiries: number
  tasks: number
  extractedLeads: number
  owners: number
}

const EMPTY_BADGES: SidebarBadges = {
  properties: 0,
  brokers: 0,
  clients: 0,
  inquiries: 0,
  tasks: 0,
  extractedLeads: 0,
  owners: 0,
}

export async function getSidebarBadges(): Promise<SidebarBadges> {
  try {
    const [pendingProps, brokers, unassignedClients, newInquiries, openTasks, extractedLeads, ownersCount] =
      await Promise.all([
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM properties WHERE status = 'pending'`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM users WHERE role IN ('broker','admin') AND status = 'active'`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM crm_clients WHERE agent_id IS NULL AND status = 'active'`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM inquiries WHERE status = 'new'`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM crm_tasks WHERE status IN ('pending','in_progress')`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM crm_leads_queue WHERE status IN ('pending_review','editing')`
        ),
        query<{ total: number }>(
          `SELECT COUNT(*) AS total FROM property_owners`
        ).catch(() => [{ total: 0 }]),
      ])

    let extracted = Number(extractedLeads[0]?.total ?? 0)
    if (!extracted && !isDbConfigured()) {
      const local = await listLocalLeads()
      extracted = local.filter(l =>
        l.status === 'pending_review' || l.status === 'editing'
      ).length
    }

    return {
      properties: Number(pendingProps[0]?.total ?? 0),
      brokers: Number(brokers[0]?.total ?? 0),
      clients: Number(unassignedClients[0]?.total ?? 0),
      inquiries: Number(newInquiries[0]?.total ?? 0),
      tasks: Number(openTasks[0]?.total ?? 0),
      extractedLeads: extracted,
      owners: Number(ownersCount[0]?.total ?? 0),
    }
  } catch {
    try {
      const local = await listLocalLeads()
      const extracted = local.filter(l =>
        l.status === 'pending_review' || l.status === 'editing'
      ).length
      return { ...EMPTY_BADGES, extractedLeads: extracted }
    } catch {
      return EMPTY_BADGES
    }
  }
}
