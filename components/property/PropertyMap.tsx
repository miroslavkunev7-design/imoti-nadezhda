interface PropertyMapProps {
  address: string
  quarterName: string
  cityName: string
}

export default function PropertyMap({ address, quarterName, cityName }: PropertyMapProps) {
  const query = encodeURIComponent(`${quarterName}, ${cityName}, България`)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <h2 className="font-display text-[1.2rem] font-semibold text-themed-primary">
          Локация
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <svg className="text-crimson-700 flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="text-sm text-themed-secondary">
            кв. {quarterName}, {cityName}
          </span>
        </div>
      </div>

      {/* Map placeholder — dark styled */}
      <div
        className="relative"
        style={{ height: 220, background: 'var(--bg-elevated)' }}
      >
        {/* Stylized map grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Neighborhood labels */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Surrounding labels */}
            <span className="absolute top-6 left-8 text-[11px] text-themed-muted">кв. Добруджански</span>
            <span className="absolute top-6 right-8 text-[11px] text-themed-muted">кв. Дивдядово</span>
            <span className="absolute bottom-8 left-8 text-[11px] text-themed-muted">кв. Център</span>
            <span className="absolute bottom-8 right-8 text-[11px] text-themed-muted">кв. 5-та пим</span>

            {/* Center pin (current quarter) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              <div
                className="text-[11px] font-semibold text-white px-2 py-1 rounded"
                style={{ background: '#c41e3a' }}
              >
                кв. {quarterName}
              </div>
              <svg width="20" height="24" viewBox="0 0 20 24" fill="#c41e3a">
                <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10zm0 13.5c-1.93 0-3.5-1.57-3.5-3.5S8.07 6.5 10 6.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Open in Maps CTA */}
      <div
        className="px-5 py-4"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-crimson w-full justify-center py-2.5 text-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Виж в Google Maps
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
