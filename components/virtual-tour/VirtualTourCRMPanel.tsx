'use client'

import { useCallback, useState } from 'react'
import { useVirtualTourPipeline } from '@/hooks/useVirtualTourPipeline'
import VirtualTourProgress from '@/components/virtual-tour/VirtualTourProgress'
import VirtualTourFullscreen from '@/components/virtual-tour/VirtualTourFullscreen'
import VirtualTourEditor from '@/components/virtual-tour/VirtualTourEditor'
import type { VirtualTourManifest } from '@/types/virtual-tour'
import { MIN_FRAMES_SLIDESHOW } from '@/lib/virtual-tour/constants'

interface Props {
  propertyId: number
  imageUrls: string[]
}

export default function VirtualTourCRMPanel({ propertyId, imageUrls }: Props) {
  const { state, runFullPipeline } = useVirtualTourPipeline(propertyId)
  const [manifest, setManifest] = useState<VirtualTourManifest | null>(null)
  const [tourId, setTourId] = useState<number | null>(null)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  const canGenerate = imageUrls.length >= MIN_FRAMES_SLIDESHOW

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return
    setShowEditor(false)
    setFullscreenOpen(false)
    try {
      const result = await runFullPipeline(imageUrls)
      setManifest(result.manifest)
      setTourId(result.tourId)
      setFullscreenOpen(true)
    } catch {
      /* error in state */
    }
  }, [canGenerate, imageUrls, runFullPipeline])

  return (
    <div className="vt-crm">
      <div className="vt-crm__head">
        <h2 className="font-display text-white font-semibold">AI Virtual Tour Engine</h2>
        <p className="text-sm text-themed-secondary mt-1">
          Един бутон: автоматичен анализ → подреждане → 3D разходка → fullscreen
        </p>
      </div>

      {!canGenerate && (
        <p className="vt-crm__warn">
          Качете поне {MIN_FRAMES_SLIDESHOW} снимки — системата ги подрежда автоматично.
        </p>
      )}

      <button
        type="button"
        className="vt-crm__generate btn-crimson w-full sm:w-auto px-8 py-3 text-sm font-semibold tracking-wide"
        disabled={!canGenerate || state.running}
        onClick={handleGenerate}
      >
        {state.running ? 'Генериране...' : 'Генерирай виртуален тур'}
      </button>

      {(state.running || state.step !== 'idle') && (
        <VirtualTourProgress
          currentStep={state.step}
          percent={state.percent}
          label={state.label}
        />
      )}

      {state.error && <p className="vt-crm__error">{state.error}</p>}

      {manifest && tourId && !state.running && (
        <div className="vt-crm__actions">
          <button type="button" className="btn-ghost text-sm" onClick={() => setFullscreenOpen(true)}>
            Преглед на цял екран
          </button>
          <button type="button" className="btn-ghost text-sm" onClick={() => setShowEditor(v => !v)}>
            {showEditor ? 'Скрий редактора' : 'Редакция'}
          </button>
        </div>
      )}

      {showEditor && manifest && tourId && (
        <VirtualTourEditor
          manifest={manifest}
          tourId={tourId}
          onSaved={m => {
            setManifest(m)
            setShowEditor(false)
          }}
        />
      )}

      {manifest && (
        <VirtualTourFullscreen
          manifest={manifest}
          open={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
        />
      )}
    </div>
  )
}
