export type SceneType =
  | 'exterior_front'
  | 'exterior_side'
  | 'yard'
  | 'exterior'
  | 'entrance'
  | 'corridor'
  | 'hallway'
  | 'staircase'
  | 'living_room'
  | 'kitchen'
  | 'dining_area'
  | 'bedroom'
  | 'bathroom'
  | 'terrace'
  | 'balcony'
  | 'exit_point'
  | 'exit'
  | 'unknown'

export type GuidedPhase =
  | 'exterior_hold'
  | 'walk_forward'
  | 'door_approach'
  | 'door_open'
  | 'enter_hallway'
  | 'room_explore'
  | 'bridge_transition'
  | 'exit_view'

export interface GuidedPathSegment {
  id: string
  phase: GuidedPhase
  imageUrl: string
  stabilizedUrl?: string | null
  sceneType: SceneType
  label: string
  durationMs: number
  nodeId?: string
  stepIndex?: number
  fromCamera: Vec3
  toCamera: Vec3
  fromTarget: Vec3
  toTarget: Vec3
  isBridge?: boolean
  /** Crossfade to next source photo only — never synthetic room */
  blendToUrl?: string
  yawOffset?: number
}

export type VirtualTourStatus =
  | 'draft'
  | 'processing'
  | 'ready'
  | 'published'
  | 'failed'

export type VirtualTourMode = 'walkthrough_3d' | 'slideshow'

export type PipelineStepId =
  | 'idle'
  | 'analyzing'
  | 'sorting'
  | 'smoothing'
  | 'generating'
  | 'preview'
  | 'editing'
  | 'publishing'
  | 'done'

export type TransitionStyle = 'fade' | 'slide' | 'cinematic' | 'crossfade'

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface ImageFeatures {
  meanR: number
  meanG: number
  meanB: number
  brightness: number
  saturation: number
  contrast: number
  aspectRatio: number
  edgeDensity: number
  warmth: number
  skyRatio: number
  indoorScore: number
  tileScore: number
  woodScore: number
  greenScore: number
}

export interface SceneAnalysisRecord {
  imageUrl: string
  sceneType: SceneType
  confidence: number
  features: ImageFeatures
  depthEstimate: number
  lightAzimuth: number
  lightElevation: number
  embedding?: number[]
}

export interface TourFrame {
  id: number
  tourId: number
  imageUrl: string
  sceneType: SceneType
  sortOrder: number
  durationMs: number
  cameraPosition: Vec3
  cameraTarget: Vec3
  transition: {
    style: TransitionStyle
    ease: string
  }
  stabilizedUrl?: string | null
}

export interface TourSettings {
  autoplaySpeed: number
  transitionStyle: TransitionStyle
  easing: string
  stabilization: boolean
  frameBlend: boolean
  trimStartMs: number
  trimEndMs: number
  editorOrder: number[]
}

export type TourViewKind = 'panorama360' | 'step'

export type TourNodeKind = 'panorama' | 'room'

export type TourEdgeTransition = 'door' | 'walk' | 'stairs'

export interface TourStepFrame {
  id: number
  imageUrl: string
  sceneType: SceneType
  sortOrder: number
  durationMs: number
  viewKind: TourViewKind
  stepIndex: number
  yawOffset: number
  positionOffset: Vec3
  cameraPosition: Vec3
  cameraTarget: Vec3
  transition: TourFrame['transition']
  stabilizedUrl?: string | null
  /** За разграничаване на истинска 360° (2:1) от обикновена снимка */
  aspectRatio?: number
}

export interface TourNode {
  id: string
  sceneType: SceneType
  label: string
  kind: TourNodeKind
  steps: TourStepFrame[]
  position: Vec3
  hasDoor?: boolean
  doorOpensTo?: string
}

export interface TourNavigationEdge {
  from: string
  to: string
  transition: TourEdgeTransition
  label: string
}

export interface VirtualTourManifest {
  version: 1 | 2 | 3
  mode: VirtualTourMode
  guidedPath?: GuidedPathSegment[]
  propertyId: number
  tourId: number
  frames: Array<{
    id: number
    imageUrl: string
    sceneType: SceneType
    sortOrder: number
    durationMs: number
    cameraPosition: Vec3
    cameraTarget: Vec3
    transition: TourFrame['transition']
    stabilizedUrl?: string | null
    viewKind?: TourViewKind
  }>
  nodes?: TourNode[]
  edges?: TourNavigationEdge[]
  startNodeId?: string
  settings: TourSettings
  totalDurationMs: number
  fallbackSlideshow: boolean
}

export interface VirtualTour {
  id: number
  propertyId: number
  status: VirtualTourStatus
  mode: VirtualTourMode
  progressStep: PipelineStepId
  progressPercent: number
  errorMessage: string | null
  manifest: VirtualTourManifest
  thumbnailUrl: string | null
  frameCount: number
  durationSec: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  frames?: TourFrame[]
  settings?: TourSettings
}

export const PIPELINE_STEPS: Array<{ id: PipelineStepId; label: string }> = [
  { id: 'analyzing', label: 'Анализиране…' },
  { id: 'sorting', label: 'Разпознаване на помещения…' },
  { id: 'smoothing', label: 'Подреждане…' },
  { id: 'generating', label: 'Реконструкция…' },
  { id: 'preview', label: 'Генериране…' },
  { id: 'publishing', label: 'Стартиране…' },
  { id: 'done', label: 'Готово' },
]
