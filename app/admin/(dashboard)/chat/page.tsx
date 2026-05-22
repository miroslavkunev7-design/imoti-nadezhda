'use client'
import { useState } from 'react'
import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

const CONTACTS = [
  { id: 1, name: 'Георги Иванов',    last: 'Здравейте, интересувам се...', time: '10:32', unread: 2 },
  { id: 2, name: 'Мария Николова',   last: 'Благодаря за информацията!',   time: '09:15', unread: 0 },
  { id: 3, name: 'Александър Петров',last: 'Кога можем да уговорим оглед?', time: 'Вчера', unread: 0 },
  { id: 4, name: 'Елена Стоянова',   last: 'Добре, ще се свържа утре.',    time: 'Вчера', unread: 0 },
  { id: 5, name: 'Димитър Димитров', last: 'Имате ли нещо в Тракия?',      time: 'Пон',   unread: 0 },
]

const MESSAGES: Record<number, { text: string; mine: boolean; time: string }[]> = {
  1: [
    { text: 'Здравейте, интересувам се от тристаен апартамент в центъра.', mine: false, time: '10:30' },
    { text: 'Здравейте! Имаме няколко подходящи имота. Кой квартал предпочитате?', mine: true, time: '10:31' },
    { text: 'Предпочитам Боян Българов или Добруджански.', mine: false, time: '10:32' },
    { text: 'Отличен избор! Ще ви изпратя линкове към актуалните ни обяви.', mine: true, time: '10:33' },
  ],
}

export default function ChatPage() {
  const [active,  setActive]  = useState(1)
  const [message, setMessage] = useState('')
  const [chats,   setChats]   = useState(MESSAGES)

  const contact  = CONTACTS.find(c => c.id === active)!
  const messages = chats[active] ?? []

  function send() {
    if (!message.trim()) return
    setChats(prev => ({ ...prev, [active]: [...(prev[active] ?? []), { text: message, mine: true, time: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }) }] }))
    setMessage('')
  }

  return (
    <div>
      <PageHeader title="Чат" />
      <div className="flex gap-4" style={{ height: 'calc(100vh - 160px)' }}>

        {/* Contact list */}
        <div className="w-64 flex-shrink-0 rounded-xl overflow-hidden flex flex-col" style={cardStyle}>
          <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(196,30,58,0.15)' }}>
            <input className="input-dark text-sm w-full" placeholder="Търси..." />
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONTACTS.map(c => (
              <div key={c.id} onClick={() => setActive(c.id)}
                className={`flex items-start gap-2.5 px-3 py-3 cursor-pointer transition-colors ${active === c.id ? 'bg-[rgba(196,30,58,0.15)]' : 'hover:bg-[rgba(255,255,255,0.04)]'}`}
                style={{ borderBottom: '1px solid rgba(196,30,58,0.07)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: '#c41e3a' }}>{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white font-medium truncate">{c.name}</p>
                    <span className="text-[10px] text-[rgba(255,255,255,0.35)] ml-1 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-[rgba(255,255,255,0.4)] truncate">{c.last}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-crimson-700 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">{c.unread}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={cardStyle}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(196,30,58,0.15)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#c41e3a' }}>
              {contact.name[0]}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{contact.name}</p>
              <p className="text-[10px] text-green-400">Онлайн</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[70%] px-3 py-2 rounded-xl text-sm"
                  style={msg.mine
                    ? { background: '#c41e3a', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                  <p>{msg.text}</p>
                  <p className="text-[10px] mt-0.5 opacity-60 text-right">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3" style={{ borderTop: '1px solid rgba(196,30,58,0.15)' }}>
            <input
              className="input-dark flex-1 text-sm"
              placeholder="Напишете съобщение..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={send} className="btn-crimson px-4 py-2 text-sm">Изпрати</button>
          </div>
        </div>
      </div>
    </div>
  )
}
