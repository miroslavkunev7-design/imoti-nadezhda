'use client'

import { useState } from 'react'
import type { PropertyImage } from '@/types'
import PropertyBadge from '@/components/ui/PropertyBadge'
import { resolveMediaUrl } from '@/lib/upload-bridge'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
  isFeatured: boolean
  citySlug: string
  quarterSlug: string
}

export default function PropertyGallery({
  images,
  title,
  isFeatured,
  citySlug,
  quarterSlug,
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const total = images.length
  const current = images[activeIndex]
  const currentUrl = resolveMediaUrl(current?.image_url)

  function prev() { setActiveIndex(i => (i - 1 + total) % total) }
  function next() { setActiveIndex(i => (i + 1) % total) }

  const backHref = `/cities/${citySlug}/${quarterSlug}`

  return (
    <div className="flex flex-col gap-3">
      {/* Back link */}
      <a
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-themed-secondary hover:text-crimson-700 transition-colors duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Назад към списъка
      </a>

      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ aspectRatio: '16/10' }}
      >
        {/* Photo */}
        <div
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-300"
          style={{
            backgroundImage: currentUrl
              ? `url(${currentUrl})`
              : 'linear-gradient(135deg, #0f0a1a, #1a0a14)',
          }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,2,12,0.5) 0%, transparent 40%)' }}
        />

        {/* Badge */}
        {isFeatured && (
          <div className="absolute top-4 left-4 z-10">
            <PropertyBadge type="featured" />
          </div>
        )}

        {/* Counter */}
        <div
          className="absolute bottom-4 left-4 z-10 text-xs text-white font-medium"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            padding: '4px 10px',
            borderRadius: 6,
          }}
        >
          {activeIndex + 1} / {total}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center text-white transition-colors duration-200 hover:bg-crimson-700"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          aria-label="Fullscreen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:bg-crimson-700"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:bg-crimson-700"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => {
            const thumbUrl = resolveMediaUrl(img.image_url)
            return (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={[
                'flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200',
                i === activeIndex
                  ? 'ring-2 ring-crimson-700 opacity-100'
                  : 'opacity-55 hover:opacity-80',
              ].join(' ')}
              style={{ width: 80, height: 56 }}
            >
              <div
                className="w-full h-full bg-center bg-cover"
                style={{
                  backgroundImage: thumbUrl
                    ? `url(${thumbUrl})`
                    : 'linear-gradient(135deg, #0f0a1a, #1a0a14)',
                }}
              />
            </button>
          )})}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white"
            onClick={() => setFullscreen(false)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={currentUrl ?? ''}
            alt={title}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
