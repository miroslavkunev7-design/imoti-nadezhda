import type { ImageFeatures, SceneType } from '@/types/virtual-tour'
import { normalizeSceneType } from '@/lib/virtual-tour/scene-route'

interface SceneScore {
  type: SceneType
  score: number
}

/** Heuristic scene classifier from image statistics (server + client merge) */
export function classifySceneFromFeatures(f: ImageFeatures): { sceneType: SceneType; confidence: number } {
  const scores: SceneScore[] = [
    {
      type: 'exterior_front',
      score:
        f.skyRatio * 0.4 +
        (1 - f.indoorScore) * 0.38 +
        f.greenScore * 0.12 +
        (f.aspectRatio < 1.4 ? 0.08 : 0),
    },
    {
      type: 'exterior_side',
      score:
        f.skyRatio * 0.28 +
        (1 - f.indoorScore) * 0.32 +
        f.edgeDensity * 0.2 +
        (f.aspectRatio > 1.2 ? 0.12 : 0),
    },
    {
      type: 'yard',
      score: f.greenScore * 0.42 + f.skyRatio * 0.28 + (1 - f.indoorScore) * 0.2,
    },
    {
      type: 'entrance',
      score:
        f.indoorScore * 0.28 +
        f.woodScore * 0.32 +
        (f.brightness > 0.38 && f.brightness < 0.72 ? 0.22 : 0) +
        f.edgeDensity * 0.12,
    },
    {
      type: 'corridor',
      score:
        f.indoorScore * 0.28 +
        (f.aspectRatio > 1.15 ? 0.28 : 0.1) +
        f.edgeDensity * 0.28 +
        (f.saturation < 0.38 ? 0.1 : 0),
    },
    {
      type: 'hallway',
      score:
        f.indoorScore * 0.32 +
        f.edgeDensity * 0.22 +
        (f.brightness > 0.42 && f.brightness < 0.7 ? 0.18 : 0.08),
    },
    {
      type: 'staircase',
      score:
        f.indoorScore * 0.25 +
        f.edgeDensity * 0.38 +
        (f.contrast > 0.35 ? 0.15 : 0.05) +
        f.woodScore * 0.1,
    },
    {
      type: 'living_room',
      score:
        f.indoorScore * 0.34 +
        f.warmth * 0.26 +
        f.woodScore * 0.14 +
        (f.brightness > 0.36 && f.brightness < 0.78 ? 0.14 : 0),
    },
    {
      type: 'dining_area',
      score:
        f.indoorScore * 0.3 +
        f.warmth * 0.22 +
        f.woodScore * 0.18 +
        (f.brightness > 0.45 ? 0.12 : 0.06),
    },
    {
      type: 'kitchen',
      score:
        f.tileScore * 0.42 +
        f.indoorScore * 0.22 +
        (f.brightness > 0.5 ? 0.16 : 0) +
        f.saturation * 0.08,
    },
    {
      type: 'bedroom',
      score:
        f.indoorScore * 0.32 +
        (f.warmth > 0.45 ? 0.22 : 0.08) +
        (f.brightness < 0.65 ? 0.14 : 0.05) +
        f.woodScore * 0.1,
    },
    {
      type: 'bathroom',
      score:
        f.tileScore * 0.38 +
        f.indoorScore * 0.26 +
        (f.brightness > 0.55 ? 0.22 : 0.1) +
        (f.saturation < 0.42 ? 0.1 : 0),
    },
    {
      type: 'terrace',
      score:
        f.skyRatio * 0.32 +
        f.greenScore * 0.22 +
        (f.brightness > 0.5 ? 0.22 : 0.08) +
        (1 - f.indoorScore) * 0.12,
    },
    {
      type: 'balcony',
      score:
        f.skyRatio * 0.28 +
        (1 - f.indoorScore) * 0.28 +
        f.edgeDensity * 0.18 +
        (f.brightness > 0.48 ? 0.14 : 0.05),
    },
    {
      type: 'exit_point',
      score:
        f.indoorScore * 0.22 +
        f.woodScore * 0.22 +
        f.edgeDensity * 0.22 +
        (f.brightness < 0.55 ? 0.14 : 0.06),
    },
  ]

  scores.sort((a, b) => b.score - a.score)
  const best = scores[0]
  const second = scores[1]?.score ?? 0
  const confidence = Math.min(0.98, Math.max(0.42, best.score / (best.score + second + 0.001)))
  return {
    sceneType: normalizeSceneType(best.type),
    confidence: Math.round(confidence * 10000) / 10000,
  }
}

/** Merge MobileNet / client hints with heuristic scores */
export function mergeSceneClassification(
  heuristic: SceneType,
  heuristicConf: number,
  clientType?: SceneType,
  clientConf?: number
): { sceneType: SceneType; confidence: number } {
  const h = normalizeSceneType(heuristic)
  const c = clientType ? normalizeSceneType(clientType) : undefined
  if (!c || c === 'unknown' || !clientConf) {
    return { sceneType: h, confidence: heuristicConf }
  }
  if (clientConf >= 0.72) {
    return { sceneType: c, confidence: clientConf }
  }
  if (h === c) {
    return {
      sceneType: h,
      confidence: Math.min(0.99, (heuristicConf + clientConf) / 2 + 0.08),
    }
  }
  return heuristicConf >= clientConf
    ? { sceneType: h, confidence: heuristicConf }
    : { sceneType: c, confidence: clientConf }
}
