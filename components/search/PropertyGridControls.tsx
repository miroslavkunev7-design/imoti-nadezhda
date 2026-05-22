'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
  const [view, setView] = useState<'grid' | 'list'>('grid')

  function handleSort(sort: string) {
    router.push(`/cities/${citySlug}/${quarterSlug}?sort=${sort}`)
  }

  return (
    <div className="flex items-center gap-3">
      {/* Grid / List toggle */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setView('grid')}
          className={[
            'px-3 py-2 transition-colors duration-150',
            view === 'grid'
              ? 'bg-crimson-700 text-white'
              : 'text-[#9b8f82] hover:text-white',
          ].join(' ')}
          aria-label="Мрежа"
        >
          <GridIcon />
        </button>
        <button
          onClick={() => setView('list')}
          className={[
            'px-3 py-2 transition-colors duration-150',
            view === 'list'
              ? 'bg-crimson-700 text-white'
              : 'text-[#9b8f82] hover:text-white',
          ].join(' ')}
          aria-label="Списък"
        >
          <ListIcon />
        </button>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#9b8f82] whitespace-nowrap">Сортирай по:</span>
        <select
          value={currentSort}
          onChange={e => handleSort(e.target.value)}
          className="input-dark text-xs py-2 px-3 w-auto"
          style={{ minWidth: 160 }}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
