'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAdminAi } from '@/components/admin/AdminAiContext'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  contract?: { title: string; content: string; filename: string }
}

export default function CrmAiAssistant() {
  const { open, setOpen } = useAdminAi()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Здравейте! Аз съм CRM асистентът. Мога да добавям/изтривам клиенти и обяви, да записвам срещи и да генерирам договори от шаблони с данни от клиента и прикачените документи. Напишете „помощ" за примери.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: ChatMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const json = await res.json()
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: json.message ?? json.error ?? 'Няма отговор',
          contract: json.contract ?? undefined,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Грешка при връзка с асистента.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function downloadContract(c: { title: string; content: string; filename: string }) {
    const blob = new Blob([c.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = c.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed flex items-center justify-center rounded-full text-white transition-transform hover:scale-105"
        style={{
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 56,
          height: 56,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #8b0000, #c41e3a)',
          boxShadow: '0 8px 32px rgba(139,0,0,0.5)',
        }}
        aria-label="CRM AI асистент"
        title="AI Асистент"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1a2 2 0 01-2 2h-1v1.27a2 2 0 11-4 0V17h-1a2 2 0 01-2-2v-1H8a7 7 0 017-7h1V5.73A2 2 0 0112 2z" />
          <path d="M9 21h6" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed flex flex-col rounded-2xl overflow-hidden"
          style={{
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            marginTop: open ? 0 : 0,
            width: 'min(420px, calc(100vw - 48px))',
            maxHeight: 'min(520px, calc(100vh - 48px))',
            zIndex: 10000,
            background: 'rgba(8,6,18,0.98)',
            border: '1.5px solid rgba(196,30,58,0.45)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(196,30,58,0.25)' }}
          >
            <div>
              <p className="text-white font-semibold text-sm">CRM AI Асистент</p>
              <p className="text-[10px] text-[rgba(255,255,255,0.45)]">Клиенти · обяви · график · договори</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[rgba(255,255,255,0.5)] hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[92%] ${
                  m.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={
                  m.role === 'user'
                    ? { background: '#8b0000', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }
                }
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.contract && (
                  <button
                    type="button"
                    onClick={() => downloadContract(m.contract!)}
                    className="mt-2 text-[11px] font-semibold underline text-crimson-400"
                  >
                    Изтегли файл — {m.contract.title}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] italic">Мисля...</p>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(196,30,58,0.2)' }}>
            <div className="flex gap-2">
              <input
                className="input-dark flex-1 text-sm"
                placeholder="Напр. Предварителен договор за Златомир..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="btn-crimson px-3 py-2 text-sm disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
