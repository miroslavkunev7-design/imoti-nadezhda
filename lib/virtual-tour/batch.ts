import { query, isDbConfigured, execute } from '@/lib/db'
import { resolveMediaUrl } from '@/lib/upload-bridge'
import { runVirtualTourPipeline } from '@/lib/virtual-tour/pipeline'
import { getPublishedTourByProperty } from '@/lib/virtual-tour/repository'
import { listLocalProperties } from '@/lib/local-store/properties'
import { MIN_FRAMES_SLIDESHOW } from '@/lib/virtual-tour/constants'

export interface BatchPropertyTarget {
  id: number
  title: string
  images: string[]
}

export async function listPropertiesForVirtualTourBatch(): Promise<BatchPropertyTarget[]> {
  const byId = new Map<number, BatchPropertyTarget>()

  if (isDbConfigured()) {
    const rows = await query<{ id: number; title: string; main_image: string | null }>(
      `SELECT id, title, main_image FROM properties ORDER BY id ASC`
    )
    for (const row of rows) {
      const imgRows = await query<{ image_path: string }>(
        `SELECT image_path FROM property_images WHERE property_id = ? ORDER BY sort_order ASC`,
        [row.id]
      )
      let images = imgRows
        .map(r => resolveMediaUrl(r.image_path) ?? r.image_path)
        .filter(Boolean) as string[]
      if (!images.length && row.main_image) {
        const u = resolveMediaUrl(row.main_image) ?? row.main_image
        if (u) images = [u]
      }
      if (images.length >= MIN_FRAMES_SLIDESHOW) {
        byId.set(row.id, { id: row.id, title: row.title, images })
      }
    }
  }

  const locals = await listLocalProperties()
  for (const p of locals) {
    const images = (p.images ?? [])
      .map(u => resolveMediaUrl(u) ?? u)
      .filter(Boolean) as string[]
    const main = p.main_image ? resolveMediaUrl(p.main_image) ?? p.main_image : null
    const all = images.length ? images : main ? [main] : []
    if (all.length >= MIN_FRAMES_SLIDESHOW) {
      byId.set(p.id, { id: p.id, title: p.title, images: all })
    }
  }

  return [...byId.values()]
}

export async function unpublishPropertyTours(propertyId: number): Promise<void> {
  if (!isDbConfigured()) return
  await execute(
    `UPDATE virtual_tours SET status = 'ready', published_at = NULL
     WHERE property_id = ? AND status = 'published'`,
    [propertyId]
  )
}

export interface BatchGenerateResult {
  ok: number
  skip: number
  fail: number
  results: Array<{
    propertyId: number
    title: string
    status: 'ok' | 'skip' | 'fail'
    tourId?: number
    mode?: string
    frameCount?: number
    error?: string
  }>
}

export async function runVirtualTourBatch(options?: {
  force?: boolean
  propertyIds?: number[]
}): Promise<BatchGenerateResult> {
  const force = options?.force ?? false
  let targets = await listPropertiesForVirtualTourBatch()
  if (options?.propertyIds?.length) {
    const set = new Set(options.propertyIds)
    targets = targets.filter(t => set.has(t.id))
  }

  const results: BatchGenerateResult['results'] = []
  let ok = 0
  let skip = 0
  let fail = 0

  for (const prop of targets) {
    const existing = await getPublishedTourByProperty(prop.id)
    if (existing?.manifest?.frames?.length && !force) {
      results.push({
        propertyId: prop.id,
        title: prop.title,
        status: 'skip',
        tourId: existing.id,
        frameCount: existing.frameCount,
      })
      skip++
      continue
    }

    if (force && existing) {
      await unpublishPropertyTours(prop.id)
    }

    try {
      const result = await runVirtualTourPipeline({
        propertyId: prop.id,
        imageUrls: prop.images,
        publish: true,
      })
      results.push({
        propertyId: prop.id,
        title: prop.title,
        status: 'ok',
        tourId: result.tourId,
        mode: result.mode,
        frameCount: result.frameCount,
      })
      ok++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({
        propertyId: prop.id,
        title: prop.title,
        status: 'fail',
        error: msg,
      })
      fail++
    }
  }

  return { ok, skip, fail, results }
}
