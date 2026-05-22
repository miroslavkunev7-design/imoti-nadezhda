'use client'

import { cardStyle, PageHeader, StatusBadge, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Transaction {
  id: number
  description: string
  type: string
  amount: number
  created_at: string
}

interface MonthlyRow {
  month: string
  income: number
  expense: number
}

interface FinancePanelProps {
  transactions: Transaction[]
  monthly: MonthlyRow[]
}

function formatEur(n: number) {
  return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function FinancePanel({ transactions, monthly }: FinancePanelProps) {
  const totalIncome  = monthly.reduce((s, m) => s + Number(m.income), 0)
  const totalExpense = monthly.reduce((s, m) => s + Number(m.expense), 0)
  const balance = totalIncome - totalExpense
  const maxBar = Math.max(...monthly.map(m => Math.max(Number(m.income), Number(m.expense))), 1)

  return (
    <div>
      <PageHeader title="Финанси" />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Приходи', value: formatEur(totalIncome), color: '#4ade80' },
          { label: 'Разходи', value: formatEur(totalExpense), color: '#f87171' },
          { label: 'Баланс', value: formatEur(balance), color: balance >= 0 ? '#4ade80' : '#f87171' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={cardStyle}>
            <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {monthly.length > 0 && (
        <div className="p-4 rounded-xl mb-5" style={cardStyle}>
          <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-4">Месечен преглед</p>
          <div className="flex items-end gap-3 h-32">
            {monthly.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: 100 }}>
                  <div
                    className="w-2 rounded-t-sm"
                    style={{ height: `${(Number(m.income) / maxBar) * 100}%`, background: 'rgba(74,222,128,0.7)', minHeight: 4 }}
                  />
                  <div
                    className="w-2 rounded-t-sm"
                    style={{ height: `${(Number(m.expense) / maxBar) * 100}%`, background: 'rgba(248,113,113,0.7)', minHeight: 4 }}
                  />
                </div>
                <span className="text-[9px] text-[rgba(255,255,255,0.4)]">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle}>
              {['Описание', 'Тип', 'Сума', 'Дата'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[rgba(255,255,255,0.35)] text-sm" style={tableCellStyle}>
                  Няма записани транзакции
                </td>
              </tr>
            ) : (
              transactions.map(t => (
                <tr key={t.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3 text-white text-sm" style={tableCellStyle}>{t.description}</td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <StatusBadge status={t.type === 'income' ? 'active' : 'cancelled'} />
                  </td>
                  <td className="px-4 py-3 font-bold text-sm" style={{ ...tableCellStyle, color: t.type === 'income' ? '#4ade80' : '#f87171' }}>
                    {t.type === 'income' ? '+' : '-'}{formatEur(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-xs" style={tableCellStyle}>
                    {new Date(t.created_at).toLocaleDateString('bg-BG')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
