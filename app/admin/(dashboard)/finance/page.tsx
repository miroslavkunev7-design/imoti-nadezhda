import type { Metadata } from 'next'
import FinancePage from '@/components/admin/FinancePanel'

export const metadata: Metadata = { title: 'Финанси' }
export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const { query } = await import('@/lib/db')
    const [transactions, monthly] = await Promise.all([
      query<{ id: number; description: string; type: string; amount: number; created_at: string }>(`
        SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20`),
      query<{ month: string; income: number; expense: number }>(`
        SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
          SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        GROUP BY 1 ORDER BY month DESC LIMIT 6`),
    ])
    return { transactions, monthly: monthly.reverse() }
  } catch { return { transactions: [], monthly: [] } }
}

export default async function FinancePageWrapper() {
  const data = await getData()
  return <FinancePage {...data} />
}
