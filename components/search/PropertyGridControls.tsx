'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SORT_OPTIONS } from '@/lib/utils'

interface PropertyGridControlsProps {
  citySlug: string
  quarterSlug: string
  currentSort: string
}

export default function PropertyGridControls({
  citySlug,
  quarterSlug,
  currentSort,
}: PropertyGridControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') === 'list' ? 'list' : 'grid'

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    }
    const q = params.toString()
    router.push(`/cities/${citySlug}/${quarterSlug}${q ? `?${q}` : ''}`)
  }

  function handleSort(sort: string) {
    pushParams({ sort })
  }

  function setView(next: 'grid' | 'list') {
    pushParams({ view: next === 'grid' ? null : next })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="luxury-view-toggle" role="group" aria-label="Изглед">
        <button
          type="button"
          onClick={() => setView('grid')}
          className={view === 'grid' ? 'is-active' : ''}
          aria-label="Мрежа"
          aria-pressed={view === 'grid'}
        >
          <GridIcon />
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={view === 'list' ? 'is-active' : ''}
          aria-label="Списък"
          aria-pressed={view === 'list'}
        >
          <ListIcon />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-themed-secondary whitespace-nowrap">Сортирай по:</span>
        <select
          value={currentSort}
          onChange={e => handleSort(e.target.value)}
          className="input-dark text-xs py-2 px-3 w-auto"
          style={{ minWidth: 160 }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
