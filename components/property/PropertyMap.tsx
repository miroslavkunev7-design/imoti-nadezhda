interface PropertyMapProps {
  address: string
  quarterName: string
  cityName: string
  compact?: boolean
  variant?: 'default' | 'detail'
}

export default function PropertyMap({
  quarterName,
  cityName,
  compact = false,
  variant = 'default',
}: PropertyMapProps) {
  const query = encodeURIComponent(`${quarterName}, ${cityName}, България`)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
  const isDetail = variant === 'detail'

  if (isDetail || compact) {
    if (isDetail) {
      return (
        <>
          <div className="pd-map-head">
            <h2 className="pd-panel-title" style={{ margin: 0 }}>Локация</h2>
            <p>кв. {quarterName}, {cityName}</p>
          </div>
          <div className="pd-map-area">
            <div className="pd-map-pin">
              <span className="pd-map-label">кв. {quarterName}</span>
              <svg width="22" height="28" viewBox="0 0 20 24" fill="var(--pd-accent)">
                <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10zm0 13.5c-1.93 0-3.5-1.57-3.5-3.5S8.07 6.5 10 6.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </div>
          </div>
          <div className="pd-map-btn-wrap">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pd-map-btn">
              Виж в Google Maps →
            </a>
          </div>
        </>
      )
    }

    return (
      <div className="rounded-xl h-full flex flex-col overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="font-display text-sm font-semibold">Локация</h2>
        </div>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-center py-2 text-crimson-700">Google Maps →</a>
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 py-4" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="font-display text-[1.2rem] font-semibold text-themed-primary">Локация</h2>
        <span className="text-sm text-themed-secondary">кв. {quarterName}, {cityName}</span>
      </div>
      <div className="px-5 py-4">
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-crimson w-full justify-center py-2.5 text-sm">
          Виж в Google Maps →
        </a>
      </div>
    </div>
  )
}
