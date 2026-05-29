'use client'

import { useEffect, useRef } from 'react'
import { getCityPanoramaAsset } from '@/lib/data/city-background'
import { getSelectedCityFromCookie } from '@/lib/client/selected-city'

interface Props {
  citySlug: string
  cityCardImage?: string | null
}

export default function PropertyCityHero({ citySlug, cityCardImage }: Props) {
  const cookieCity = getSelectedCityFromCookie()
  const resolvedSlug = cookieCity || citySlug
  const asset = getCityPanoramaAsset(resolvedSlug, cityCardImage ?? null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = layerRef.current
    if (!el) return
    let raf = 0
    let t = 0
    const tick = () => {
      t += 0.00015
      const zoom = 1 + Math.sin(t) * 0.018
      el.style.transform = `scale(${zoom})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = layerRef.current
      if (!el) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      el.style.backgroundPosition = `calc(${asset.position ?? 'center center'} + ${nx * -8}px) calc(50% + ${ny * -5}px)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [asset.position])

  return (
    <div className="pd-city-hero" aria-hidden>
      <div
        ref={layerRef}
        className="pd-city-hero__panorama"
        style={{
          backgroundImage: `url(${asset.jpg})`,
          backgroundPosition: asset.position ?? 'center 42%',
        }}
      />
      <div className="pd-city-hero__sunset" />
      <div className="pd-city-hero__terrace" />
      <div className="pd-city-hero__marble" />
    </div>
  )
}
