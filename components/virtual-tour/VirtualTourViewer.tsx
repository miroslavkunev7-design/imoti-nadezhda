'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { VirtualTourManifest } from '@/types/virtual-tour'
import VirtualTourErrorBoundary from '@/components/virtual-tour/VirtualTourErrorBoundary'
import { normalizeTourManifest } from '@/lib/virtual-tour/normalize-manifest'

const PropertyStreetView = dynamic(
  () => import('@/components/virtual-tour/PropertyStreetView'),
  { ssr: false, loading: () => <div className="vt-viewer-loading">Подготовка на оглед…</div> }
)

interface Props {
  manifest: VirtualTourManifest
  onExit?: () => void
}

export default function VirtualTourViewer({ manifest: rawManifest, onExit }: Props) {
  const manifest = useMemo(() => normalizeTourManifest(rawManifest), [rawManifest])

  const hasNodes = (manifest.nodes?.length ?? 0) > 0

  if (!hasNodes) {
    return (
      <div className="vt-viewer vt-viewer--empty">
        <p>Няма виртуализирани точки. Генерирайте тура отново от CRM.</p>
      </div>
    )
  }

  return (
    <div className="vt-viewer vt-viewer--street">
      <VirtualTourErrorBoundary
        fallback={
          <div className="vt-viewer vt-viewer--empty">
            <p>Разходката не може да се зареди. Опитайте отново.</p>
          </div>
        }
      >
        <PropertyStreetView manifest={manifest} onExit={onExit} />
      </VirtualTourErrorBoundary>
    </div>
  )
}
