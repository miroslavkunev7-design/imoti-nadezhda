import type { Metadata } from 'next'
import DocumentsTable from '@/components/admin/DocumentsTable'

export const metadata: Metadata = { title: 'Документи' }
export const dynamic = 'force-dynamic'

async function getDocuments() {
  try {
    const { query } = await import('@/lib/db')
    return query<{
      id: number; original_name: string; file_path: string
      mime_type: string; size_bytes: number; created_at: string; uploader_name: string
    }>(`
      SELECT
        u.id,
        u.file_name AS original_name,
        u.file_path,
        u.file_type AS mime_type,
        CAST(u.file_size AS UNSIGNED) AS size_bytes,
        u.created_at,
        usr.name AS uploader_name
      FROM uploads u
      LEFT JOIN users usr ON usr.id = u.user_id
      ORDER BY u.created_at DESC`)
  } catch { return [] }
}

export default async function DocumentsPage() {
  const docs = await getDocuments()
  return <DocumentsTable documents={docs} />
}
