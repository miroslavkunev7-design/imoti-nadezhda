import { execute, query, queryOne, isDbConfigured } from '@/lib/db'
import type {
  PipelineStepId,
  SceneAnalysisRecord,
  TourFrame,
  TourSettings,
  VirtualTour,
  VirtualTourManifest,
  VirtualTourMode,
  VirtualTourStatus,
} from '@/types/virtual-tour'
import { DEFAULT_TOUR_SETTINGS } from '@/lib/virtual-tour/manifest'

function mapTour(row: Record<string, unknown>): VirtualTour {
  return {
    id: Number(row.id),
    propertyId: Number(row.property_id),
    status: String(row.status) as VirtualTour['status'],
    mode: String(row.mode) as VirtualTour['mode'],
    progressStep: String(row.progress_step) as VirtualTour['progressStep'],
    progressPercent: Number(row.progress_percent ?? 0),
    errorMessage: row.error_message ? String(row.error_message) : null,
    manifest: (typeof row.manifest === 'string'
      ? JSON.parse(row.manifest)
      : row.manifest ?? {}) as VirtualTourManifest,
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    frameCount: Number(row.frame_count ?? 0),
    durationSec: Number(row.duration_sec ?? 0),
    publishedAt: row.published_at ? String(row.published_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapFrame(row: Record<string, unknown>): TourFrame {
  return {
    id: Number(row.id),
    tourId: Number(row.tour_id),
    imageUrl: String(row.image_url),
    sceneType: String(row.scene_type) as TourFrame['sceneType'],
    sortOrder: Number(row.sort_order),
    durationMs: Number(row.duration_ms),
    cameraPosition: row.camera_position as TourFrame['cameraPosition'],
    cameraTarget: row.camera_target as TourFrame['cameraTarget'],
    transition: row.transition as TourFrame['transition'],
    stabilizedUrl: row.stabilized_url ? String(row.stabilized_url) : null,
  }
}

function mapSettings(row: Record<string, unknown>): TourSettings {
  return {
    autoplaySpeed: Number(row.autoplay_speed ?? 1),
    transitionStyle: String(row.transition_style) as TourSettings['transitionStyle'],
    easing: String(row.easing),
    stabilization: Boolean(row.stabilization),
    frameBlend: Boolean(row.frame_blend),
    trimStartMs: Number(row.trim_start_ms ?? 0),
    trimEndMs: Number(row.trim_end_ms ?? 0),
    editorOrder: Array.isArray(row.editor_order) ? (row.editor_order as number[]) : [],
  }
}

export async function createVirtualTour(propertyId: number): Promise<VirtualTour | null> {
  if (!isDbConfigured()) return null
  const result = await execute(
    `INSERT INTO virtual_tours (property_id, status, progress_step, progress_percent)
     VALUES (?, 'processing', 'analyzing', 5)`,
    [propertyId]
  )
  const tourId = result.insertId
  if (!tourId) return null
  await execute(
    `INSERT INTO tour_settings (tour_id) VALUES (?)`,
    [tourId]
  )
  return getVirtualTourById(tourId)
}

export async function updateTourProgress(
  tourId: number,
  step: PipelineStepId,
  percent: number
): Promise<void> {
  if (!isDbConfigured()) return
  await execute(
    `UPDATE virtual_tours SET progress_step = ?, progress_percent = ?, updated_at = NOW() WHERE id = ?`,
    [step, Math.min(100, Math.max(0, percent)), tourId]
  )
}

export async function getVirtualTourById(id: number): Promise<VirtualTour | null> {
  if (!isDbConfigured()) return null
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM virtual_tours WHERE id = ?`,
    [id]
  )
  if (!row) return null
  const tour = mapTour(row)
  tour.frames = await listTourFrames(id)
  tour.settings = await getTourSettings(id)
  if (tour.manifest && typeof tour.manifest === 'object' && !tour.manifest.version) {
    tour.manifest = tour.manifest as VirtualTourManifest
  }
  return tour
}

export async function getPublishedTourByProperty(propertyId: number): Promise<VirtualTour | null> {
  if (!isDbConfigured()) return null
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM virtual_tours WHERE property_id = ? AND status = 'published' ORDER BY published_at DESC LIMIT 1`,
    [propertyId]
  )
  if (!row) {
    const draft = await queryOne<Record<string, unknown>>(
      `SELECT * FROM virtual_tours WHERE property_id = ? AND status IN ('ready','published') ORDER BY updated_at DESC LIMIT 1`,
      [propertyId]
    )
    if (!draft) return null
    return loadTourFull(Number(draft.id))
  }
  return loadTourFull(Number(row.id))
}

async function loadTourFull(id: number): Promise<VirtualTour | null> {
  const tour = await getVirtualTourById(id)
  return tour
}

export async function listTourFrames(tourId: number): Promise<TourFrame[]> {
  if (!isDbConfigured()) return []
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM tour_frames WHERE tour_id = ? ORDER BY sort_order ASC`,
    [tourId]
  )
  return rows.map(mapFrame)
}

export async function getTourSettings(tourId: number): Promise<TourSettings> {
  if (!isDbConfigured()) return DEFAULT_TOUR_SETTINGS
  const row = await queryOne<Record<string, unknown>>(
    `SELECT * FROM tour_settings WHERE tour_id = ?`,
    [tourId]
  )
  return row ? mapSettings(row) : DEFAULT_TOUR_SETTINGS
}

export async function saveSceneAnalyses(
  tourId: number,
  analyses: SceneAnalysisRecord[]
): Promise<void> {
  if (!isDbConfigured()) return
  await execute(`DELETE FROM scene_analysis WHERE tour_id = ?`, [tourId])
  for (const a of analyses) {
    await execute(
      `INSERT INTO scene_analysis (tour_id, image_url, scene_type, confidence, features, depth_estimate, light_azimuth, light_elevation, embedding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tourId,
        a.imageUrl,
        a.sceneType,
        a.confidence,
        JSON.stringify(a.features),
        a.depthEstimate,
        a.lightAzimuth,
        a.lightElevation,
        a.embedding ? JSON.stringify(a.embedding) : null,
      ]
    )
  }
}

export async function replaceTourFrames(
  tourId: number,
  frames: Array<Omit<TourFrame, 'id' | 'tourId'> & { id?: number }>
): Promise<TourFrame[]> {
  if (!isDbConfigured()) return []
  await execute(`DELETE FROM tour_frames WHERE tour_id = ?`, [tourId])
  const saved: TourFrame[] = []
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]
    const res = await execute(
      `INSERT INTO tour_frames (tour_id, image_url, scene_type, sort_order, duration_ms, camera_position, camera_target, transition, stabilized_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tourId,
        f.imageUrl,
        f.sceneType,
        f.sortOrder ?? i,
        f.durationMs,
        JSON.stringify(f.cameraPosition),
        JSON.stringify(f.cameraTarget),
        JSON.stringify(f.transition),
        f.stabilizedUrl ?? null,
      ]
    )
    saved.push({
      id: res.insertId,
      tourId,
      imageUrl: f.imageUrl,
      sceneType: f.sceneType,
      sortOrder: f.sortOrder ?? i,
      durationMs: f.durationMs,
      cameraPosition: f.cameraPosition,
      cameraTarget: f.cameraTarget,
      transition: f.transition,
      stabilizedUrl: f.stabilizedUrl ?? null,
    })
  }
  return saved
}

export async function finalizeTour(params: {
  tourId: number
  propertyId?: number
  manifest: VirtualTourManifest
  mode: VirtualTourMode
  status: VirtualTourStatus
  thumbnailUrl: string | null
  frameCount: number
  durationSec: number
  publish?: boolean
}): Promise<void> {
  if (!isDbConfigured()) return
  if (params.publish && params.propertyId) {
    await execute(
      `UPDATE virtual_tours SET status = 'ready', published_at = NULL
       WHERE property_id = ? AND id != ? AND status = 'published'`,
      [params.propertyId, params.tourId]
    )
  }
  const published = params.publish ? new Date().toISOString() : null
  await execute(
    `UPDATE virtual_tours SET
      status = ?,
      mode = ?,
      manifest = ?,
      thumbnail_url = ?,
      frame_count = ?,
      duration_sec = ?,
      progress_step = ?,
      progress_percent = ?,
      published_at = COALESCE(?, published_at),
      updated_at = NOW()
     WHERE id = ?`,
    [
      params.status,
      params.mode,
      JSON.stringify(params.manifest),
      params.thumbnailUrl,
      params.frameCount,
      params.durationSec,
      params.publish ? 'done' : 'ready',
      params.publish ? 100 : 95,
      published,
      params.tourId,
    ]
  )
}

export async function updateTourSettings(tourId: number, settings: Partial<TourSettings>): Promise<void> {
  if (!isDbConfigured()) return
  const cur = await getTourSettings(tourId)
  const next = { ...cur, ...settings }
  await execute(
    `UPDATE tour_settings SET
      autoplay_speed = ?,
      transition_style = ?,
      easing = ?,
      stabilization = ?,
      frame_blend = ?,
      trim_start_ms = ?,
      trim_end_ms = ?,
      editor_order = ?,
      updated_at = NOW()
     WHERE tour_id = ?`,
    [
      next.autoplaySpeed,
      next.transitionStyle,
      next.easing,
      next.stabilization,
      next.frameBlend,
      next.trimStartMs,
      next.trimEndMs,
      JSON.stringify(next.editorOrder),
      tourId,
    ]
  )
}

export async function markTourFailed(tourId: number, message: string): Promise<void> {
  if (!isDbConfigured()) return
  await execute(
    `UPDATE virtual_tours SET status = 'failed', error_message = ?, progress_step = 'idle', updated_at = NOW() WHERE id = ?`,
    [message, tourId]
  )
}
