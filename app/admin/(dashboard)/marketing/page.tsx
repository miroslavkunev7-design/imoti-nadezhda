'use client'
import { useState } from 'react'
import { cardStyle, PageHeader, StatusBadge, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

const CAMPAIGNS = [
  { name: 'Facebook Ads',     channel: 'Facebook', budget: 600,  status: 'active',    results: '13,470 импр. / 331 кл.' },
  { name: 'Google Ads',       channel: 'Google',   budget: 450,  status: 'active',    results: '8,220 импр. / 214 кл.' },
  { name: 'Имейл бюлетин',   channel: 'Имейл',   budget: 0,    status: 'completed', results: '1,250 получатели' },
  { name: 'Наружна реклама', channel: 'Банер',   budget: 400,  status: 'cancelled', results: '8,800 минав. / 180 кл.' },
]

export default function MarketingPage() {
  const [show, setShow] = useState(false)
  return (
    <div>
      <PageHeader title="Маркетинг"
        action={<button onClick={() => setShow(true)} className="btn-crimson text-sm px-4 py-2">+ Нова кампания</button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Активни кампании', value: '2' },
          { label: 'Общ бюджет',       value: '€1,450' },
          { label: 'Общо импресии',    value: '21,690' },
          { label: 'Кликове',          value: '545' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={cardStyle}>
            <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-bold text-crimson-700 font-display">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={tableHeaderStyle}>
              {['Кампания','Канал','Бюджет','Статус','Резултати','Действия'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c, i) => (
              <tr key={i} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                <td className="px-4 py-3 text-white text-sm font-medium" style={tableCellStyle}>{c.name}</td>
                <td className="px-4 py-3 text-[rgba(255,255,255,0.6)] text-sm" style={tableCellStyle}>{c.channel}</td>
                <td className="px-4 py-3 text-crimson-700 font-bold text-sm" style={tableCellStyle}>{c.budget > 0 ? `€${c.budget}` : 'Безплатен'}</td>
                <td className="px-4 py-3" style={tableCellStyle}><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-xs" style={tableCellStyle}>{c.results}</td>
                <td className="px-4 py-3" style={tableCellStyle}>
                  <button className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">Редактирай</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
