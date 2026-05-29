import type { ImageFeatures } from '@/types/virtual-tour'

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom > 0 ? dot / denom : 0
}

export function featuresToVector(f: ImageFeatures): number[] {
  return [
    f.meanR / 255,
    f.meanG / 255,
    f.meanB / 255,
    f.brightness,
    f.saturation,
    f.contrast,
    f.aspectRatio / 2,
    f.edgeDensity,
    f.warmth,
    f.skyRatio,
    f.indoorScore,
    f.tileScore,
    f.woodScore,
    f.greenScore,
  ]
}

export function estimateLightDirection(f: ImageFeatures): { azimuth: number; elevation: number } {
  const warmBias = f.warmth - 0.5
  const brightBias = f.brightness - 0.5
  const azimuth = Math.round((warmBias * 120 + brightBias * 40) * 10) / 10
  const elevation = Math.round((f.brightness * 55 + f.skyRatio * 25) * 10) / 10
  return { azimuth, elevation }
}

export function estimateDepth(f: ImageFeatures): number {
  return Math.round((0.35 + f.edgeDensity * 0.45 + (1 - f.skyRatio) * 0.2) * 1000) / 1000
}

export function perspectiveContinuity(a: ImageFeatures, b: ImageFeatures): number {
  const lightA = estimateLightDirection(a)
  const lightB = estimateLightDirection(b)
  const lightDelta =
    Math.abs(lightA.azimuth - lightB.azimuth) / 180 +
    Math.abs(lightA.elevation - lightB.elevation) / 90
  const colorDelta =
    Math.abs(a.meanR - b.meanR) +
    Math.abs(a.meanG - b.meanG) +
    Math.abs(a.meanB - b.meanB)
  const aspectDelta = Math.abs(a.aspectRatio - b.aspectRatio)
  const sim = cosineSimilarity(featuresToVector(a), featuresToVector(b))
  return sim * 0.55 + (1 - Math.min(1, lightDelta)) * 0.25 + (1 - Math.min(1, colorDelta / 180)) * 0.12 + (1 - Math.min(1, aspectDelta)) * 0.08
}
