'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cardStyle, PageHeader } from '@/components/admin/AdminCard'

interface Msg {
  id: number
  sender_id: number
  sender_name: string
  message: string
  created_at: string
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [message, setMessage]   = useState('')
  const [sending, setSending]   = useState(false)
  const [myId, setMyId]         = useState<number | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)
  const latestRef               = useRef<string | null>(null)

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  // Load initial messages
  useEffect(() => {
    fetch('/api/admin/chat')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setMessages(json.messages ?? [])
          if (json.myId) setMyId(json.myId)
          if (json.messages?.length) {
            latestRef.current = json.messages[json.messages.length - 1].created_at
          }
        }
      })
      .catch(() => setError('Грешка при зареждане'))
  }, [])

  // Determine own sender_id from first message or from a cookie decode (not possible client-side)
  // We'll mark "mine" optimistically after send
  const poll = useCallback(() => {
    const since = latestRef.current
    if (!since) return
    fetch(`/api/admin/chat?since=${encodeURIComponent(since)}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.messages?.length) {
          setMessages(prev => {
            const ids = new Set(prev.map(m => m.id))
            const fresh = json.messages.filter((m: Msg) => !ids.has(m.id))
            if (!fresh.length) return prev
            latestRef.current = json.messages[json.messages.length - 1].created_at
            return [...prev, ...fresh]
          })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const t = setInterval(poll, 3000)
    return () => clearInterval(t)
  }, [poll])

  useEffect(() => { scrollBottom() }, [messages])

  async function send() {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const json = await res.json()
      if (json.success && json.message) {
        setMyId(json.message.sender_id)
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id))
          return ids.has(json.message.id) ? prev : [...prev, json.message]
        })
        latestRef.current = json.message.created_at
      } else {
        setError(json.error ?? 'Грешка')
      }
    } catch {
      setError('Грешка при изпращане')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader title="Екипен чат" />
      <div className="flex flex-col rounded-xl overflow-hidden" style={{ ...cardStyle, height: 'calc(100vh - 160px)' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-center text-[rgba(255,255,255,0.3)] text-sm mt-8">
              Няма съобщения — започни разговора
            </p>
          )}
          {messages.map(msg => {
            const mine = myId !== null ? msg.sender_id === myId : false
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'} gap-2`}>
                {!mine && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 self-end mb-1"
                    style={{ background: '#A86B3D' }}>
                    {msg.sender_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ maxWidth: '68%' }}>
                  {!mine && (
                    <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-1 ml-1">{msg.sender_name}</p>
                  )}
                  <div className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={mine
                      ? { background: '#A86B3D', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', borderBottomLeftRadius: 4 }}>
                    <p>{msg.message}</p>
                    <p className="text-[10px] mt-1 opacity-60 text-right">{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">
            {error} <button onClick={() => setError(null)} className="ml-2 underline">Скрий</button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 p-3" style={{ borderTop: '1px solid rgba(196,30,58,0.18)' }}>
          <input
            className="input-dark flex-1 text-sm"
            placeholder="Напишете съобщение до екипа..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            disabled={sending}
          />
          <button onClick={send} disabled={sending || !message.trim()} className="btn-crimson px-4 py-2 text-sm disabled:opacity-50">
            {sending ? '...' : 'Изпрати'}
          </button>
        </div>
      </div>
    </div>
  )
}
