'use client'

import { useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import type { VirtualTourManifest } from '@/types/virtual-tour'
import { SCENE_LABELS_BG } from '@/lib/virtual-tour/constants'

interface Props {
  manifest: VirtualTourManifest
  autoplay?: boolean
  onFrameChange?: (index: number) => void
}

export default function VirtualTourSlideshow({
  manifest,
  autoplay = true,
  onFrameChange,
}: Props) {
  const frames = manifest.frames
  const [index, setIndex] = useState(0)
  const speed = manifest.settings.autoplaySpeed

  const go = useCallback(
    (next: number) => {
      const i = (next + frames.length) % frames.length
      setIndex(i)
      onFrameChange?.(i)
    },
    [frames.length, onFrameChange]
  )

  useEffect(() => {
    if (!autoplay || frames.length < 2) return
    const ms = frames[index]?.durationMs ?? 3200
    const id = setTimeout(() => go(index + 1), ms / speed)
    return () => clearTimeout(id)
  }, [autoplay, index, frames, go, speed])

  useEffect(() => {
    gsap.fromTo(
      '.vt-slide-img',
      { opacity: 0, scale: 1.04, filter: 'blur(6px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.85, ease: manifest.settings.easing }
    )
  }, [index, manifest.settings.easing])

  const frame = frames[index]
  if (!frame) return null

  return (
    <div className="vt-slideshow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={frame.imageUrl}
        src={frame.imageUrl}
        alt={SCENE_LABELS_BG[frame.sceneType]}
        className="vt-slide-img"
        loading="lazy"
        decoding="async"
      />
      <div className="vt-slideshow__caption">
        <span>{SCENE_LABELS_BG[frame.sceneType]}</span>
        <span>
          {index + 1} / {frames.length}
        </span>
      </div>
      <button type="button" className="vt-slideshow__nav vt-slideshow__nav--prev" onClick={() => go(index - 1)} aria-label="Предишна" />
      <button type="button" className="vt-slideshow__nav vt-slideshow__nav--next" onClick={() => go(index + 1)} aria-label="Следваща" />
    </div>
  )
}
