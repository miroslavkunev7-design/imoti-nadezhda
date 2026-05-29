import type { Metadata } from 'next'
import OwnersBoard from '@/components/admin/OwnersBoard'

export const metadata: Metadata = { title: 'Собственици' }
export const dynamic = 'force-dynamic'

export default function OwnersPage() {
  return <OwnersBoard />
}
