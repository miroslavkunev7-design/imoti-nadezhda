interface PropertyDescriptionProps {
  description: string | null
  compact?: boolean
  variant?: 'default' | 'detail'
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pd-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PropertyDescription({
  description,
  compact = false,
  variant = 'default',
}: PropertyDescriptionProps) {
  const isDetail = variant === 'detail'

  if (!description) {
    if (isDetail) {
      return (
        <>
          <h2 className="pd-panel-title">Описание</h2>
          <p className="pd-panel-scroll" style={{ color: 'var(--pd-text-muted)' }}>Няма описание</p>
        </>
      )
    }
    return (
      <div className={`rounded-xl h-full flex items-center justify-center ${compact ? 'p-3' : 'p-6'}`} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-xs text-themed-muted">Няма описание</p>
      </div>
    )
  }

  const lines = description.split('\n').filter(l => l.trim())

  if (isDetail) {
    return (
      <>
        <h2 className="pd-panel-title">Описание</h2>
        <div className="pd-panel-scroll">
          {lines.map((line, i) => {
            const isBullet = line.startsWith('-') || line.startsWith('•')
            const text = line.replace(/^[-•]\s*/, '').replace(/^✔️\s*/, '').trim()
            if (isBullet) {
              return (
                <div key={i} className="pd-bullet">
                  <CheckIcon />
                  <span>{text}</span>
                </div>
              )
            }
            return <p key={i} style={{ marginBottom: 6 }}>{line}</p>
          })}
        </div>
      </>
    )
  }

  return (
    <div className={`rounded-xl h-full flex flex-col overflow-hidden ${compact ? 'p-3' : 'p-6'}`} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <h2 className="font-display font-semibold text-themed-primary mb-4">Описание</h2>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 text-sm text-themed-secondary">
        {lines.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  )
}
