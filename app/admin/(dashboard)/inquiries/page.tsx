import type { Metadata } from 'next'
import InquiriesTable from '@/components/admin/InquiriesTable'

export const metadata: Metadata = { title: 'Запитвания' }
export const dynamic = 'force-dynamic'

async function getInquiries() {
  try {
    const { query } = await import('@/lib/db')
    return query<{ id: number; name: string; email: string; phone: string; message: string; status: string; created_at: string; property_title: string }>(`
      SELECT i.*, p.title as property_title
      FROM inquiries i
      LEFT JOIN properties p ON p.id = i.property_id
      ORDER BY i.created_at DESC`)
  } catch { return [] }
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries()
  return <InquiriesTable inquiries={inquiries} />
}
