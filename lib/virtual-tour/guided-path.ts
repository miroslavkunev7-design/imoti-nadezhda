import type {
  GuidedPathSegment,
  GuidedPhase,
  SceneAnalysisRecord,
  SceneType,
  TourNode,
  Vec3,
} from '@/types/virtual-tour'
import type { SceneGraphResult } from '@/lib/virtual-tour/scene-graph'
import { SCENE_LABELS_BG } from '@/lib/virtual-tour/constants'
import {
  isDoorScene,
  isOutdoor,
  isTransitionZone,
  normalizeSceneType,
} from '@/lib/virtual-tour/scene-route'
import { transitionNeedsBridge } from '@/lib/virtual-tour/spatial-inference'

const HEAD_Y = 1.68
const SWAY_AMP = 0.022

function sway(i: number): number {
  return Math.sin(i * 1.15) * SWAY_AMP
}

function outdoorStart(): { pos: Vec3; target: Vec3 } {
  return {
    pos: { x: 0, y: HEAD_Y, z: 9 },
    target: { x: 0, y: HEAD_Y, z: 0 },
  }
}

function approachEntrance(z: number): { pos: Vec3; target: Vec3 } {
  return {
    pos: { x: 0, y: HEAD_Y + sway(1), z },
    target: { x: 0, y: HEAD_Y, z: -2 },
  }
}

function indoorWalk(nodeZ: number, step: number, lateral = 0): { pos: Vec3; target: Vec3 } {
  const forward = nodeZ - step * 0.42
  return {
    pos: { x: lateral + sway(step), y: HEAD_Y + sway(step + 2), z: forward },
    target: { x: lateral * 0.3, y: HEAD_Y, z: forward - 2.8 },
  }
}

function phaseDuration(phase: GuidedPhase, baseMs: number): number {
  switch (phase) {
    case 'exterior_hold':
      return Math.max(2200, baseMs * 0.7)
    case 'walk_forward':
      return Math.max(2800, baseMs)
    case 'door_approach':
      return 2400
    case 'door_open':
      return 1600
    case 'enter_hallway':
      return 2600
    case 'bridge_transition':
      return 1400
    case 'exit_view':
      return 2200
    default:
      return Math.max(2400, baseMs)
  }
}

function inferPhase(
  node: TourNode,
  stepIndex: number,
  prevScene: SceneType | null,
  nodeIndex: number
): GuidedPhase {
  const st = normalizeSceneType(node.sceneType)
  if (nodeIndex === 0 && stepIndex === 0 && isOutdoor(node.sceneType)) return 'exterior_hold'
  if (nodeIndex === 0 && stepIndex === 0) return 'walk_forward'
  if (stepIndex === 0 && prevScene && isOutdoor(prevScene) && isDoorScene(node.sceneType)) {
    return stepIndex === 0 ? 'door_approach' : 'walk_forward'
  }
  if (stepIndex === 0 && prevScene && isDoorScene(prevScene) && isTransitionZone(node.sceneType)) {
    return 'enter_hallway'
  }
  if (st === 'exit_point') return 'exit_view'
  if (stepIndex === 0 && prevScene) return 'walk_forward'
  return 'room_explore'
}

export function buildGuidedPath(
  graph: SceneGraphResult,
  _sorted: SceneAnalysisRecord[]
): GuidedPathSegment[] {
  const segments: GuidedPathSegment[] = []
  let segIndex = 0
  let prevScene: SceneType | null = null
  const start = outdoorStart()

  for (let ni = 0; ni < graph.nodes.length; ni++) {
    const node = graph.nodes[ni]
    const nodeZ = node.position.z
    const prevNode = ni > 0 ? graph.nodes[ni - 1] : null

    if (prevNode && transitionNeedsBridge(prevNode.sceneType, node.sceneType)) {
      const lastStep = prevNode.steps[prevNode.steps.length - 1]
      const firstStep = node.steps[0]
      const bridgeFrom = indoorWalk(prevNode.position.z, 0)
      const bridgeTo =
        stepIndexPhaseTarget(node, 0, nodeZ) ??
        indoorWalk(nodeZ, 0)
      segments.push({
        id: `bridge-${ni}`,
        phase: 'bridge_transition',
        imageUrl: lastStep.imageUrl,
        stabilizedUrl: lastStep.stabilizedUrl,
        sceneType: prevNode.sceneType,
        label: 'Преминаване',
        durationMs: phaseDuration('bridge_transition', 1400),
        nodeId: node.id,
        fromCamera: bridgeFrom.pos,
        toCamera: bridgeTo.pos,
        fromTarget: bridgeFrom.target,
        toTarget: bridgeTo.target,
        isBridge: true,
        blendToUrl: firstStep.imageUrl,
      })
      segIndex++
    }

    const injectDoor =
      isDoorScene(node.sceneType) &&
      prevNode &&
      isOutdoor(prevNode.sceneType) &&
      node.steps.length > 0

    if (injectDoor) {
      const doorStep = node.steps[0]
      const doorUrl = doorStep.imageUrl
      for (const doorPhase of ['door_approach', 'door_open', 'enter_hallway'] as GuidedPhase[]) {
        const from = doorPhase === 'door_approach' ? approachEntrance(5.5) : doorPhase === 'door_open' ? approachEntrance(2.2) : approachEntrance(1.1)
        const to = doorPhase === 'door_approach' ? approachEntrance(2.2) : doorPhase === 'door_open' ? approachEntrance(1.1) : indoorWalk(nodeZ, 0)
        segments.push({
          id: `seg-${segIndex++}`,
          phase: doorPhase,
          imageUrl: doorUrl,
          stabilizedUrl: doorStep.stabilizedUrl,
          sceneType: node.sceneType,
          label: SCENE_LABELS_BG[normalizeSceneType(node.sceneType)],
          durationMs: phaseDuration(doorPhase, 2000),
          nodeId: node.id,
          stepIndex: 0,
          fromCamera: from.pos,
          toCamera: to.pos,
          fromTarget: from.target,
          toTarget: to.target,
        })
      }
      prevScene = node.sceneType
    }

    for (let si = 0; si < node.steps.length; si++) {
      if (injectDoor && si === 0) continue
      const step = node.steps[si]
      const phase = inferPhase(node, si, prevScene, ni)
      const baseMs = step.durationMs
      const dur = phaseDuration(phase, baseMs)

      let from = start
      let to = start

      if (phase === 'exterior_hold') {
        from = outdoorStart()
        to = approachEntrance(5.5)
      } else if (phase === 'door_approach') {
        from = approachEntrance(5.5)
        to = approachEntrance(2.2)
      } else if (phase === 'door_open') {
        from = approachEntrance(2.2)
        to = approachEntrance(1.1)
      } else if (phase === 'enter_hallway') {
        from = approachEntrance(1.1)
        to = indoorWalk(nodeZ, 0)
      } else if (phase === 'walk_forward') {
        const z = isOutdoor(node.sceneType) ? 6 - si * 0.5 : nodeZ - si * 0.35
        from = si === 0 && ni === 0 ? outdoorStart() : indoorWalk(nodeZ, Math.max(0, si - 1))
        to = isOutdoor(node.sceneType) ? approachEntrance(z) : indoorWalk(nodeZ, si)
      } else {
        from = indoorWalk(nodeZ, Math.max(0, si - 1), Math.sin(si) * 0.15)
        to = indoorWalk(nodeZ, si, Math.sin(si + 1) * 0.15)
      }

      segments.push({
        id: `seg-${segIndex++}`,
        phase,
        imageUrl: step.imageUrl,
        stabilizedUrl: step.stabilizedUrl,
        sceneType: node.sceneType,
        label: SCENE_LABELS_BG[normalizeSceneType(node.sceneType)] ?? node.label,
        durationMs: dur,
        nodeId: node.id,
        stepIndex: si,
        fromCamera: from.pos,
        toCamera: to.pos,
        fromTarget: from.target,
        toTarget: to.target,
        isBridge: false,
      })

      prevScene = node.sceneType
    }
  }

  return ensureEntryFlow(segments, graph)
}

function findExteriorStep(graph: SceneGraphResult) {
  for (const n of graph.nodes) {
    if (isOutdoor(n.sceneType) && n.steps[0]) {
      return { url: n.steps[0].imageUrl, stabilized: n.steps[0].stabilizedUrl, label: n.label }
    }
  }
  const first = graph.nodes[0]?.steps[0]
  if (!first) return null
  return { url: first.imageUrl, stabilized: first.stabilizedUrl, label: graph.nodes[0].label }
}

/** Винаги започваме отвън → вход, дори при стари manifest-и */
function ensureEntryFlow(segments: GuidedPathSegment[], graph: SceneGraphResult): GuidedPathSegment[] {
  if (!segments.length) return segments
  if (segments[0].phase === 'exterior_hold') return segments

  const ext = findExteriorStep(graph)
  if (!ext) return segments

  const prelude: GuidedPathSegment[] = [
    {
      id: 'seg-prelude-exterior',
      phase: 'exterior_hold',
      imageUrl: ext.url,
      stabilizedUrl: ext.stabilized,
      sceneType: 'exterior_front',
      label: 'Фасада',
      durationMs: 2800,
      fromCamera: outdoorStart().pos,
      toCamera: approachEntrance(6).pos,
      fromTarget: outdoorStart().target,
      toTarget: approachEntrance(6).target,
    },
    {
      id: 'seg-prelude-walk',
      phase: 'walk_forward',
      imageUrl: ext.url,
      stabilizedUrl: ext.stabilized,
      sceneType: 'entrance',
      label: 'Подход към вход',
      durationMs: 3000,
      fromCamera: approachEntrance(6).pos,
      toCamera: approachEntrance(2.5).pos,
      fromTarget: approachEntrance(6).target,
      toTarget: approachEntrance(2.5).target,
    },
  ]

  return [...prelude, ...segments]
}

function stepIndexPhaseTarget(
  node: TourNode,
  stepIndex: number,
  nodeZ: number
): { pos: Vec3; target: Vec3 } | null {
  if (stepIndex >= node.steps.length) return null
  return indoorWalk(nodeZ, stepIndex)
}
