'use client'
import { useState, useEffect } from 'react'
import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

const DAYS   = ['Пон','Вт','Ср','Чет','Пет','Съб','Нед']
const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const COLORS  = ['#c41e3a','#7c3aed','#059669','#d97706','#0284c7','#db2777']

export default function CalendarPage() {
  const now  = new Date()
  const [month, setMonth]  = useState(now.getMonth())
  const [year,  setYear]   = useState(now.getFullYear())
  const [view,  setView]   = useState<'Месец'|'Седмица'|'Ден'>('Месец')
  const [events, setEvents] = useState<Record<number,{text:string;color:string}[]>>({})

  useEffect(() => {
    fetch(`/api/admin/appointments?month=${month+1}&year=${year}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return
        const map: Record<number,{text:string;color:string}[]> = {}
        json.data.forEach((a: { scheduled_at: string; client_name: string; property_title: string }, i: number) => {
          const d = new Date(a.scheduled_at).getDate()
          if (!map[d]) map[d] = []
          map[d].push({ text: `${a.client_name} — ${a.property_title ?? 'Оглед'}`, color: COLORS[i % COLORS.length] })
        })
        setEvents(map)
      })
      .catch(() => {})
  }, [month, year])

  const firstDay   = new Date(year, month, 1).getDay()
  const offset     = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  return (
    <div>
      <PageHeader title="Календар"
        action={
          <div className="flex gap-2">
            {(['Ден','Седмица','Месец'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v?'bg-crimson-700 text-white':'text-[rgba(255,255,255,0.5)] hover:text-white'}`}
                style={{ border:'1px solid rgba(196,30,58,0.25)' }}>
                {v}
              </button>
            ))}
          </div>
        }
      />
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid rgba(196,30,58,0.15)' }}>
          <button onClick={() => { if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }} className="text-white hover:text-crimson-400 px-2 text-lg">‹</button>
          <span className="text-white font-semibold">{MONTHS[month]} {year}</span>
          <button onClick={() => { if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }} className="text-white hover:text-crimson-400 px-2 text-lg">›</button>
        </div>
        <div className="grid grid-cols-7">
          {DAYS.map(d => <div key={d} className="text-center text-[11px] text-[rgba(255,255,255,0.4)] py-2 font-medium" style={{ borderBottom:'1px solid rgba(196,30,58,0.10)' }}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear()
            const evs = day ? (events[day]??[]) : []
            return (
              <div key={i} className="min-h-[90px] p-1.5 hover:bg-[rgba(196,30,58,0.05)] cursor-pointer transition-colors"
                style={{ borderBottom:'1px solid rgba(196,30,58,0.08)', borderRight:(i+1)%7===0?'none':'1px solid rgba(196,30,58,0.08)' }}>
                {day && <>
                  <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 ${isToday?'bg-crimson-700 text-white':'text-[rgba(255,255,255,0.6)]'}`}>{day}</span>
                  {evs.map((ev,ei) => (
                    <div key={ei} className="text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate font-medium"
                      style={{ background:ev.color+'30', color:ev.color, border:`1px solid ${ev.color}40` }}>
                      {ev.text}
                    </div>
                  ))}
                </>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
