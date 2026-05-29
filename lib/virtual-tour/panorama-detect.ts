import type { ImageFeatures } from '@/types/virtual-tour'
import type { SceneType } from '@/types/virtual-tour'

/**
 * Само истински equirectangular 360° (2:1) — обикновена снимка 4:3/16:9 НЕ е панорама.
 * На сфера с обикновена снимка останалото е черно — затова сме строги.
 */
export function isEquirectangularAspect(aspectRatio: number): boolean {
  return aspectRatio >= 1.92 && aspectRatio <= 2.12
}

export function isTrueEquirectangular(features: ImageFeatures): boolean {
  return isEquirectangularAspect(features.aspectRatio)
}

/** По-широка снимка, но не пълна 360 — ограничен изглед с въртене ±40° */
export function isWidePhoto(features: ImageFeatures): boolean {
  return features.aspectRatio >= 1.55 && features.aspectRatio < 1.92
}

export function inferViewKind(
  sceneType: SceneType,
  features: ImageFeatures,
  _stepCountInNode: number
): 'panorama360' | 'step' {
  if (isTrueEquirectangular(features)) return 'panorama360'
  return 'step'
}
