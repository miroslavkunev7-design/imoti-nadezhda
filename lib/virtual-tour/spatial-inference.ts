import type { SceneAnalysisRecord, SceneType } from '@/types/virtual-tour'
import { normalizeSceneType, routeIndex } from '@/lib/virtual-tour/scene-route'
import { perspectiveContinuity } from '@/lib/virtual-tour/features'

/** Likelihood that scene B follows scene A in a real walk */
const ADJACENCY: Record<string, number> = {
  'exterior_front→entrance': 0.95,
  'exterior_front→exterior_side': 0.7,
  'exterior_side→entrance': 0.85,
  'yard→entrance': 0.75,
  'entrance→corridor': 0.9,
  'entrance→hallway': 0.88,
  'entrance→living_room': 0.72,
  'corridor→living_room': 0.85,
  'corridor→bedroom': 0.8,
  'corridor→bathroom': 0.78,
  'hallway→living_room': 0.82,
  'hallway→bedroom': 0.8,
  'staircase→corridor': 0.75,
  'staircase→living_room': 0.7,
  'living_room→kitchen': 0.88,
  'living_room→dining_area': 0.86,
  'living_room→bedroom': 0.8,
  'living_room→terrace': 0.75,
  'living_room→balcony': 0.74,
  'kitchen→dining_area': 0.82,
  'bedroom→bathroom': 0.7,
  'bathroom→corridor': 0.65,
  'terrace→living_room': 0.7,
  'balcony→bedroom': 0.72,
  'living_room→exit_point': 0.6,
  'corridor→exit_point': 0.55,
}

function adjKey(a: SceneType, b: SceneType): string {
  return `${normalizeSceneType(a)}→${normalizeSceneType(b)}`
}

export function adjacencyScore(from: SceneType, to: SceneType): number {
  const key = adjKey(from, to)
  if (ADJACENCY[key] != null) return ADJACENCY[key]
  const ri = routeIndex(from)
  const rj = routeIndex(to)
  if (rj > ri) return Math.max(0.35, 0.85 - (rj - ri) * 0.08)
  if (rj < ri) return 0.25
  return 0.55
}

export function transitionNeedsBridge(from: SceneType, to: SceneType): boolean {
  const ri = routeIndex(from)
  const rj = routeIndex(to)
  return rj - ri > 2 || adjacencyScore(from, to) < 0.45
}

/** Pick best next analysis from remaining pool */
export function pickNextInRoute(
  current: SceneAnalysisRecord,
  remaining: SceneAnalysisRecord[]
): number {
  if (!remaining.length) return -1
  let bestIdx = 0
  let bestScore = -1
  for (let i = 0; i < remaining.length; i++) {
    const cand = remaining[i]
    const routeBonus = adjacencyScore(current.sceneType, cand.sceneType) * 0.45
    const routeOrder =
      routeIndex(cand.sceneType) >= routeIndex(current.sceneType) ? 0.12 : -0.2
    const visual = perspectiveContinuity(current.features, cand.features) * 0.43
    const score = routeBonus + visual + routeOrder
    if (score > bestScore) {
      bestScore = score
      bestIdx = i
    }
  }
  return bestIdx
}
