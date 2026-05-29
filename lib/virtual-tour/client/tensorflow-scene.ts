import type { SceneType } from '@/types/virtual-tour'

const IMAGENET_SCENE_MAP: Array<{ keywords: string[]; scene: SceneType }> = [
  { keywords: ['palace', 'monastery', 'vaulted', 'church', 'building'], scene: 'exterior_front' },
  { keywords: ['cliff', 'valley', 'alp', 'lakeside', 'seashore', 'promontory'], scene: 'terrace' },
  { keywords: ['restaurant', 'dining'], scene: 'dining_area' },
  { keywords: ['kitchen'], scene: 'kitchen' },
  { keywords: ['bedroom', 'four-poster', 'bunk'], scene: 'bedroom' },
  { keywords: ['bathroom', 'tub', 'shower'], scene: 'bathroom' },
  { keywords: ['living', 'studio', 'home', 'library', 'bookshop'], scene: 'living_room' },
  { keywords: ['corridor', 'elevator'], scene: 'corridor' },
  { keywords: ['hallway'], scene: 'hallway' },
  { keywords: ['staircase'], scene: 'staircase' },
  { keywords: ['door', 'shop', 'bakery', 'barbershop'], scene: 'entrance' },
]

let modelPromise: Promise<{
  classify: (img: HTMLImageElement | HTMLCanvasElement) => Promise<Array<{ className: string; probability: number }>>
}> | null = null

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs')
      await tf.ready()
      const mobilenet = await import('@tensorflow-models/mobilenet')
      const net = await mobilenet.load({ version: 2, alpha: 0.5 })
      return {
        classify: async (img: HTMLImageElement | HTMLCanvasElement) => {
          const preds = await net.classify(img, 5)
          return preds.map(p => ({ className: p.className, probability: p.probability }))
        },
      }
    })()
  }
  return modelPromise
}

function mapPredictions(
  preds: Array<{ className: string; probability: number }>
): { sceneType: SceneType; confidence: number } {
  let best: SceneType = 'unknown'
  let bestScore = 0
  for (const p of preds) {
    const lower = p.className.toLowerCase()
    for (const rule of IMAGENET_SCENE_MAP) {
      if (rule.keywords.some(k => lower.includes(k))) {
        const score = p.probability
        if (score > bestScore) {
          bestScore = score
          best = rule.scene
        }
      }
    }
  }
  return { sceneType: best, confidence: Math.round(bestScore * 10000) / 10000 }
}

export async function classifySceneTensorFlow(
  image: HTMLImageElement
): Promise<{ sceneType: SceneType; confidence: number; embedding?: number[] }> {
  try {
    const model = await loadModel()
    const preds = await model.classify(image)
    const mapped = mapPredictions(preds)
    const embedding = preds.map(p => p.probability)
    return { ...mapped, embedding }
  } catch {
    return { sceneType: 'unknown', confidence: 0 }
  }
}
