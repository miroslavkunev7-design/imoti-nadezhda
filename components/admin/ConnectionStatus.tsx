'use client'

import { useEffect, useState } from 'react'
import { cardStyle } from '@/components/admin/AdminCard'

type Health = {
  success: boolean
  bridgeConfigured: boolean
  uploadConfigured: boolean
  mediaBase: string | null
  db: { ok: boolean; propertyCount: number; error: string | null }
  upload: { ok: boolean; error: string | null }
  hints: string[]
}

export default function ConnectionStatus() {
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mb-5 rounded-xl p-5" style={cardStyle}>
        <p className="text-sm text-[rgba(255,255,255,0.5)]">Проверка на връзката с базата...</p>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="mb-5 rounded-xl p-5 border border-red-500/40" style={cardStyle}>
        <p className="text-red-400 text-sm font-medium">Не може да се провери връзката</p>
      </div>
    )
  }

  const allOk = health.db.ok && health.upload.ok

  return (
    <div
      className="mb-5 rounded-xl p-5"
      style={{
        ...cardStyle,
        border: allOk ? '1px solid rgba(74,222,128,0.35)' : '1px solid rgba(248,113,113,0.45)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${allOk ? 'bg-green-400' : 'bg-red-400'}`} />
        <h2 className="font-display text-white font-semibold text-sm">
          {allOk ? 'Базата и снимките са свързани' : 'Базата или снимките НЕ са свързани правилно'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
        <StatusRow
          label="MySQL (InfinityFree)"
          ok={health.db.ok}
          detail={health.db.ok ? `${health.db.propertyCount} обяви в базата` : (health.db.error ?? 'Грешка')}
        />
        <StatusRow
          label="Качване на снимки"
          ok={health.upload.ok}
          detail={health.upload.ok ? 'upload.php работи' : (health.upload.error ?? 'Не е настроено')}
        />
        {health.mediaBase && (
          <StatusRow label="URL на снимки" ok={true} detail={health.mediaBase} />
        )}
      </div>

      {health.hints.length > 0 && (
        <ul className="text-xs text-[rgba(255,255,255,0.55)] space-y-1 list-disc pl-4">
          {health.hints.map(h => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <p className="text-[rgba(255,255,255,0.45)] text-xs mb-0.5">{label}</p>
      <p className={ok ? 'text-green-400' : 'text-red-400'}>{detail}</p>
    </div>
  )
}
