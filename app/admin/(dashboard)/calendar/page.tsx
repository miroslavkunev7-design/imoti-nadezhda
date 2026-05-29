'use client'
import { useState, useEffect, useMemo } from 'react'
import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

const DAYS = ['Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб', 'Нед']
const MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември',
]
const COLORS = ['#500B1A', '#A86B3D', '#059669', '#d97706', '#0284c7', '#db2777']

type Appt = { scheduled_at: string; client_name: string; property_title: string }

export default function CalendarPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [view, setView] = useState<'Месец' | 'Седмица' | 'Ден'>('Месец')
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [appointments, setAppointments] = useState<Appt[]>([])

  useEffect(() => {
    fetch(`/api/admin/appointments?month=${month + 1}&year=${year}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setAppointments(json.data)
      })
      .catch(() => {})
  }, [month, year])

  const eventsByDay = useMemo(() => {
    const map: Record<number, { text: string; color: string; at: Date }[]> = {}
    appointments.forEach((a, i) => {
      const d = new Date(a.scheduled_at)
      if (d.getMonth() !== month || d.getFullYear() !== year) return
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push({
        text: `${d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} — ${a.client_name}`,
        color: COLORS[i % COLORS.length],
        at: d,
      })
    })
    return map
  }, [appointments, month, year])

  const firstDay = new Date(year, month, 1).getDay()
  const offset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  const weekStart = useMemo(() => {
    const d = new Date(year, month, selectedDay)
    const dow = (d.getDay() + 6) % 7
    const start = new Date(d)
    start.setDate(d.getDate() - dow)
    return start
  }, [year, month, selectedDay])

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const dayEvents = (eventsByDay[selectedDay] ?? []).sort(
    (a, b) => a.at.getTime() - b.at.getTime()
  )

  return (
    <div>
      <PageHeader
        title="Календар"
        action={
          <div className="flex gap-2">
            {(['Ден', 'Седмица', 'Месец'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.5)] hover:text-white'}`}
                style={{ border: '1px solid rgba(196,30,58,0.25)' }}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(196,30,58,0.15)' }}
        >
          <button
            type="button"
            onClick={() => {
              if (month === 0) {
                setMonth(11)
                setYear(y => y - 1)
              } else setMonth(m => m - 1)
            }}
            className="text-white hover:text-crimson-400 px-2 text-lg"
          >
            ‹
          </button>
          <span className="text-white font-semibold">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => {
              if (month === 11) {
                setMonth(0)
                setYear(y => y + 1)
              } else setMonth(m => m + 1)
            }}
            className="text-white hover:text-crimson-400 px-2 text-lg"
          >
            ›
          </button>
        </div>

        {view === 'Месец' && (
          <>
            <div className="grid grid-cols-7">
              {DAYS.map(d => (
                <div
                  key={d}
                  className="text-center text-[11px] text-[rgba(255,255,255,0.4)] py-2 font-medium"
                  style={{ borderBottom: '1px solid rgba(196,30,58,0.10)' }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const isToday =
                  day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
                const evs = day ? (eventsByDay[day] ?? []) : []
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => day && (setSelectedDay(day), setView('Ден'))}
                    className="min-h-[90px] p-1.5 hover:bg-[rgba(196,30,58,0.05)] text-left transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(196,30,58,0.08)',
                      borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid rgba(196,30,58,0.08)',
                    }}
                  >
                    {day && (
                      <>
                        <span
                          className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 ${isToday ? 'bg-crimson-700 text-white' : 'text-[rgba(255,255,255,0.6)]'}`}
                        >
                          {day}
                        </span>
                        {evs.slice(0, 2).map((ev, ei) => (
                          <div
                            key={ei}
                            className="text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate font-medium"
                            style={{
                              background: ev.color + '30',
                              color: ev.color,
                              border: `1px solid ${ev.color}40`,
                            }}
                          >
                            {ev.text}
                          </div>
                        ))}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {view === 'Седмица' && (
          <div className="grid grid-cols-7 gap-px bg-[rgba(196,30,58,0.12)]">
            {weekDays.map(d => {
              const dayNum = d.getDate()
              const evs = eventsByDay[dayNum] ?? []
              const isSel = dayNum === selectedDay && d.getMonth() === month
              return (
                <div key={d.toISOString()} className="bg-[rgba(8,6,18,0.95)] min-h-[200px] p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(dayNum)
                      setMonth(d.getMonth())
                      setYear(d.getFullYear())
                      setView('Ден')
                    }}
                    className={`text-xs font-bold mb-2 w-7 h-7 rounded-full ${isSel ? 'bg-crimson-700 text-white' : 'text-white/60'}`}
                  >
                    {dayNum}
                  </button>
                  {evs.map((ev, ei) => (
                    <div
                      key={ei}
                      className="text-[10px] px-1 py-0.5 rounded mb-1 truncate"
                      style={{ background: ev.color + '25', color: ev.color }}
                    >
                      {ev.text}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {view === 'Ден' && (
          <div className="p-5">
            <p className="text-white font-semibold mb-4">
              {selectedDay} {MONTHS[month]} {year}
            </p>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-white/45">Няма срещи за този ден.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((ev, i) => (
                  <li
                    key={i}
                    className="text-sm px-3 py-2 rounded-lg"
                    style={{
                      background: ev.color + '22',
                      border: `1px solid ${ev.color}55`,
                      color: '#fff',
                    }}
                  >
                    {ev.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
