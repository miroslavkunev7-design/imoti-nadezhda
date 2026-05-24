import { query } from '@/lib/db'

export interface SidebarBadges {
  properties: number
  brokers: number
  clients: number
  inquiries: number
  tasks: number
}

const EMPTY_BADGES: SidebarBadges = {
  properties: 0,
  brokers: 0,
  clients: 0,
  inquiries: 0,
  tasks: 0,
}

export async function getSidebarBadges(): Promise<SidebarBadges> {
  try {
    const [pendingProps, brokers, unassignedClients, newInquiries, openTasks] =
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
      ])

    return {
      properties: Number(pendingProps[0]?.total ?? 0),
      brokers: Number(brokers[0]?.total ?? 0),
      clients: Number(unassignedClients[0]?.total ?? 0),
      inquiries: Number(newInquiries[0]?.total ?? 0),
      tasks: Number(openTasks[0]?.total ?? 0),
    }
  } catch {
    return EMPTY_BADGES
  }
}
