import type { SceneAnalysisRecord, TourFrame, TransitionStyle, Vec3 } from '@/types/virtual-tour'
import { DEFAULT_FRAME_MS } from '@/lib/virtual-tour/constants'

export interface SmoothingConfig {
  transitionStyle: TransitionStyle
  easing: string
  stabilization: boolean
  frameBlend: boolean
  autoplaySpeed: number
}

const DEFAULT_SMOOTHING: SmoothingConfig = {
  transitionStyle: 'cinematic',
  easing: 'power2.inOut',
  stabilization: true,
  frameBlend: true,
  autoplaySpeed: 1,
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Build camera keyframes with cinematic easing between scenes */
export function buildCameraKeyframes(
  analyses: SceneAnalysisRecord[],
  config: Partial<SmoothingConfig> = {}
): Array<{
  imageUrl: string
  sceneType: SceneAnalysisRecord['sceneType']
  durationMs: number
  cameraPosition: Vec3
  cameraTarget: Vec3
  transition: TourFrame['transition']
}> {
  const cfg = { ...DEFAULT_SMOOTHING, ...config }
  const n = analyses.length
  if (!n) return []

  const radius = 4.2
  const frames: Array<{
    imageUrl: string
    sceneType: SceneAnalysisRecord['sceneType']
    durationMs: number
    cameraPosition: Vec3
    cameraTarget: Vec3
    transition: TourFrame['transition']
  }> = []

  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0
    const eased = easeInOutCubic(t)
    const angle = eased * Math.PI * 1.35 - Math.PI * 0.2
    const yBob = cfg.stabilization ? Math.sin(i * 0.7) * 0.04 : 0
    const depthPull = analyses[i].depthEstimate * 0.8

    const cameraPosition: Vec3 = {
      x: lerp(-0.3, 0.3, eased) + Math.cos(angle) * 0.15,
      y: 1.55 + yBob,
      z: lerp(0.2, radius - depthPull, eased),
    }
    const cameraTarget: Vec3 = {
      x: Math.sin(angle) * 0.35,
      y: 1.52 + analyses[i].features.warmth * 0.08,
      z: -1.2 - depthPull * 0.5,
    }

    const durationMs = Math.round(
      (DEFAULT_FRAME_MS + analyses[i].confidence * 400) / cfg.autoplaySpeed
    )

    frames.push({
      imageUrl: analyses[i].imageUrl,
      sceneType: analyses[i].sceneType,
      durationMs,
      cameraPosition,
      cameraTarget,
      transition: {
        style: cfg.transitionStyle,
        ease: cfg.easing,
      },
    })
  }

  return frames
}

/** Interpolate camera path for GSAP / Three.js (frame blending) */
export function interpolateCamera(
  from: Vec3,
  to: Vec3,
  t: number
): Vec3 {
  const e = easeInOutCubic(Math.max(0, Math.min(1, t)))
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e),
    z: lerp(from.z, to.z, e),
  }
}

export function totalDurationMs(frames: Array<{ durationMs: number }>): number {
  return frames.reduce((s, f) => s + f.durationMs, 0)
}
