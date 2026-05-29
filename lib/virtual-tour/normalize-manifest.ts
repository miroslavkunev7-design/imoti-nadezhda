import type { TourFrame, Vec3, VirtualTourManifest } from '@/types/virtual-tour'
import { buildSceneGraphFromFrames } from '@/lib/virtual-tour/scene-graph'
import type { SceneGraphResult } from '@/lib/virtual-tour/scene-graph'
import { buildGuidedPath } from '@/lib/virtual-tour/guided-path'
import { isEquirectangularAspect } from '@/lib/virtual-tour/panorama-detect'
import { normalizeSceneType } from '@/lib/virtual-tour/scene-route'

function downgradeFalsePanoramas(graph: SceneGraphResult): SceneGraphResult {
  return {
    ...graph,
    nodes: graph.nodes.map(node => {
      const steps = node.steps.map(s => {
        const keep360 =
          s.viewKind === 'panorama360' &&
          s.aspectRatio != null &&
          isEquirectangularAspect(s.aspectRatio)
        return {
          ...s,
          viewKind: (keep360 ? 'panorama360' : s.viewKind === 'panorama360' ? 'step' : s.viewKind) as typeof s.viewKind,
        }
      })
      const hasPanorama = steps.some(s => s.viewKind === 'panorama360')
      return {
        ...node,
        steps,
        kind: hasPanorama ? node.kind : 'room',
      }
    }),
  }
}

function asVec3(v: unknown, fallback: Vec3): Vec3 {
  if (!v || typeof v !== 'object') return fallback
  const o = v as Record<string, unknown>
  const x = Number(o.x)
  const y = Number(o.y)
  const z = Number(o.z)
  return {
    x: Number.isFinite(x) ? x : fallback.x,
    y: Number.isFinite(y) ? y : fallback.y,
    z: Number.isFinite(z) ? z : fallback.z,
  }
}

export function normalizeTourManifest(manifest: VirtualTourManifest): VirtualTourManifest {
  const defaultCam: Vec3 = { x: 0, y: 1.65, z: 8 }
  const defaultTarget: Vec3 = { x: 0, y: 1.65, z: 0 }

  const frames = (manifest.frames ?? [])
    .map((f, i) => {
      const imageUrl = (f.imageUrl || f.stabilizedUrl || '').trim()
      if (!imageUrl) return null
      return {
        ...f,
        id: f.id ?? i,
        sortOrder: f.sortOrder ?? i,
        imageUrl,
        sceneType: normalizeSceneType(f.sceneType),
        durationMs: Number(f.durationMs) > 0 ? Number(f.durationMs) : 3200,
        cameraPosition: asVec3(f.cameraPosition, defaultCam),
        cameraTarget: asVec3(f.cameraTarget, defaultTarget),
        transition: {
          style: f.transition?.style ?? 'cinematic',
          ease: f.transition?.ease ?? 'power2.inOut',
        },
      }
    })
    .filter((f): f is NonNullable<typeof f> => Boolean(f))

  const tourFrames: TourFrame[] = frames.map((f, i) => ({
    id: f.id,
    tourId: manifest.tourId,
    imageUrl: f.imageUrl,
    sceneType: f.sceneType,
    sortOrder: f.sortOrder ?? i,
    durationMs: f.durationMs,
    cameraPosition: f.cameraPosition,
    cameraTarget: f.cameraTarget,
    transition: f.transition,
    stabilizedUrl: f.stabilizedUrl ?? null,
  }))

  const storedNodes = manifest.nodes?.length ?? 0
  const shouldRebuildGraph =
    storedNodes === 0 ||
    (tourFrames.length >= 4 && storedNodes < Math.min(tourFrames.length, 8))

  const graphRaw = shouldRebuildGraph
    ? buildSceneGraphFromFrames(tourFrames)
    : {
        nodes: manifest.nodes!.map(n => ({
          ...n,
          sceneType: normalizeSceneType(n.sceneType),
        })),
        edges: manifest.edges ?? [],
        startNodeId: manifest.startNodeId ?? manifest.nodes![0].id,
      }

  const graph = downgradeFalsePanoramas(graphRaw)
  const guidedPath =
    manifest.guidedPath?.length && manifest.version === 3
      ? manifest.guidedPath
      : buildGuidedPath(graph, [])

  return {
    ...manifest,
    version: 3,
    mode: 'walkthrough_3d',
    fallbackSlideshow: false,
    guidedPath,
    frames: graph.nodes.flatMap(n =>
      n.steps.map(s => ({
        id: s.id,
        imageUrl: s.imageUrl,
        sceneType: normalizeSceneType(s.sceneType),
        sortOrder: s.sortOrder,
        durationMs: s.durationMs,
        cameraPosition: s.cameraPosition,
        cameraTarget: s.cameraTarget,
        transition: s.transition,
        stabilizedUrl: s.stabilizedUrl ?? null,
        viewKind: s.viewKind,
      }))
    ),
    nodes: graph.nodes,
    edges: graph.edges,
    startNodeId: graph.startNodeId,
    settings: {
      autoplaySpeed: Number(manifest.settings?.autoplaySpeed) || 1,
      transitionStyle: manifest.settings?.transitionStyle ?? 'cinematic',
      easing: manifest.settings?.easing ?? 'power2.inOut',
      stabilization: manifest.settings?.stabilization ?? true,
      frameBlend: manifest.settings?.frameBlend ?? true,
      trimStartMs: manifest.settings?.trimStartMs ?? 0,
      trimEndMs: manifest.settings?.trimEndMs ?? 0,
      editorOrder: manifest.settings?.editorOrder ?? [],
    },
    totalDurationMs: guidedPath.reduce((s, seg) => s + seg.durationMs, 0),
  }
}
