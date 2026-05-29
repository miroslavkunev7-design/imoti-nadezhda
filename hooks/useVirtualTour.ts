'use client'

import { useCallback, useEffect, useState } from 'react'
import type { VirtualTourManifest } from '@/types/virtual-tour'
import { normalizeTourManifest } from '@/lib/virtual-tour/normalize-manifest'

export interface PublicTourPayload {
  id: number
  propertyId: number
  mode: 'walkthrough_3d' | 'slideshow'
  manifest: VirtualTourManifest
  thumbnailUrl: string | null
  frameCount: number
  durationSec: number
}

export function useVirtualTour(propertyId: number | null) {
  const [tour, setTour] = useState<PublicTourPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/virtual-tours/property/${propertyId}`)
      const json = await res.json()
      if (!json.success) {
        setTour(null)
        setError(json.error ?? 'Няма тур')
        return
      }
      setTour({
        ...json.tour,
        manifest: normalizeTourManifest(json.tour.manifest as VirtualTourManifest),
      })
    } catch {
      setError('Грешка при зареждане')
      setTour(null)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    load()
  }, [load])

  return { tour, loading, error, reload: load }
}
