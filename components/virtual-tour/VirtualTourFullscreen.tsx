'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { VirtualTourManifest } from '@/types/virtual-tour'
import VirtualTourViewer from '@/components/virtual-tour/VirtualTourViewer'
import { useAutoFullscreenOnMount, useFullscreenTour } from '@/hooks/useFullscreenTour'

interface Props {
  manifest: VirtualTourManifest
  open: boolean
  onClose: () => void
}

/** Fullscreen immersive walkthrough — no pre-launch menus */
export default function VirtualTourFullscreen({ manifest, open, onClose }: Props) {
  const shellRef = useRef<HTMLDivElement>(null)
  const { exit } = useFullscreenTour(shellRef)

  useAutoFullscreenOnMount(shellRef, open)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleExit = () => {
    exit().finally(onClose)
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={shellRef}
      className="vt-fullscreen vt-fullscreen--immersive"
      role="dialog"
      aria-modal="true"
      aria-label="3D виртуален оглед"
    >
      <VirtualTourViewer manifest={manifest} onExit={handleExit} />
    </div>,
    document.body
  )
}
