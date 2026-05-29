import sharp from 'sharp'
import type { ImageFeatures, SceneAnalysisRecord, SceneType } from '@/types/virtual-tour'
import { classifySceneFromFeatures, mergeSceneClassification } from '@/lib/virtual-tour/classifier'
import { estimateDepth, estimateLightDirection, featuresToVector } from '@/lib/virtual-tour/features'

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith('/') && !url.startsWith('//')) {
      const { readFile } = await import('fs/promises')
      const { join } = await import('path')
      const path = join(process.cwd(), 'public', url.replace(/^\//, ''))
      return await readFile(path)
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

export async function extractImageFeatures(url: string): Promise<ImageFeatures | null> {
  const buf = await fetchImageBuffer(url)
  if (!buf) return null

  const img = sharp(buf).rotate()
  const meta = await img.metadata()
  const w = meta.width ?? 640
  const h = meta.height ?? 480
  const aspectRatio = w / h

  const resized = await img.resize(320, 240, { fit: 'inside' }).raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const { data, info } = resized
  const pixels = info.width * info.height
  let r = 0
  let g = 0
  let b = 0
  let bright = 0
  let sat = 0
  let edge = 0
  let sky = 0
  let green = 0
  let tile = 0
  let wood = 0

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i]
    const pg = data[i + 1]
    const pb = data[i + 2]
    r += pr
    g += pg
    b += pb
    const lum = (0.299 * pr + 0.587 * pg + 0.114 * pb) / 255
    bright += lum
    const max = Math.max(pr, pg, pb)
    const min = Math.min(pr, pg, pb)
    sat += max > 0 ? (max - min) / max : 0
    if (pb > pr + 18 && pb > pg + 10 && lum > 0.45) sky++
    if (pg > pr + 12 && pg > pb + 4) green++
    if (Math.abs(pr - pg) < 18 && Math.abs(pg - pb) < 18 && lum > 0.72) tile++
    if (pr > pg && pr > pb && lum > 0.28 && lum < 0.72) wood++
    if (i > 0 && i % (info.width * 4) === 0) {
      const prev = i - info.width * 4
      edge += Math.abs(data[i] - data[prev]) / 255
    }
  }

  const meanR = r / pixels
  const meanG = g / pixels
  const meanB = b / pixels
  const brightness = bright / pixels
  const saturation = sat / pixels
  const edgeDensity = Math.min(1, edge / pixels)
  const skyRatio = sky / pixels
  const greenScore = green / pixels
  const tileScore = tile / pixels
  const woodScore = wood / pixels
  const warmth = meanR / (meanR + meanG + meanB + 1)
  const indoorScore = Math.min(1, 1 - skyRatio * 1.4 + saturation * 0.25)

  const stats = await sharp(buf).stats()
  const contrast = stats.channels.reduce((s, c) => s + (c.stdev ?? 0), 0) / (stats.channels.length * 128)

  return {
    meanR,
    meanG,
    meanB,
    brightness,
    saturation,
    contrast: Math.min(1, contrast),
    aspectRatio,
    edgeDensity,
    warmth,
    skyRatio,
    indoorScore,
    tileScore,
    woodScore,
    greenScore,
  }
}

export async function analyzeImageServer(
  imageUrl: string,
  clientHint?: { sceneType: SceneType; confidence: number; embedding?: number[] }
): Promise<SceneAnalysisRecord | null> {
  const features = await extractImageFeatures(imageUrl)
  if (!features) return null

  const { sceneType: heuristicType, confidence: heuristicConf } = classifySceneFromFeatures(features)
  const { sceneType, confidence } = mergeSceneClassification(
    heuristicType,
    heuristicConf,
    clientHint?.sceneType,
    clientHint?.confidence
  )
  const light = estimateLightDirection(features)
  const depthEstimate = estimateDepth(features)
  const embedding = clientHint?.embedding ?? featuresToVector(features)

  return {
    imageUrl,
    sceneType,
    confidence,
    features,
    depthEstimate,
    lightAzimuth: light.azimuth,
    lightElevation: light.elevation,
    embedding,
  }
}

export async function analyzeImagesServer(
  urls: string[],
  clientHints?: Array<{ sceneType: SceneType; confidence: number; embedding?: number[] } | undefined>
): Promise<SceneAnalysisRecord[]> {
  const results: SceneAnalysisRecord[] = []
  for (let i = 0; i < urls.length; i++) {
    const row = await analyzeImageServer(urls[i], clientHints?.[i])
    if (row) results.push(row)
  }
  return results
}
