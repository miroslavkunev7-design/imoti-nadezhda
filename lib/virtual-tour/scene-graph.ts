import type {
  SceneAnalysisRecord,
  SceneType,
  TourFrame,
  TourNavigationEdge,
  TourNode,
  TourStepFrame,
  Vec3,
} from '@/types/virtual-tour'
import { SCENE_LABELS_BG } from '@/lib/virtual-tour/constants'
import { normalizeSceneType } from '@/lib/virtual-tour/scene-route'
import { inferViewKind } from '@/lib/virtual-tour/panorama-detect'

const NODE_LAYOUT: Record<SceneType, Vec3> = {
  exterior_front: { x: 0, y: 0, z: 0 },
  exterior_side: { x: -1.5, y: 0, z: 0.5 },
  exterior: { x: 0, y: 0, z: 0 },
  yard: { x: 2, y: 0, z: 1 },
  entrance: { x: 0, y: 0, z: -4 },
  corridor: { x: 0, y: 0, z: -7 },
  hallway: { x: 0.5, y: 0, z: -8.5 },
  staircase: { x: -0.5, y: 0, z: -9 },
  living_room: { x: 3, y: 0, z: -11 },
  dining_area: { x: 5, y: 0, z: -10 },
  kitchen: { x: 6.5, y: 0, z: -9.5 },
  bedroom: { x: -3.5, y: 0, z: -12 },
  bathroom: { x: 1.5, y: 0, z: -13.5 },
  terrace: { x: 5, y: 0, z: -6 },
  balcony: { x: 4, y: 0, z: -7 },
  exit_point: { x: 0, y: 0, z: -15 },
  exit: { x: 0, y: 0, z: -15 },
  unknown: { x: 0, y: 0, z: -6 },
}

function edgeTransition(from: SceneType, to: SceneType): TourNavigationEdge['transition'] {
  const outdoor = ['exterior_front', 'exterior_side', 'exterior', 'yard']
  if (outdoor.includes(from) && to === 'entrance') return 'door'
  if (from === 'entrance' && (to === 'corridor' || to === 'hallway' || to === 'living_room')) return 'door'
  if (to === 'staircase' || from === 'staircase') return 'stairs'
  if (to === 'exit_point' || to === 'exit') return 'walk'
  return 'walk'
}

function groupSortedIntoRuns(sorted: SceneAnalysisRecord[]): SceneAnalysisRecord[][] {
  const runs: SceneAnalysisRecord[][] = []
  for (const a of sorted) {
    const last = runs[runs.length - 1]
    if (!last || last[0].sceneType !== a.sceneType) {
      runs.push([a])
    } else {
      last.push(a)
    }
  }
  return runs
}

/** Една снимка = една Street View точка (пълна свобода на движение между тях) */
function onePhotoPerViewpoint(sorted: SceneAnalysisRecord[]): SceneAnalysisRecord[][] {
  return sorted.map(a => [a])
}

export interface SceneGraphResult {
  nodes: TourNode[]
  edges: TourNavigationEdge[]
  startNodeId: string
}

export function buildSceneGraph(
  sorted: SceneAnalysisRecord[],
  savedFrames: TourFrame[]
): SceneGraphResult {
  const runs = onePhotoPerViewpoint(sorted)
  const nodes: TourNode[] = []
  const edges: TourNavigationEdge[] = []

  runs.forEach((run, nodeIndex) => {
    const sceneType = run[0].sceneType
    const nodeId = `node-${nodeIndex}-${sceneType}`
    const basePos = NODE_LAYOUT[sceneType] ?? NODE_LAYOUT.unknown

    const steps: TourStepFrame[] = run.map((analysis, stepIndex) => {
      const frame = savedFrames.find(
        f => f.imageUrl === analysis.imageUrl || f.imageUrl === analysis.imageUrl
      )
      const viewKind =
        analysis.features.aspectRatio >= 1.92
          ? 'panorama360'
          : inferViewKind(sceneType, analysis.features, run.length)
      const yaw = stepIndex * 0.18
      const forward = stepIndex * 0.35
      return {
        id: frame?.id ?? stepIndex,
        imageUrl: frame?.stabilizedUrl ?? frame?.imageUrl ?? analysis.imageUrl,
        sceneType,
        sortOrder: frame?.sortOrder ?? stepIndex,
        durationMs: frame?.durationMs ?? 2800,
        viewKind,
        stepIndex,
        yawOffset: viewKind === 'panorama360' ? 0 : yaw,
        positionOffset: {
          x: viewKind === 'panorama360' ? 0 : Math.sin(yaw) * 0.2,
          y: 0,
          z: viewKind === 'panorama360' ? 0 : -forward,
        },
        cameraPosition: frame?.cameraPosition ?? { x: 0, y: 1.55, z: 0.5 },
        cameraTarget: frame?.cameraTarget ?? { x: 0, y: 1.55, z: -4 },
        transition: frame?.transition ?? { style: 'cinematic', ease: 'power2.inOut' },
        aspectRatio: analysis.features.aspectRatio,
      }
    })

    const hasPanorama = steps.some(s => s.viewKind === 'panorama360')
    const kind = hasPanorama && steps.length === 1 ? 'panorama' : hasPanorama ? 'panorama' : 'room'

    const sceneLabel = SCENE_LABELS_BG[normalizeSceneType(sceneType)]
    const isOutdoor = ['exterior_front', 'exterior_side', 'exterior', 'yard'].includes(sceneType)
    const label =
      run.length === 1 && !isOutdoor
        ? `${sceneLabel} · изглед ${nodeIndex + 1}`
        : run.length === 1
          ? `${sceneLabel} (${nodeIndex + 1})`
          : sceneLabel

    nodes.push({
      id: nodeId,
      sceneType,
      label,
      kind,
      steps,
      position: {
        x: basePos.x + nodeIndex * 0.15,
        y: basePos.y,
        z: basePos.z,
      },
      hasDoor: sceneType === 'entrance' || sceneType === 'exit' || sceneType === 'exit_point',
      doorOpensTo: nodeIndex < runs.length - 1 ? `node-${nodeIndex + 1}-${runs[nodeIndex + 1][0].sceneType}` : undefined,
    })
  })

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i]
    const to = nodes[i + 1]
    edges.push({
      from: from.id,
      to: to.id,
      transition: edgeTransition(from.sceneType, to.sceneType),
      label: from.hasDoor && from.sceneType === 'entrance'
        ? 'Отвори вратата'
        : `Към ${to.label}`,
    })
    from.doorOpensTo = to.id
  }

  const startNodeId = nodes[0]?.id ?? ''
  return { nodes, edges, startNodeId }
}

function guessAspect(sceneType: SceneType): number {
  if (sceneType === 'corridor') return 1.35
  return 1.5
}

/** Rebuild graph from flat v1 frames (already sorted) */
export function buildSceneGraphFromFrames(frames: TourFrame[]): SceneGraphResult {
  const analyses: SceneAnalysisRecord[] = frames.map(f => ({
    imageUrl: f.imageUrl,
    sceneType: f.sceneType,
    confidence: 0.8,
    features: {
      meanR: 128,
      meanG: 128,
      meanB: 128,
      brightness: 0.5,
      saturation: 0.4,
      contrast: 0.4,
      aspectRatio: guessAspect(f.sceneType),
      edgeDensity: 0.3,
      warmth: 0.5,
      skyRatio: f.sceneType === 'exterior' ? 0.3 : 0,
      indoorScore: f.sceneType === 'exterior' ? 0.2 : 0.7,
      tileScore: 0,
      woodScore: 0,
      greenScore: 0,
    },
    depthEstimate: 0.5,
    lightAzimuth: 0,
    lightElevation: 45,
  }))
  return buildSceneGraph(analyses, frames)
}
