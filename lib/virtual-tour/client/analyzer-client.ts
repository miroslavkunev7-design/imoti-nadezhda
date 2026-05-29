'use client'

import type { SceneType } from '@/types/virtual-tour'
import { classifySceneTensorFlow } from '@/lib/virtual-tour/client/tensorflow-scene'
import { computeOpenCVEdgeDensity } from '@/lib/virtual-tour/client/opencv-loader'
import { classifySceneFromFeatures } from '@/lib/virtual-tour/classifier'
import { mergeSceneClassification } from '@/lib/virtual-tour/classifier'
import type { ImageFeatures } from '@/types/virtual-tour'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Image load failed: ${url}`))
    img.src = url
  })
}

function extractClientFeatures(img: HTMLImageElement, edgeDensity: number): ImageFeatures {
  const canvas = document.createElement('canvas')
  const w = 160
  const h = Math.round((img.naturalHeight / img.naturalWidth) * w) || 120
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h).data
  const pixels = w * h
  let r = 0
  let g = 0
  let b = 0
  let bright = 0
  let sat = 0
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
  }
  const meanR = r / pixels
  const meanG = g / pixels
  const meanB = b / pixels
  const brightness = bright / pixels
  const saturation = sat / pixels
  const skyRatio = sky / pixels
  const greenScore = green / pixels
  const tileScore = tile / pixels
  const woodScore = wood / pixels
  const warmth = meanR / (meanR + meanG + meanB + 1)
  const indoorScore = Math.min(1, 1 - skyRatio * 1.4 + saturation * 0.25)
  return {
    meanR,
    meanG,
    meanB,
    brightness,
    saturation,
    contrast: 0.4,
    aspectRatio: img.naturalWidth / img.naturalHeight,
    edgeDensity,
    warmth,
    skyRatio,
    indoorScore,
    tileScore,
    woodScore,
    greenScore,
  }
}

export interface ClientAnalysisHint {
  sceneType: SceneType
  confidence: number
  embedding?: number[]
}

export async function analyzeImageClient(url: string): Promise<ClientAnalysisHint> {
  const img = await loadImage(url)
  const [tfResult, edgeDensity] = await Promise.all([
    classifySceneTensorFlow(img),
    computeOpenCVEdgeDensity(img),
  ])
  const features = extractClientFeatures(img, edgeDensity)
  features.edgeDensity = edgeDensity || features.edgeDensity
  const heuristic = classifySceneFromFeatures(features)
  const merged = mergeSceneClassification(
    heuristic.sceneType,
    heuristic.confidence,
    tfResult.sceneType !== 'unknown' ? tfResult.sceneType : undefined,
    tfResult.confidence
  )
  return {
    sceneType: merged.sceneType,
    confidence: merged.confidence,
    embedding: tfResult.embedding ?? undefined,
  }
}

export async function analyzeAllImagesClient(urls: string[]): Promise<ClientAnalysisHint[]> {
  const out: ClientAnalysisHint[] = []
  for (const url of urls) {
    try {
      out.push(await analyzeImageClient(url))
    } catch {
      out.push({ sceneType: 'unknown', confidence: 0 })
    }
  }
  return out
}
