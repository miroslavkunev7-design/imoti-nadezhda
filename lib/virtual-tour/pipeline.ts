import type { SceneAnalysisRecord, SceneType, VirtualTourMode } from '@/types/virtual-tour'
import { MIN_FRAMES_SLIDESHOW } from '@/lib/virtual-tour/constants'
import { analyzeImagesServer } from '@/lib/virtual-tour/analyzer-server'
import { sortAnalysesChaoticRoute } from '@/lib/virtual-tour/sorter'
import { buildCameraKeyframes, totalDurationMs } from '@/lib/virtual-tour/smoothing'
import { processAllFrames } from '@/lib/virtual-tour/ffmpeg-pipeline'
import { buildManifest, DEFAULT_TOUR_SETTINGS } from '@/lib/virtual-tour/manifest'
import {
  createVirtualTour,
  finalizeTour,
  getTourSettings,
  markTourFailed,
  replaceTourFrames,
  saveSceneAnalyses,
  updateTourProgress,
} from '@/lib/virtual-tour/repository'
import type { TourFrame } from '@/types/virtual-tour'

export interface PipelineInput {
  propertyId: number
  imageUrls: string[]
  clientHints?: Array<{ sceneType: SceneType; confidence: number; embedding?: number[] } | undefined>
  publish?: boolean
}

export interface PipelineResult {
  tourId: number
  mode: VirtualTourMode
  manifest: ReturnType<typeof buildManifest>
  frameCount: number
}

export async function runVirtualTourPipeline(input: PipelineInput): Promise<PipelineResult> {
  const urls = input.imageUrls.filter(Boolean).slice(0, 50)
  if (urls.length < MIN_FRAMES_SLIDESHOW) {
    throw new Error('Нужни са поне 2 снимки за виртуален тур')
  }

  const tour = await createVirtualTour(input.propertyId)
  if (!tour) throw new Error('Базата данни не е конфигурирана')

  const tourId = tour.id

  try {
    await updateTourProgress(tourId, 'analyzing', 12)
    const rawAnalyses = await analyzeImagesServer(urls, input.clientHints)
    if (!rawAnalyses.length) throw new Error('Неуспешен анализ на снимките')

    await updateTourProgress(tourId, 'sorting', 32)
    const sorted = sortAnalysesChaoticRoute(rawAnalyses)
    await saveSceneAnalyses(tourId, sorted)

    await updateTourProgress(tourId, 'smoothing', 52)
    const settings = await getTourSettings(tourId)
    const keyframes = buildCameraKeyframes(sorted, {
      transitionStyle: settings.transitionStyle,
      easing: settings.easing,
      stabilization: settings.stabilization,
      frameBlend: settings.frameBlend,
      autoplaySpeed: settings.autoplaySpeed,
    })

    await updateTourProgress(tourId, 'generating', 68)
    const processed = await processAllFrames(
      keyframes.map(k => k.imageUrl),
      settings.stabilization
    )

    const sortedForGraph = sorted.map((a, i) => {
      const p = processed[i]
      const url = p?.stabilizedUrl ?? ''
      const synthetic =
        url.includes('virtual-tours/panoramas') || url.startsWith('data:image')
      if (!p?.isEquirectangular || synthetic) return a
      return {
        ...a,
        features: { ...a.features, aspectRatio: p.aspectRatio ?? 2 },
      }
    })

    const mode: VirtualTourMode = 'walkthrough_3d'

    const frames: Array<Omit<TourFrame, 'id' | 'tourId'>> = keyframes.map((k, i) => ({
      imageUrl: processed[i]?.stabilizedUrl ?? k.imageUrl,
      sceneType: k.sceneType,
      sortOrder: i,
      durationMs: k.durationMs,
      cameraPosition: k.cameraPosition,
      cameraTarget: k.cameraTarget,
      transition: k.transition,
      stabilizedUrl: processed[i]?.stabilizedUrl ?? null,
    }))

    const savedFrames = await replaceTourFrames(tourId, frames)
    const totalMs = totalDurationMs(savedFrames)
    const manifest = buildManifest({
      propertyId: input.propertyId,
      tourId,
      mode,
      frames: savedFrames,
      settings,
      fallbackSlideshow: false,
      sortedAnalyses: sortedForGraph,
    })

    await updateTourProgress(tourId, 'publishing', input.publish ? 92 : 88)
    await finalizeTour({
      tourId,
      propertyId: input.propertyId,
      manifest,
      mode,
      status: input.publish ? 'published' : 'ready',
      thumbnailUrl: savedFrames[0]?.stabilizedUrl ?? savedFrames[0]?.imageUrl ?? null,
      frameCount: savedFrames.length,
      durationSec: Math.round((totalMs / 1000) * 10) / 10,
      publish: input.publish,
    })

    await updateTourProgress(tourId, 'done', 100)

    return { tourId, mode, manifest, frameCount: savedFrames.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Грешка при генериране'
    await markTourFailed(tourId, msg)
    throw err
  }
}

export type { SceneAnalysisRecord }
