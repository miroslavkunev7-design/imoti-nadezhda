'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAdminAi } from '@/components/admin/AdminAiContext'

interface Attachment {
  url: string
  name: string
  type: string
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  contract?: { title: string; content: string; filename: string }
  imageUrl?: string
}

export default function CrmAiAssistant() {
  const { open, setOpen } = useAdminAi()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [welcomed, setWelcomed] = useState(false)

  useEffect(() => {
    if (open && !welcomed) {
      setWelcomed(true)
      setMessages([
        {
          role: 'assistant',
          content:
            'Здравейте! Аз съм **Милена**. Пишете както ви е удобно — ще разбера и ще действам. CRM, обяви, цени, договори, снимки, проекти. 📎 за файлове.',
        },
      ])
    }
  }, [open, welcomed])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [milenaReady, setMilenaReady] = useState<boolean | null>(null)
  const [milenaModel, setMilenaModel] = useState('gpt-4o')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    fetch('/api/admin/ai')
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setMilenaReady(Boolean(j.milenaReady))
          if (j.model) setMilenaModel(String(j.model))
        }
      })
      .catch(() => setMilenaReady(null))
  }, [open])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('name', file.name)
        const res = await fetch('/api/admin/ai/upload', { method: 'POST', body: form })
        const json = await res.json()
        if (json.success && json.url) {
          setAttachments(prev => [
            ...prev,
            { url: json.url, name: json.name ?? file.name, type: json.type ?? file.type },
          ])
        }
      }
    } finally {
      setUploading(false)
    }
  }

  async function send() {
    const text = input.trim()
    if ((!text && !attachments.length) || loading) return
    setInput('')
    const attachSnapshot = [...attachments]
    setAttachments([])

    const userLine =
      text +
      (attachSnapshot.length
        ? `\n[Прикачено: ${attachSnapshot.map(a => a.name).join(', ')}]`
        : '')
    const userMsg: ChatMsg = { role: 'user', content: userLine }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-40)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || 'Анализирай прикачените файлове и помогни.',
          history,
          attachments: attachSnapshot,
        }),
      })
      const json = await res.json()
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: json.message ?? json.error ?? 'Няма отговор',
          contract: json.contract ?? undefined,
          imageUrl: json.imageUrl ?? undefined,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Грешка при връзка с Милена.' },
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
          right: 20,
          top: 72,
          transform: 'none',
          width: 52,
          height: 52,
          zIndex: 9000,
          background: 'linear-gradient(135deg, #500B1A, #A86B3D)',
          boxShadow: '0 8px 32px rgba(139,0,0,0.5)',
        }}
        aria-label="Милена AI"
        title="Милена — AI асистент"
      >
        <span style={{ fontSize: 22 }}>✦</span>
      </button>

      {open && (
        <div
          className="fixed flex flex-col rounded-2xl overflow-hidden"
          style={{
            right: 20,
            top: 132,
            transform: 'none',
            width: 'min(420px, calc(100vw - 40px))',
            maxHeight: 'min(560px, calc(100dvh - 148px))',
            zIndex: 9001,
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
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                Милена
                {milenaReady === true && (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac' }}
                  >
                    AI активен
                  </span>
                )}
                {milenaReady === false && (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(234,179,8,0.15)', color: '#fde047' }}
                  >
                    нужен ключ
                  </span>
                )}
              </p>
              <p className="text-[10px] text-[rgba(255,255,255,0.45)]">
                {milenaReady === false
                  ? 'Админ → Настройки → Милена AI → въведете OpenAI ключ'
                  : `Свободен разговор · ${milenaModel} · CRM · проекти · памет`}
              </p>
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
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[94%] ${
                  m.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={
                  m.role === 'user'
                    ? { background: '#500B1A', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }
                }
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.imageUrl && (
                  <a href={m.imageUrl} target="_blank" rel="noreferrer" className="block mt-2">
                    <img
                      src={m.imageUrl}
                      alt="Генерирана снимка"
                      className="rounded-lg max-h-40 w-full object-cover"
                    />
                  </a>
                )}
                {m.contract && (
                  <button
                    type="button"
                    onClick={() => downloadContract(m.contract!)}
                    className="mt-2 text-[11px] font-semibold underline text-crimson-400"
                  >
                    Изтегли — {m.contract.title}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <p className="text-xs text-[rgba(255,255,255,0.4)] italic">Милена работи…</p>
            )}
            <div ref={bottomRef} />
          </div>

          {attachments.length > 0 && (
            <div className="px-3 pb-1 flex flex-wrap gap-1">
              {attachments.map((a, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80"
                >
                  {a.name}
                  <button
                    type="button"
                    className="ml-1"
                    onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(196,30,58,0.2)' }}>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={e => uploadFiles(e.target.files)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="px-2 py-2 rounded-lg border border-white/15 text-white/70 text-sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Прикачи файл"
              >
                📎
              </button>
              <input
                className="input-dark flex-1 text-sm"
                placeholder="Пишете свободно — задача, въпрос, проект…"
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
                disabled={loading || uploading || (!input.trim() && !attachments.length)}
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
