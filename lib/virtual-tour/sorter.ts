import type { SceneAnalysisRecord, SceneType } from '@/types/virtual-tour'
import { routeIndex, normalizeSceneType } from '@/lib/virtual-tour/scene-route'
import { pickNextInRoute } from '@/lib/virtual-tour/spatial-inference'
import { perspectiveContinuity } from '@/lib/virtual-tour/features'

function bucketKey(sceneType: SceneType): number {
  return routeIndex(sceneType)
}

/**
 * Reconstruct most probable physical route from chaotic uploads.
 */
export function sortAnalysesChaoticRoute(analyses: SceneAnalysisRecord[]): SceneAnalysisRecord[] {
  const normalized = analyses.map(a => ({
    ...a,
    sceneType: normalizeSceneType(a.sceneType),
  }))
  if (normalized.length <= 1) return normalized

  const buckets = new Map<number, SceneAnalysisRecord[]>()
  for (const a of normalized) {
    const ri = bucketKey(a.sceneType)
    if (!buckets.has(ri)) buckets.set(ri, [])
    buckets.get(ri)!.push(a)
  }

  const orderedBuckets = [...buckets.entries()].sort(([a], [b]) => a - b)
  const sorted: SceneAnalysisRecord[] = []

  for (const [, group] of orderedBuckets) {
    if (group.length <= 1) {
      sorted.push(...group)
      continue
    }
    sorted.push(...orderBySpatialContinuity(group))
  }

  return ensureRouteMonotonic(sorted)
}

function orderBySpatialContinuity(group: SceneAnalysisRecord[]): SceneAnalysisRecord[] {
  const remaining = [...group]
  const result: SceneAnalysisRecord[] = []
  let current = remaining.shift()!
  result.push(current)

  while (remaining.length) {
    const idx = pickNextInRoute(current, remaining)
    current = remaining.splice(idx >= 0 ? idx : 0, 1)[0]
    result.push(current)
  }

  return result
}

/** If global order jumps backward on route, re-chain locally */
function ensureRouteMonotonic(sorted: SceneAnalysisRecord[]): SceneAnalysisRecord[] {
  if (sorted.length < 3) return sorted
  const out: SceneAnalysisRecord[] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1]
    const cand = sorted[i]
    if (routeIndex(cand.sceneType) < routeIndex(prev.sceneType)) {
      const persp = perspectiveContinuity(prev.features, cand.features)
      if (persp < 0.42) continue
    }
    out.push(cand)
  }
  return out.length ? out : sorted
}
