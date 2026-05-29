'use client'

import { useState } from 'react'
import type { PropertyImage } from '@/types'
import { resolveMediaUrl } from '@/lib/upload-bridge'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
  isFeatured: boolean
  citySlug?: string
  quarterSlug?: string
  compact?: boolean
  variant?: 'default' | 'detail'
}

export default function PropertyGallery({
  images,
  title,
  isFeatured,
  compact = false,
  variant = 'default',
}: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const isDetail = variant === 'detail'

  const total = Math.max(images.length, 1)
  const current = images[activeIndex]
  const currentUrl = resolveMediaUrl(current?.image_url)

  function prev() { setActiveIndex(i => (i - 1 + total) % total) }
  function next() { setActiveIndex(i => (i + 1) % total) }

  if (isDetail) {
    return (
      <div className="pd-gallery-wrap">
        <div className="pd-gallery-main">
          {currentUrl ? (
            <img src={currentUrl} alt={title} loading="eager" decoding="async" />
          ) : (
            <div
              className="pd-gallery-bg"
              style={{ backgroundImage: 'linear-gradient(135deg, #141414, #1a080c)' }}
            />
          )}

          {isFeatured && <span className="pd-badge-top">Топ оферта</span>}

          <div className="pd-gallery-toolbar">
            <span className="pd-gallery-meta">{activeIndex + 1} / {total}</span>
            <button type="button" className="pd-gallery-fs" onClick={() => setFullscreen(true)} aria-label="Цял екран">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>

          {total > 1 && (
            <>
              <button type="button" className="pd-gallery-nav pd-gallery-nav--prev" onClick={prev} aria-label="Предишна">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button type="button" className="pd-gallery-nav pd-gallery-nav--next" onClick={next} aria-label="Следваща">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="pd-gallery-footer">
          {total > 1 ? (
            <div className="pd-thumbs">
              {images.map((img, i) => {
                const thumbUrl = resolveMediaUrl(img.image_url)
                return (
                  <button
                    key={img.id}
                    type="button"
                    className={`pd-thumb${i === activeIndex ? ' is-active' : ''}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <span className="pd-gallery-bg" style={{ background: '#1a1a1a' }} />
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="pd-thumbs-spacer" />
          )}
        </div>

        {fullscreen && currentUrl && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button type="button" className="absolute top-5 right-5 text-white/80" onClick={() => setFullscreen(false)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img
              src={currentUrl}
              alt={title}
              className="max-w-[92vw] max-h-[92vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    )
  }

  const thumbW = compact ? 64 : 80
  const thumbH = compact ? 44 : 56

  return (
    <div className={`flex flex-col ${compact ? 'h-full min-h-0 gap-2' : 'gap-3'}`}>
      <div
        className="relative overflow-hidden rounded-xl"
        style={compact ? undefined : { aspectRatio: '16/10' }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: currentUrl ? `url(${currentUrl})` : 'linear-gradient(135deg, #0f0a1a, #1a0a14)',
          }}
        />
        {isFeatured && (
          <div className="absolute top-4 left-4 z-10">
            <span className="badge-top">Топ оферта</span>
          </div>
        )}
        {total > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 text-white">‹</button>
            <button type="button" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/55 text-white">›</button>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setActiveIndex(i)} style={{ width: thumbW, height: thumbH }} className="rounded-lg overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: resolveMediaUrl(img.image_url) ? `url(${resolveMediaUrl(img.image_url)})` : undefined }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
