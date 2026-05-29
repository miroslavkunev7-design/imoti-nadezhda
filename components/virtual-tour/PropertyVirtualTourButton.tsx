'use client'

import { useState } from 'react'
import { useVirtualTour } from '@/hooks/useVirtualTour'
import VirtualTourFullscreen from '@/components/virtual-tour/VirtualTourFullscreen'

interface Props {
  propertyId: number
  propertyTitle?: string
}

export default function PropertyVirtualTourButton({ propertyId, propertyTitle }: Props) {
  const { tour, loading } = useVirtualTour(propertyId)
  const [open, setOpen] = useState(false)

  if (loading) return null
  if (!tour?.manifest?.frames?.length) return null

  return (
    <>
      <button
        type="button"
        className="vt-property-btn"
        onClick={() => setOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        3D Виртуален Оглед
      </button>
      <VirtualTourFullscreen
        manifest={tour.manifest}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
