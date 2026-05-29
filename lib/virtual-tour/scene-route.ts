import type { SceneType } from '@/types/virtual-tour'

/** Canonical physical route (outside → exit) */
export const SCENE_ROUTE_ORDER: SceneType[] = [
  'exterior_front',
  'exterior_side',
  'yard',
  'exterior',
  'entrance',
  'corridor',
  'hallway',
  'staircase',
  'living_room',
  'dining_area',
  'kitchen',
  'bedroom',
  'bathroom',
  'terrace',
  'balcony',
  'exit_point',
  'exit',
  'unknown',
]

export function normalizeSceneType(t: SceneType): SceneType {
  if (t === 'exterior') return 'exterior_front'
  if (t === 'exit') return 'exit_point'
  return t
}

export function routeIndex(sceneType: SceneType): number {
  const n = normalizeSceneType(sceneType)
  const idx = SCENE_ROUTE_ORDER.indexOf(n)
  return idx >= 0 ? idx : SCENE_ROUTE_ORDER.length - 1
}

export function isOutdoor(sceneType: SceneType): boolean {
  const n = normalizeSceneType(sceneType)
  return n === 'exterior_front' || n === 'exterior_side' || n === 'yard' || n === 'terrace' || n === 'balcony'
}

export function isTransitionZone(sceneType: SceneType): boolean {
  const n = normalizeSceneType(sceneType)
  return n === 'entrance' || n === 'corridor' || n === 'hallway' || n === 'staircase'
}

export function isDoorScene(sceneType: SceneType): boolean {
  return normalizeSceneType(sceneType) === 'entrance'
}
