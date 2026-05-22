'use client'

import { useState } from 'react'

interface FavoriteButtonProps {
  propertyId: number
  initialFaved?: boolean
  className?: string
}

export default function FavoriteButton({
  propertyId,
  initialFaved = false,
  className = '',
}: FavoriteButtonProps) {
  const [faved, setFaved] = useState(initialFaved)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: faved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      if (res.ok) setFaved(v => !v)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={faved ? 'Премахни от любими' : 'Добави в любими'}
      className={[
        'w-8 h-8 rounded-full flex items-center justify-center',
        'transition-all duration-200',
        'backdrop-blur-sm',
        faved
          ? 'bg-crimson-700 text-white'
          : 'bg-[rgba(8,6,18,0.7)] text-[#9b8f82] hover:text-crimson-400 border border-[rgba(255,255,255,0.1)]',
        loading ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={faved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  )
}
