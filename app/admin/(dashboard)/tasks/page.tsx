import type { Metadata } from 'next'
import TasksTable from '@/components/admin/TasksTable'

export const metadata: Metadata = { title: 'Задачи' }
export const dynamic = 'force-dynamic'

async function getTasks() {
  try {
    const { query } = await import('@/lib/db')
    return query<{
      id: number; title: string; description: string; due_date: string
      priority: string; status: string; assigned_name: string; client_name: string
    }>(`
      SELECT t.*,
        u.name AS assigned_name,
        '' AS client_name
      FROM crm_tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      ORDER BY CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END, t.due_date ASC`)
  } catch { return [] }
}

export default async function TasksPage() {
  const tasks = await getTasks()
  return <TasksTable tasks={tasks} />
}
