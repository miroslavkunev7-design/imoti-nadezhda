import type {
  SceneAnalysisRecord,
  TourFrame,
  TourSettings,
  VirtualTourManifest,
  VirtualTourMode,
} from '@/types/virtual-tour'
import { totalDurationMs } from '@/lib/virtual-tour/smoothing'
import { buildSceneGraph, buildSceneGraphFromFrames } from '@/lib/virtual-tour/scene-graph'
import { buildGuidedPath } from '@/lib/virtual-tour/guided-path'

export function buildManifest(params: {
  propertyId: number
  tourId: number
  mode: VirtualTourMode
  frames: TourFrame[]
  settings: TourSettings
  fallbackSlideshow: boolean
  sortedAnalyses?: SceneAnalysisRecord[]
}): VirtualTourManifest {
  const graph = params.sortedAnalyses?.length
    ? buildSceneGraph(params.sortedAnalyses, params.frames)
    : buildSceneGraphFromFrames(params.frames)

  const flatFrames = graph.nodes.flatMap(n =>
    n.steps.map(s => ({
      id: s.id,
      imageUrl: s.imageUrl,
      sceneType: s.sceneType,
      sortOrder: s.sortOrder,
      durationMs: s.durationMs,
      cameraPosition: s.cameraPosition,
      cameraTarget: s.cameraTarget,
      transition: s.transition,
      stabilizedUrl: s.stabilizedUrl ?? null,
      viewKind: s.viewKind,
    }))
  )

  const guidedPath = params.sortedAnalyses?.length
    ? buildGuidedPath(graph, params.sortedAnalyses)
    : buildGuidedPath(graph, [])

  const totalMs = guidedPath.reduce((s, seg) => s + seg.durationMs, 0) || flatFrames.reduce((s, f) => s + f.durationMs, 0)

  return {
    version: 3,
    mode: params.mode,
    guidedPath,
    propertyId: params.propertyId,
    tourId: params.tourId,
    frames: flatFrames,
    nodes: graph.nodes,
    edges: graph.edges,
    startNodeId: graph.startNodeId,
    settings: params.settings,
    totalDurationMs: totalMs,
    fallbackSlideshow: params.fallbackSlideshow,
  }
}

export const DEFAULT_TOUR_SETTINGS: TourSettings = {
  autoplaySpeed: 1,
  transitionStyle: 'cinematic',
  easing: 'power2.inOut',
  stabilization: true,
  frameBlend: true,
  trimStartMs: 0,
  trimEndMs: 0,
  editorOrder: [],
}
