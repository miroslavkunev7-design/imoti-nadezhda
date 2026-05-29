declare global {
  interface Window {
    cv?: {
      Mat: new () => unknown
      matFromImageData: (img: ImageData) => unknown
      cvtColor: (src: unknown, dst: unknown, code: number) => void
      Canny: (src: unknown, dst: unknown, t1: number, t2: number) => void
      meanStdDev: (src: unknown, mean: unknown, stddev: unknown) => void
      COLOR_RGBA2GRAY: number
      delete: (m: unknown) => void
    }
  }
}

let loadPromise: Promise<typeof window.cv> | null = null

export function loadOpenCV(): Promise<typeof window.cv> {
  if (typeof window === 'undefined') return Promise.reject(new Error('OpenCV runs in browser only'))
  if (window.cv?.Mat) return Promise.resolve(window.cv)

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://docs.opencv.org/4.x/opencv.js'
      script.onload = () => {
        const wait = () => {
          if (window.cv?.Mat) resolve(window.cv)
          else setTimeout(wait, 80)
        }
        wait()
      }
      script.onerror = () => reject(new Error('OpenCV.js failed to load'))
      document.head.appendChild(script)
    })
  }
  return loadPromise
}

export async function computeOpenCVEdgeDensity(image: HTMLImageElement): Promise<number> {
  try {
    const cvLib = await loadOpenCV()
    if (!cvLib?.Mat) return 0
    const canvas = document.createElement('canvas')
    const w = 240
    const h = Math.round((image.naturalHeight / image.naturalWidth) * w) || 180
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    ctx.drawImage(image, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h)
    const src = cvLib.matFromImageData(imgData)
    const gray = new cvLib.Mat()
    const edges = new cvLib.Mat()
    cvLib.cvtColor(src, gray, cvLib.COLOR_RGBA2GRAY)
    cvLib.Canny(gray, edges, 50, 150)
    const data = (edges as { data: Uint8Array }).data
    let count = 0
    for (let i = 0; i < data.length; i++) if (data[i] > 0) count++
    cvLib.delete(src)
    cvLib.delete(gray)
    cvLib.delete(edges)
    return Math.min(1, count / data.length)
  } catch {
    return 0
  }
}
