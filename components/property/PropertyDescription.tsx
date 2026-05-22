interface PropertyDescriptionProps {
  description: string | null
}

export default function PropertyDescription({ description }: PropertyDescriptionProps) {
  if (!description) return null

  // Split by newlines and render as paragraphs / bullet points
  const lines = description.split('\n').filter(l => l.trim())

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <h2 className="font-display text-[1.2rem] font-semibold text-themed-primary mb-4">
        Описание
      </h2>
      <div className="flex flex-col gap-3">
        {lines.map((line, i) => {
          const isBullet = line.startsWith('-') || line.startsWith('•')
          if (isBullet) {
            return (
              <div key={i} className="flex items-start gap-2">
                <span className="text-crimson-700 mt-1 flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <p className="text-sm text-themed-secondary leading-relaxed">
                  {line.replace(/^[-•]\s*/, '')}
                </p>
              </div>
            )
          }
          return (
            <p key={i} className="text-sm text-themed-secondary leading-relaxed">
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
