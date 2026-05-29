'use client'

import { useCallback, useState } from 'react'
import { analyzeAllImagesClient } from '@/lib/virtual-tour/client/analyzer-client'
import type { PipelineStepId, VirtualTourManifest } from '@/types/virtual-tour'
import { PIPELINE_STEPS } from '@/types/virtual-tour'

export interface PipelineState {
  step: PipelineStepId
  percent: number
  label: string
  error: string | null
  running: boolean
  tourId: number | null
  manifest: VirtualTourManifest | null
}

const STEP_PERCENT: Record<PipelineStepId, number> = {
  idle: 0,
  analyzing: 18,
  sorting: 35,
  smoothing: 52,
  generating: 72,
  preview: 88,
  editing: 90,
  publishing: 96,
  done: 100,
}

export function useVirtualTourPipeline(propertyId: number) {
  const [state, setState] = useState<PipelineState>({
    step: 'idle',
    percent: 0,
    label: '',
    error: null,
    running: false,
    tourId: null,
    manifest: null,
  })

  const setStep = useCallback((step: PipelineStepId, extra?: Partial<PipelineState>) => {
    const label = PIPELINE_STEPS.find(s => s.id === step)?.label ?? step
    setState(prev => ({
      ...prev,
      step,
      percent: STEP_PERCENT[step] ?? prev.percent,
      label,
      ...extra,
    }))
  }, [])

  const runFullPipeline = useCallback(
    async (imageUrls: string[]) => {
      setState({
        step: 'analyzing',
        percent: 8,
        label: 'Анализиране…',
        error: null,
        running: true,
        tourId: null,
        manifest: null,
      })

      try {
        setStep('analyzing')
        const clientHints = await analyzeAllImagesClient(imageUrls)

        setStep('sorting')
        const res = await fetch('/api/admin/virtual-tours/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            propertyId,
            imageUrls,
            clientHints,
            publish: true,
          }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Грешка при генериране')

        setStep('generating', { percent: 78 })
        setStep('preview', { percent: 90 })
        setStep('publishing', { percent: 96 })
        setStep('done', {
          running: false,
          tourId: json.tourId,
          manifest: json.manifest,
          percent: 100,
        })

        return {
          tourId: json.tourId as number,
          manifest: json.manifest as VirtualTourManifest,
          mode: json.mode as string,
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Грешка'
        setState(prev => ({
          ...prev,
          running: false,
          error: msg,
          step: 'idle',
        }))
        throw err
      }
    },
    [propertyId, setStep]
  )

  return { state, runFullPipeline, setStep }
}
